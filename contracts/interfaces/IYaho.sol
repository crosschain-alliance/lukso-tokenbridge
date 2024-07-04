// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IYaho {
    function dispatchMessage(
        uint256 targetChainId,
        uint256 threshold,
        address receiver,
        bytes calldata data,
        address[] calldata reporters,
        address[] calldata adapters
    ) external returns (uint256);
}
