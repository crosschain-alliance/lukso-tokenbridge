// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Mailbox} from "@hyperlane-xyz/core/contracts/Mailbox.sol";
import {IInterchainSecurityModule} from "@hyperlane-xyz/core/contracts/interfaces/IInterchainSecurityModule.sol";

import {HashiManager} from "./HashiManager.sol";
import {IJushin} from "./interfaces/IJushin.sol";

/// @title Hashi ISM (Interchain Security Module)
/// @author zeng
/// @dev Inherit security logic from Hashi
contract HashiISM is IJushin, IInterchainSecurityModule {
    bool public constant HASHI_IS_ENABLED = true;
    HashiManager hashiManager;

    mapping(bytes32 hashMsg => bool isApproved) isApprovedByHashi;

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
        address[] calldata adapters,
        bytes calldata data
    ) external returns (bytes memory) {
        _validateHashiMessage(sourceChainId, threshold, sender, adapters);
        bytes32 hashMsg = keccak256(abi.encodePacked(data));
        require(!isApprovedByHashi[hashMsg]);
        _setHashiApprovalForMessage(hashMsg, true);
        emit ApprovedByHashi(hashMsg, true);

        return data;
    }

    function _validateHashiMessage(
        uint256 chainId,
        uint256 threshold,
        address sender,
        address[] calldata adapters
    ) internal view{
        require(
            HASHI_IS_ENABLED &&
                msg.sender == hashiManager.getYaru() &&
                chainId == hashiManager.getTargetChainID() &&
                sender == hashiManager.getTargetAddress() &&
                threshold == hashiManager.getExpectedThreshold() &&
                keccak256(abi.encodePacked(adapters)) ==
                hashiManager.getExpectedAdaptersHash()
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
        require(
            isApprovedByHashi[
                keccak256(abi.encodePacked("messagesApprovedByHashi", hashMsg))
            ],
            "Message is not approved by Hashi"
        );
        return true;
    }

    /// @inheritdoc IInterchainSecurityModule
    function moduleType() external view returns (uint8){
        return uint8(Types.NULL);
    }
}
