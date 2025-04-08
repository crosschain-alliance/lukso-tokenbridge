# Hashi Message ID

The **Hashi Message ID** is a unique identifier for a Hashi message.  
It is **different** from the Hyperlane message ID or a transaction hash.

### 📄 [Message Struct Definition](https://github.com/gnosis/hashi/blob/main/packages/evm/contracts/interfaces/IMessage.sol)

```solidity
struct Message {
    uint256 nonce;
    uint256 targetChainId;
    uint256 threshold;
    address sender;
    address receiver;
    bytes data;
    IReporter[] reporters;
    IAdapter[] adapters;
}
```

1. How to calculate Hashi message id?
   Message id is calculated from `MessageIdCalculator` contract: [View source](https://github.com/gnosis/hashi/blob/main/packages/evm/contracts/utils/MessageIdCalculator.sol)

   ```solidity

   function calculateMessageId(
   uint256 sourceChainId,
   address dispatcherAddress,
   bytes32 messageHash
   ) public pure returns (uint256) {
   return uint256(keccak256(abi.encode(sourceChainId, dispatcherAddress, messageHash)));
   }

   ```

2. In which part of the flow is using hashi message id?

   1. In the source chain, calling transferRemote (specifically, HashiHook contract) will invoke `MessageDispatched (uint256 indexed messageId, Message message)` from Yaho contract ([example](https://etherscan.io/tx/0x7fc817bc2a852f1f0496e3ebafd8eb5767dea40f845e37a24b9c7e0933d4424f#eventlog)).
   2. In the destination chain, adapter contract will emit `HashStored` ([example](https://etherscan.io/tx/0x290f991e1b54f92d1a100f578c544704f310f05b5b6562671cd7364f66f25bda#eventlog))
   3. In the destination chain, calling Yaru.executeMessages will emit `MessageExecuted` ([example](https://etherscan.io/tx/0x15e95731dde4cad306558cb40f51e08956afae93546ff218d306bd7859885748#eventlog))
