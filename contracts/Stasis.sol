// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";
import { ISomniaReactivityPrecompile, SomniaExtensions } from "@somnia-chain/reactivity-contracts/contracts/interfaces/ISomniaReactivityPrecompile.sol";
import "./MockLendingPool.sol";

// Stasis: Autonomous on-chain DeFi guardian powered by Somnia Native Reactivity.
//
// Architecture:
//   1. Inherits SomniaEventHandler from the official reactivity-contracts package.
//   2. createSubscription() registers with the Somnia Reactivity Precompile (0x0100),
//      linking MockOracle.PriceDrop → this.onEvent() via the validator network.
//   3. When MockOracle emits PriceDrop, Somnia validators invoke onEvent()
//      IN THE SAME BLOCK — no off-chain bots, no polling.
//   4. The on-chain risk engine checks the drop threshold (20%).
//   5. If exceeded, MockLendingPool.pause() is called atomically.
//
// No off-chain bots. No Node.js. No AWS. 100% on-chain Somnia Reactivity.
contract Stasis is SomniaEventHandler {

    // keccak256("PriceDrop(int256,int256,uint256)")
    bytes32 public constant PRICE_DROP_TOPIC =
        keccak256("PriceDrop(int256,int256,uint256)");

    /// @notice 20% price drop triggers the guardian
    uint256 public constant THRESHOLD_BPS = 2000;

    address public oracle;
    MockLendingPool public lendingPool;
    address public owner;

    uint256 public subscriptionId;
    uint256 public totalInterventions;
    uint256 public lastDefendedAt;
    uint256 public lastDropBps;

    event ProtocolPaused(uint256 dropBps, int256 oldPrice, int256 newPrice, uint256 timestamp);
    event LendingPoolUpdated(address indexed oldPool, address indexed newPool);
    event ThresholdNotMet(uint256 dropBps, uint256 thresholdBps);
    event SubscriptionCreated(uint256 subscriptionId);
    event EventReceived(address emitter, bytes32 eventTopic, uint256 dropBps);

    modifier onlyOwner() {
        require(msg.sender == owner, "Stasis: Only owner");
        _;
    }

    constructor(address _oracle, address _lendingPool) {
        owner = msg.sender;
        oracle = _oracle;
        if (_lendingPool != address(0)) {
            lendingPool = MockLendingPool(payable(_lendingPool));
        }
    }

    /**
     * @notice Register the on-chain Reactivity subscription via the Somnia precompile.
     *         Links MockOracle.PriceDrop → this.onEvent() via the validator network.
     * @dev Subscription owner (caller) must hold ≥32 STT.
     */
    function createSubscription() external onlyOwner returns (uint256) {
        ISomniaReactivityPrecompile precompile =
            ISomniaReactivityPrecompile(SomniaExtensions.SOMNIA_REACTIVITY_PRECOMPILE_ADDRESS);

        bytes32[4] memory topics;
        topics[0] = PRICE_DROP_TOPIC; // filter: only PriceDrop events
        topics[1] = bytes32(0);
        topics[2] = bytes32(0);
        topics[3] = bytes32(0);

        ISomniaReactivityPrecompile.SubscriptionData memory data =
            ISomniaReactivityPrecompile.SubscriptionData({
                eventTopics:             topics,
                origin:                  address(0),       // any tx.origin
                caller:                  address(0),       // any msg.sender
                emitter:                 oracle,            // only this oracle
                handlerContractAddress:  address(this),     // Stasis handles it
                handlerFunctionSelector: this.onEvent.selector, // onEvent() is the public handler
                priorityFeePerGas:       1_000_000_000,    // 1 gwei
                maxFeePerGas:            100_000_000_000,   // 100 gwei
                gasLimit:                200_000,
                isGuaranteed:            true,
                isCoalesced:             false
            });

        uint256 subId = precompile.subscribe(data);
        subscriptionId = subId;
        emit SubscriptionCreated(subId);
        return subId;
    }

    /**
     * @notice Set the subscription ID manually (after EOA registration).
     */
    function setSubscriptionId(uint256 _id) external onlyOwner {
        subscriptionId = _id;
    }

    /**
     * @notice Set or update the lending pool address.
     */
    function setLendingPool(address _lendingPool) external onlyOwner {
        address oldPool = address(lendingPool);
        lendingPool = MockLendingPool(payable(_lendingPool));
        emit LendingPoolUpdated(oldPool, _lendingPool);
    }

    /**
     * @notice On-chain risk engine — called by Somnia validators via onEvent() wrapper.
     *         (onEvent() is defined in SomniaEventHandler and validates msg.sender == 0x0100)
     *
     * @param emitter   The contract that emitted the event.
     * @param eventTopics Event topics (topics[0] = event signature).
     * @param data      ABI-encoded non-indexed event parameters.
     */
    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        // Validate event source and signature
        require(emitter == oracle, "Stasis: Wrong oracle");
        require(
            eventTopics.length > 0 && eventTopics[0] == PRICE_DROP_TOPIC,
            "Stasis: Wrong event sig"
        );
        require(address(lendingPool) != address(0), "Stasis: Pool not set");

        // Decode PriceDrop(int256 oldPrice, int256 newPrice, uint256 dropBps)
        (int256 oldPrice, int256 newPrice, uint256 dropBps) =
            abi.decode(data, (int256, int256, uint256));

        // Emit debug event to track when this function is called
        emit EventReceived(emitter, eventTopics[0], dropBps);

        // Always update the last drop info for debugging
        lastDropBps = dropBps;
        lastDefendedAt = block.timestamp;

        // On-chain risk engine
        if (dropBps >= THRESHOLD_BPS) {
            totalInterventions++;
            lendingPool.pause();
            emit ProtocolPaused(dropBps, oldPrice, newPrice, block.timestamp);
        } else {
            emit ThresholdNotMet(dropBps, THRESHOLD_BPS);
        }
    }

    /**
     * @notice Manual trigger for testing - simulates what Somnia validators should do
     * @dev Only for debugging - remove in production
     */
    function manualTrigger(int256 oldPrice, int256 newPrice, uint256 dropBps) external onlyOwner {
        require(address(lendingPool) != address(0), "Stasis: Pool not set");
        
        // Emit debug event
        emit EventReceived(oracle, PRICE_DROP_TOPIC, dropBps);
        
        // Always update the last drop info for debugging
        lastDropBps = dropBps;
        lastDefendedAt = block.timestamp;

        // On-chain risk engine
        if (dropBps >= THRESHOLD_BPS) {
            totalInterventions++;
            lendingPool.pause();
            emit ProtocolPaused(dropBps, oldPrice, newPrice, block.timestamp);
        } else {
            emit ThresholdNotMet(dropBps, THRESHOLD_BPS);
        }
    }

    /**
     * @notice Get current guardian status.
     */
    function getStatus()
        external
        view
        returns (
            bool poolPaused,
            uint256 interventions,
            uint256 lastDefended,
            uint256 lastDrop
        )
    {
        poolPaused    = address(lendingPool) != address(0) ? lendingPool.paused() : false;
        interventions = totalInterventions;
        lastDefended  = lastDefendedAt;
        lastDrop      = lastDropBps;
    }
}
