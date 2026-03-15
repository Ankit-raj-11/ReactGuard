// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockOracle
 * @notice Simulates a price oracle for demo purposes.
 *         Emits a PriceDrop event when the price drops significantly.
 */
contract MockOracle {
    int256 public currentPrice;
    address public owner;

    // Threshold: 5% drop triggers the event (500 basis points)
    uint256 public constant DROP_THRESHOLD_BPS = 500;

    event PriceUpdated(int256 indexed oldPrice, int256 indexed newPrice);
    event PriceDrop(int256 oldPrice, int256 newPrice, uint256 dropBps);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(int256 _initialPrice) {
        currentPrice = _initialPrice;
        owner = msg.sender;
    }

    /**
     * @notice Update the oracle price. If the drop exceeds DROP_THRESHOLD_BPS,
     *         both PriceUpdated and PriceDrop events are emitted.
     */
    function setPrice(int256 _newPrice) external onlyOwner {
        int256 oldPrice = currentPrice;
        currentPrice = _newPrice;

        emit PriceUpdated(oldPrice, _newPrice);

        if (oldPrice > 0 && _newPrice < oldPrice) {
            // Calculate drop in basis points
            uint256 dropBps = uint256((oldPrice - _newPrice) * 10000 / oldPrice);
            if (dropBps >= DROP_THRESHOLD_BPS) {
                emit PriceDrop(oldPrice, _newPrice, dropBps);
            }
        }
    }

    /**
     * @notice Get the current price.
     */
    function getPrice() external view returns (int256) {
        return currentPrice;
    }
}
