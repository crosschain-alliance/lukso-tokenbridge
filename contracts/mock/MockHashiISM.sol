// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Mailbox} from "@hyperlane-xyz/core/contracts/Mailbox.sol";
import {IInterchainSecurityModule} from "@hyperlane-xyz/core/contracts/interfaces/IInterchainSecurityModule.sol";

import {HashiManager} from "../HashiManager.sol";
import {IJushin} from "../../hashi/packages/evm/contracts/interfaces/IJushin.sol";
import {IAdapter} from "../../hashi/packages/evm/contracts/interfaces/IAdapter.sol";
/// @title Hashi ISM (Interchain Security Module)
/// @author Cross-Chain Alliance
/// @dev Inherit security logic from Hashi
contract MockHashiISM is IJushin, IInterchainSecurityModule {
    bool public constant HASHI_IS_ENABLED = true;
    HashiManager hashiManager;

    mapping(bytes32 hashMsg => bool isApproved) isApprovedByHashi;
    event isMessageApprovedByHashi(
        bool indexed isApprovedByHashi,
        bytes32 indexed messageId,
        bytes message
    );
    event ApprovedByHashi(bytes32 indexed hashMsg, bool indexed isApproved);

    constructor(address hashiManager_) {
        hashiManager = HashiManager(hashiManager_);
    }

    /// @inheritdoc IJushin
    /// @notice called by Yaru during execute messages
    function onMessage(
        uint256 /* messageId*/,
        uint256 sourceChainId,
        address sender,
        uint256 threshold,
        IAdapter[] calldata adapters,
        bytes calldata data
    ) external returns (bytes memory) {
        _validateHashiMessage(sourceChainId, threshold, sender, adapters);
        bytes32 hashMsg = keccak256(abi.encodePacked(data));
        require(!isApprovedByHashi[hashMsg], "Msg has been approved by Hashi");
        _setHashiApprovalForMessage(hashMsg, true);
        emit ApprovedByHashi(hashMsg, true);

        return data;
    }

    function _validateHashiMessage(
        uint256 chainId,
        uint256 threshold,
        address sender,
        IAdapter[] calldata adapters
    ) internal view {
        require(msg.sender == hashiManager.getYaru(), "msg Sender is not Yaru");
        require(
            chainId == hashiManager.getTargetChainID(),
            "Incorrect chainID"
        );
        require(sender == hashiManager.getTargetAddress(), "Incorrect Sender");
        require(
            threshold == hashiManager.getExpectedThreshold(),
            "Incorrect threshold"
        );
        require(
            keccak256(abi.encodePacked(adapters)) ==
                hashiManager.getExpectedAdaptersHash(),
            "Incorrect adapters"
        );
    }

    function _setHashiApprovalForMessage(
        bytes32 hashMsg,
        bool isApproved
    ) internal {
        isApprovedByHashi[
            keccak256(abi.encodePacked("messagesApprovedByHashi", hashMsg))
        ] = isApproved;
    }

    /// @inheritdoc IInterchainSecurityModule
    /// @notice called by Mailbox during process()
    function verify(
        bytes calldata /*_metadata*/,
        bytes calldata _message
    ) external returns (bool) {
        bytes32 hashMsg = keccak256(abi.encodePacked(_message));
        // in Mock Hashi ISM, it will not revert
        bool isApproved = isApprovedByHashi[
            keccak256(abi.encodePacked("messagesApprovedByHashi", hashMsg))
        ];
        emit isMessageApprovedByHashi(
            isApproved,
            keccak256(abi.encodePacked("messagesApprovedByHashi", hashMsg)),
            _message
        );
        return true;
    }

    /// @inheritdoc IInterchainSecurityModule
    function moduleType() external view returns (uint8) {
        return uint8(Types.NULL);
    }
}
