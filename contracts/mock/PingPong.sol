// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.20;

import { IJushin } from "../../hashi/packages/evm/contracts/interfaces/IJushin.sol";
import { IAdapter } from "../../hashi/packages/evm/contracts/interfaces/IAdapter.sol";
import { IReporter } from "../../hashi/packages/evm/contracts/interfaces/IReporter.sol";
import { IYaho } from "../../hashi/packages/evm/contracts/interfaces/IYaho.sol";

contract PingPong is IJushin {
    uint256 public count;

    event Pong(uint256 count);

    IYaho yaho;
    uint256 targetChainId;
    address peerPingPong;

    constructor(address yaho_, uint256 targetChainId_) {
        yaho = IYaho(yaho_);
        targetChainId = targetChainId_;
    }

    function setPeerPingPong(address pingpong) public {
        peerPingPong = pingpong;
    }

    function ping(
        address[] calldata reporter,
        address[] calldata adapter
    ) external payable {
        IReporter[] memory reporters = new IReporter[](reporter.length);
        IAdapter[] memory adapters = new IAdapter[](adapter.length);
        for (uint256 i = 0; i < reporter.length; i++) {
            reporters[i] = IReporter(reporter[i]);
            adapters[i] = IAdapter(adapter[i]);
        }
        count++;
        yaho.dispatchMessageToAdapters{value: msg.value}(
            targetChainId,
            1,
            peerPingPong,
            hex"00",
            reporters,
            adapters
        );
        emit Pong(count);
    }

    function onMessage(
        uint256,
        uint256,
        address,
        uint256,
        IAdapter[] calldata,
        bytes calldata
    ) external returns (bytes memory) {
        count++;
        emit Pong(count);
        return abi.encode(0);
    }


}
