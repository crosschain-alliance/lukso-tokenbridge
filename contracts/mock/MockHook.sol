// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockHook {
    function postDispatch(
        bytes calldata metadata,
        bytes calldata message
    ) external {}
}
