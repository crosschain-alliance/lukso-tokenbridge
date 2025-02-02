// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AbstractAggregationIsm} from "@hyperlane-xyz/core/contracts/isms/aggregation/AbstractAggregationIsm.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title AggregationISM for Hashi ISM as one of the required ISM
/// @author Cross-Chain Alliance
/// @dev https://docs.hyperlane.xyz/docs/reference/ISM/aggregation-ISM-interface
contract AggregationISM is AbstractAggregationIsm, Ownable {
    address public hashiISM;
    address public multisigISM;
    address public defaultISM;
    uint8 public threshold;

    /// @inheritdoc AbstractAggregationIsm
    function modulesAndThreshold(
        bytes calldata /*_message*/
    ) public view override returns (address[] memory, uint8) {
        address[] memory isms = new address[](2);
        isms[0] = hashiISM;
        isms[1] = multisigISM;
        return (isms, threshold);
    }

    function setRequiredModulesAndThreshold(
        address[] memory isms,
        uint8 threshold_
    ) external onlyOwner {
        require(isms.length >= 2, "invalid ISM array");
        require(threshold <= isms.length, "invalid threshold");
        hashiISM = isms[0];
        multisigISM = isms[1];
        threshold = threshold_;
    }
}
