// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockISM {
    event MockISMCalled(bool indexed isCalled);
    function verify(
        bytes calldata /*_metadata*/,
        bytes calldata /*_message*/
    ) public returns (bool) {
        emit MockISMCalled(true);
        return true;
    }
}
