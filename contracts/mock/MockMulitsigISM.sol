// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.0;

import {AbstractMultisigIsm} from "@hyperlane-xyz/core/contracts/isms/multisig/AbstractMultisigIsm.sol";

abstract contract MockMulitisigISM is AbstractMultisigIsm {

    address[] public validators;
    uint8 public threshold;

    event ValidatorsAndThresholdSet(address[] validators, uint8 threshold);

    constructor(address[] memory _validators, uint8 _threshold) {
        validators = _validators;
        threshold = _threshold;
    }

    function setValidatorsAndThreshold(
        address[] memory _validators,
        uint8 _threshold
    ) public {
        require(
            0 < _threshold && _threshold <= _validators.length,
            "Invalid threshold"
        );
        validators = _validators;
        threshold = _threshold;
        emit ValidatorsAndThresholdSet(_validators, _threshold);
    }

    function validatorsAndThreshold(
        bytes calldata /* _message */
    ) public view override returns (address[] memory, uint8) {
        return (validators, threshold);
    }

    // Virtual function from either Merkle tree or MessageId

    function digest(
        bytes calldata _metadata,
        bytes calldata _message
    ) internal pure override returns (bytes32) {
        return
            hex"0000000000000000000000000000000000000000000000000000000000000000";
        // return
        //     CheckpointLib.digest(
        //         _message.origin(),
        //         _metadata.originMerkleTreeHook(),
        //         _metadata.root(),
        //         _metadata.index(),
        //         _message.id()
        //     );
    }

    function signatureAt(
        bytes calldata _metadata,
        uint256 _index
    ) internal pure virtual override returns (bytes calldata) {
        // return _metadata.signatureAt(_index);
        return _metadata;
    }

    function signatureCount(
        bytes calldata _metadata
    ) public pure returns (uint256) {
        // return _metadata.signatureCount();
        return 1;
    }
}
