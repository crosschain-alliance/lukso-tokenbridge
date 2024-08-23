// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockISM {

    function verify(
        bytes calldata /*_metadata*/,
        bytes calldata /*_message*/
    ) public returns (bool) {
        return true;
    }
}
