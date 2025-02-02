// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AbstractPostDispatchHook} from "@hyperlane-xyz/core/contracts/hooks/libs/AbstractPostDispatchHook.sol";
import {IPostDispatchHook} from "@hyperlane-xyz/core/contracts/interfaces/hooks/IPostDispatchHook.sol";
contract MockHook is AbstractPostDispatchHook {
    event MockHookCalled(bool indexed isCalled);
    function _postDispatch(
        bytes calldata /*metadata*/,
        bytes calldata message
    ) internal override {
        emit MockHookCalled(true);
    }

    function _quoteDispatch(
        bytes calldata /*metadata*/,
        bytes calldata message
    ) internal view override returns (uint256) {
        return 0;
    }

    function hookType() external view returns (uint8) {
        return uint8(IPostDispatchHook.Types.UNUSED);
    }
}
