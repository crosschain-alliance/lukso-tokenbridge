// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Message} from "../../hashi/packages/evm/contracts/interfaces/IMessage.sol";
import { IAdapter } from "../../hashi/packages/evm/contracts/interfaces/IAdapter.sol";
import { IReporter } from "../../hashi/packages/evm/contracts/interfaces/IReporter.sol";

contract MockYaho {
    uint256 public currentNonce;

    event MessageDispatched(uint256 indexed messageId, Message message);

    function dispatchMessage(
        uint256 targetChainId,
        uint256 threshold,
        address receiver,
        bytes calldata data,
        address[] calldata reporters,
        address[] calldata adapters
    ) external returns (uint256, bytes32[] memory) {

        IReporter[] memory hashiReporters = new IReporter[](reporters.length);
        IAdapter[] memory hashiAdapters = new IAdapter[](adapters.length);
        for (uint256 i = 0; i < reporters.length; i++) {
            hashiReporters[i] = IReporter(reporters[i]);
            hashiAdapters[i] = IAdapter(adapters[i]);
        }
        Message memory message = Message(
            currentNonce,
            targetChainId,
            threshold,
            msg.sender,
            receiver,
            data,
            hashiReporters,
            hashiAdapters
        );

        uint256 messageId = currentNonce;
        bytes32 mockMessageHash = keccak256(
            abi.encode(
                messageId,
                targetChainId,
                threshold,
                msg.sender,
                receiver,
                data,
                reporters,
                adapters
            )
        );

        uint256[] memory messageIds = new uint256[](1);
        bytes32[] memory messageHashes = new bytes32[](1);
        messageIds[0] = messageId;
        messageHashes[0] = mockMessageHash;

        bytes32[] memory receipts = new bytes32[](reporters.length);
        for (uint256 i = 0; i < reporters.length; i++) {
            receipts[i] = bytes32(i);
        }

        emit MessageDispatched(messageId, message);
        currentNonce += 1;

        return (messageId, receipts);
    }
}
