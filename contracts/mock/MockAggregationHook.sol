// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.0;

import {IPostDispatchHook} from "@hyperlane-xyz/core/contracts/interfaces/hooks/IPostDispatchHook.sol";
import {AbstractPostDispatchHook} from "@hyperlane-xyz/core/contracts/hooks/libs/AbstractPostDispatchHook.sol";

contract MockStaticAggregationHook is AbstractPostDispatchHook {
    address[] public aggregationHooks;

    constructor(address[] memory hooks_) {
        for (uint256 i = 0; i < hooks_.length; i++) {
            aggregationHooks[i] = hooks_[i];
        }
    }

    function hookType() external pure override returns (uint8) {
        return uint8(IPostDispatchHook.Types.AGGREGATION);
    }

    /// @inheritdoc AbstractPostDispatchHook
    function _postDispatch(
        bytes calldata metadata,
        bytes calldata message
    ) internal override {
        address[] memory _hooks = hooks(message);
        uint256 count = _hooks.length;
        for (uint256 i = 0; i < count; i++) {
            uint256 quote = IPostDispatchHook(_hooks[i]).quoteDispatch(
                metadata,
                message
            );

            IPostDispatchHook(_hooks[i]).postDispatch{value: quote}(
                metadata,
                message
            );
        }
    }

    /// @inheritdoc AbstractPostDispatchHook
    function _quoteDispatch(
        bytes calldata metadata,
        bytes calldata message
    ) internal view override returns (uint256) {
        address[] memory _hooks = hooks(message);
        uint256 count = _hooks.length;
        uint256 total = 0;
        for (uint256 i = 0; i < count; i++) {
            total += IPostDispatchHook(_hooks[i]).quoteDispatch(
                metadata,
                message
            );
        }
        return total;
    }

    // Replace the hooks() of original StaticAggregationHook.sol with setter and gettter functioin instead of MetaProxy standard
    function hooks(bytes calldata) public view returns (address[] memory) {
        return aggregationHooks;
        // return abi.decode(MetaProxy.metadata(), (address[]));
    }
}
