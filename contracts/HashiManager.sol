// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract HashiManager is Ownable {
    address[] adapters;
    address[] reporters;
    address yaho;
    address yaru;
    address targetAddress;
    uint256 targetChainID;
    uint8 threshold;
    uint8 expectedThreshold;
    bytes32 expectedAdaptersHash;

    function setReportersAdaptersAndThreshold(
        address[] calldata reporters_,
        address[] calldata adapters_,
        uint8 threshold_
    ) external onlyOwner {
        reporters = reporters_;
        adapters = adapters_;
        threshold = threshold_;
    }

    function setExpectedAdaptersHash(
        address[] calldata adapters_
    ) external onlyOwner {
        expectedAdaptersHash = keccak256(abi.encodePacked(adapters_));
    }

    function setExpectedThreshold(uint8 expectedThreshold_) external onlyOwner {
        expectedThreshold = expectedThreshold_;
    }

    function setYaho(address yaho_) external onlyOwner {
        yaho = yaho_;
    }

    function setYaru(address yaru_) external onlyOwner {
        yaru = yaru_;
    }

    function setTargetAddress(address targetAddress_) external onlyOwner {
        targetAddress = targetAddress_;
    }

    function setTargetChainId(uint256 targetChainId_) external onlyOwner {
        targetChainID = targetChainId_;
    }

    function getAdapters() external view returns (address[] memory) {
        return adapters;
    }

    function getReporters() external view returns (address[] memory) {
        return reporters;
    }

    function getTargetChainID() external view returns (uint256) {
        return targetChainID;
    }

    function getTargetAddress() external view returns (address) {
        return targetAddress;
    }

    function getYaho() external view returns (address) {
        return yaho;
    }

    function getYaru() external view returns (address) {
        return yaru;
    }

    function getThreshold() external view returns (uint8) {
        return threshold;
    }

    function getExpectedThreshold() external view returns (uint8) {
        return expectedThreshold;
    }

    function getExpectedAdaptersHash() external view returns (bytes32) {
        return expectedAdaptersHash;
    }
}
