// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {AbstractPostDispatchHook} from "@hyperlane-xyz/core/contracts/hooks/libs/AbstractPostDispatchHook.sol";
import {IPostDispatchHook} from "@hyperlane-xyz/core/contracts/interfaces/hooks/IPostDispatchHook.sol";
import {Message} from "@hyperlane-xyz/core/contracts/libs/Message.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IAdapter} from "../hashi/packages/evm/contracts/interfaces/IAdapter.sol";
import {IReporter} from "../hashi/packages/evm/contracts/interfaces/IReporter.sol";
import {IYaho} from "../hashi/packages/evm/contracts/interfaces/IYaho.sol";
import {HashiManager} from "./HashiManager.sol";

/// @title Hashi Hook
/// @author Cross-Chain Alliance
/// @dev Post dispatch logic from Hashi
contract HashiHook is AbstractPostDispatchHook, Ownable {
    using Message for bytes;
    using TypeCasts for bytes32;

    address public mailbox;
    address public hashiISM;
    HashiManager public hashiManager;

    constructor(address mailbox_, address hashiManager_, address hashiISM_) {
        mailbox = mailbox_;
        hashiManager = HashiManager(hashiManager_);
        hashiISM = hashiISM_;
    }

    /// @notice set new mailbox address
    /// @param _mailBox new mail box address
    function setMailbox(address _mailBox) external onlyOwner {
        require(_mailBox != address(0), "Invalid Mailbox address");
        mailbox = _mailBox;
    }

    /// @notice set new Hashi ISM address
    /// @param _hashiISM new hashiISM address
    function setHashiISM(address _hashiISM) external onlyOwner {
        require(_hashiISM != address(0), "Invalid Hashi ISM address");
        hashiISM = _hashiISM;
    }

    /// @notice set new hashi manager address
    /// @param _hashiManager new _hashiManager address
    function setHashiManager(address _hashiManager) external onlyOwner {
        require(_hashiManager != address(0), "Invalid Hashi Manager address");
        hashiManager = HashiManager(_hashiManager);
    }

    /// @inheritdoc IPostDispatchHook
    function hookType() external pure override returns (uint8) {
        return uint8(IPostDispatchHook.Types.UNUSED);
    }

    /// @inheritdoc AbstractPostDispatchHook
    /// @notice called by mailbox within dispatch function
    /// @param message message to dispatch
    function _postDispatch(
        bytes calldata /*metadata*/,
        bytes calldata message
    ) internal override {
        address[] memory hashiReporter = hashiManager.getReporters();
        address[] memory hashiAdapter = hashiManager.getAdapters();
        IReporter[] memory reporters = new IReporter[](hashiReporter.length);
        IAdapter[] memory adapters = new IAdapter[](hashiAdapter.length);
        for (uint256 i = 0; i < reporters.length; i++) {
            reporters[i] = IReporter(hashiReporter[i]);
            adapters[i] = IAdapter(hashiAdapter[i]);
        }

        require(hashiReporter.length > 0, "invalid reporter length");
        require(hashiAdapter.length > 0, "invalid adapter length");

        IYaho(hashiManager.getYaho()).dispatchMessage(
            hashiManager.getTargetChainID(),
            uint256(hashiManager.getThreshold()),
            hashiISM, // recipient of the Hashi message
            message,
            reporters,
            adapters
        );
    }

    /// @inheritdoc AbstractPostDispatchHook
    /// @notice called by mailbox within dispatch function
    /// @param message message to dispatch
    /// @return return fee required to pass message through yaho
    function _quoteDispatch(
        bytes calldata /*metadata*/,
        bytes calldata message
    ) internal view override returns (uint256) {
        return 0;
    }
}
