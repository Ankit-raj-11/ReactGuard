// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockLendingPool
 * @notice Simulates a DeFi lending pool that can be paused by its guardian (ReactGuard).
 *         Only the guardian (ReactGuard contract) can call pause().
 *         The deployer (owner) can unpause for demo/reset purposes.
 */
contract MockLendingPool {
    bool public paused;

    /// @notice The ReactGuard contract — the ONLY address allowed to pause this pool
    address public guardian;

    /// @notice The deployer — allowed to unpause (for demo resets)
    address public owner;

    uint256 public totalDeposits;
    uint256 public totalBorrows;

    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event Deposited(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);

    modifier onlyGuardian() {
        require(msg.sender == guardian, "MockLendingPool: Only Guardian can pause");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "MockLendingPool: Only owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "MockLendingPool: Pool is paused");
        _;
    }

    /**
     * @param _guardian The ReactGuard contract address. Only it can pause.
     */
    constructor(address _guardian) {
        guardian = _guardian;
        owner = msg.sender;
        paused = false;
    }

    /**
     * @notice Pause the pool. Only callable by the ReactGuard guardian contract.
     */
    function pause() external onlyGuardian {
        paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @notice Unpause the pool. Callable by the deployer (for demo resets only).
     *         In production this would require governance or a timelock.
     */
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @notice Deposit ETH into the pool (demo only).
     */
    function deposit() external payable whenNotPaused {
        totalDeposits += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Borrow from the pool (demo only). Reverts when paused.
     */
    function borrow(uint256 amount) external whenNotPaused {
        require(amount <= address(this).balance, "Insufficient liquidity");
        totalBorrows += amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        emit Borrowed(msg.sender, amount);
    }

    receive() external payable {}
}
