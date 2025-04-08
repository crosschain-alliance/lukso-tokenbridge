# End to End Test

This doc outlines the end to end transactions calls for a bridge transaction, with the threshold of 3/3 in ISM. The information regarding off chain components can be found [here](./OffchainComponents.md).

## Ethereum -> LUKSO

### Example 1:

https://explorer.hyperlane.xyz/message/0x81f072b8892222d78987467811153cecd3bfd6823811a469ec2e166417403c2b

1. ERC20Token.approve
2. HypERC20Collateral.transferRemote: https://etherscan.io/tx/0x7fc817bc2a852f1f0496e3ebafd8eb5767dea40f845e37a24b9c7e0933d4424f
3. SP1 Helios.update: https://explorer.execution.mainnet.lukso.network/tx/0xbebb0eb895c6b0a534cc1ca4a043ba545508006b0c6cd82e7ac59bcbd25ed40e
4. SP1 Helios adapter.verifyAndStoreDispatchedMessage: https://explorer.execution.mainnet.lukso.network/tx/0xea9a462276722cc69e91f1da300076defc6916deb6bb229602c82625ed97a059
5. Yaru.executeMessages: https://explorer.execution.mainnet.lukso.network/tx/0x8aa75e102760b1d59fb72d02a80dc322922468b8c50e4f01bbd3771e650d0a5c
6. Mailbox.process: https://explorer.execution.mainnet.lukso.network/tx/0xbb8b069cbf78a9175a5b4087a47f1876f0d92853a7c12b8029c14abf61454da1

### Example 2:

https://explorer.hyperlane.xyz/message/0x97721d9d08f78fd1d24bdd2615e7f7c88c1da14dbaf2e45fd443ef5de095c172

1. ERC20Token.approve
2. HyperlaneErc20Colalteral.transferRemote: https://etherscan.io/tx/0xbdf1e6c5bdf5654060cf32a768f4d47324843f6b0925e233d8cac4a21124429c
3. SP1 Helios.update: https://explorer.execution.mainnet.lukso.network/tx/0xbebb0eb895c6b0a534cc1ca4a043ba545508006b0c6cd82e7ac59bcbd25ed40e
4. SP1 Helios adapter.verifyAndStoreDispatchedMessage: https://explorer.execution.mainnet.lukso.network/tx/0xea9a462276722cc69e91f1da300076defc6916deb6bb229602c82625ed97a059
5. Yaru.executeMessages: https://explorer.execution.mainnet.lukso.network/tx/0x8aa75e102760b1d59fb72d02a80dc322922468b8c50e4f01bbd3771e650d0a5c
6. Mailbox.process: https://explorer.execution.mainnet.lukso.network/tx/0xbb8b069cbf78a9175a5b4087a47f1876f0d92853a7c12b8029c14abf61454da1

## LUKSO -> Ethereum

### Example 1:

https://explorer.hyperlane.xyz/message/0xe0ede23790df547859cdff62ed16de7358c95798b16e996f23cf1615d5e9001f

1. HypERC20.transferRemote: https://explorer.execution.mainnet.lukso.network/tx/0xeff2f50094cc680044a89b7fcf4e2bf2760ce14f49bed0241ac3e8723c07bf93
2. SP1 Helios.update: https://etherscan.io/tx/0x0ffc9c5c097a5910b12160f63a7b09f3d4fe8025412d6d5e10daa00c0a53d106
3. SP1 Helios Adapter.verifyAndStoreDispatchedMessage: https://etherscan.io/tx/0x406ad08e1431388d4a2d404579da272fe2e0df71fcea649420b4d288020c7132
4. Yaru.executeMessages: https://etherscan.io/tx/0x0fe7387e92e151077106236a289defc8959247691bd839a88278ee647c6da52e
5. Mailbox.process: https://etherscan.io/tx/0xd48ba42e5cb8634c4627f2fc868aefbb93adba4b0aeb2e9820d5a187128a96e9

### Example 2:

https://explorer.hyperlane.xyz/message/0xd4b3e39e35569e1160f914ea49864d903b190b5904cdba3d72cdec84e55cadab

1. HypERC20.transferRemote: https://explorer.execution.mainnet.lukso.network/tx/0xc6d7f01c9dfc6b50c7090885e7281d3aed907dc660b7618189f3bedb31ac363a
2. SP1 Helios.update: https://etherscan.io/tx/0x27fbaf16eded46170e147bec3546280bd131596d50190296bdc4386bd1bc9555
3. SP1 Helios Adapter.verifyAndStoreDispatchedMessage: https://etherscan.io/tx/0x290f991e1b54f92d1a100f578c544704f310f05b5b6562671cd7364f66f25bda
4. Yaru.executeMessages: https://etherscan.io/tx/0x15e95731dde4cad306558cb40f51e08956afae93546ff218d306bd7859885748
5. Mailbox.process https://etherscan.io/tx/0xa60bbc77968c18fa68c1443fa1daf1624fcc6c7b50601637338a95a23ddb507b
