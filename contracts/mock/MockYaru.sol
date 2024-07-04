// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MockYaho.sol";
import "../interfaces/IMessage.sol";
import {IJushin} from "../interfaces/IJushin.sol";

contract MockYaru {
    uint256 public immutable SOURCE_CHAIN_ID;

    constructor(uint256 sourceChainId) {
        SOURCE_CHAIN_ID = sourceChainId;
    }

    function executeMessages(Message[] calldata messages) external {
        for (uint256 i = 0; i < messages.length; i++) {
            Message memory message = messages[i];
            uint256 messageId = i; // NOTE: mock

            IJushin(message.receiver).onMessage(
                messageId,
                SOURCE_CHAIN_ID,
                message.sender,
                message.threshold,
                message.adapters,
                message.data
            );
        }
    }
}
