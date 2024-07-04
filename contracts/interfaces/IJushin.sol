// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IJushin {
    function onMessage(
        uint256 messageId,
        uint256 sourceChainId,
        address sender,
        uint256 threshold,
        address[] calldata adapters,
        bytes calldata data
    ) external returns (bytes memory);
}
