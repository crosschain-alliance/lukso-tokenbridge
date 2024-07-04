// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMessageRecipient {
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external payable;
}

contract MockRecipient is IMessageRecipient {
    event HandledByRecipient(
        uint32 indexed origin,
        bytes32 indexed sender,
        bytes message
    );
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external payable {
        emit HandledByRecipient(_origin, _sender, _message);
    }

    function interchainSecurityModule() external {}
}
