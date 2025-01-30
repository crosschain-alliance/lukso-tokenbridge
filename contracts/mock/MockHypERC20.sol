// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {HypERC20} from "@hyperlane-xyz/core/contracts/token/HypERC20.sol";
import {IInterchainSecurityModule } from "@hyperlane-xyz/core/contracts/interfaces/IInterchainSecurityModule.sol";
contract MockHypERC20 is HypERC20 {


    address public hashiism;
    constructor(
        uint8 __decimals,
        address _mailbox
    ) HypERC20(__decimals, _mailbox) {}


    function setHashiISM(address ism) public {
        hashiism = ism;
    }


}
