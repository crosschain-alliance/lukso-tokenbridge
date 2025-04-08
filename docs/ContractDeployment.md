# Contract deployments

This doc outlines the deployed contracts for Hashi related contracts.

## Ethereum

### Hyperlane components

1. StaticAggregationHook: [0xe42216a313d224658cfc324415005f771a3e7e96](https://etherscan.io/address/0xe42216a313d224658cfc324415005f771a3e7e96)
   - [Default Hook](https://github.com/hyperlane-xyz/hyperlane-registry/blob/main/chains/ethereum/addresses.yaml#L4) +[Hashi Hook](https://etherscan.io/address/0x050c0c205ceB17d7388F9B0e45919Ba82480D93b)
2. StaticAggregationISM:
   - [Default ISM](https://github.com/hyperlane-xyz/hyperlane-registry/blob/main/chains/ethereum/addresses.yaml#L8) + [MultisigISM (LUKSO validator)](https://etherscan.io/address/0x65b9b2ad51e38cdc8e62dd0c3c19995267dc177c)(0x936b6a667E4334cA58e09A7C3d0D0265d1432A8C) + [Hashi ISM](https://etherscan.io/address/0x54F42816229F0022c2EcD4d05c9f823a9d7F3093)
   - Threshold: 3/3 [0x10c82311163218d6ec8cfb42a6441f1794b5b579](https://etherscan.io/address/0x10c82311163218d6ec8cfb42a6441f1794b5b579)
   - Threshold: 2/3 [0x14db211592d31302962e74ecf4c5f6eb6ee3d783](https://etherscan.io/address/0x14db211592d31302962e74ecf4c5f6eb6ee3d783)

### Hashi Componetns

1. Hashi Hook: [0x050c0c205ceB17d7388F9B0e45919Ba82480D93b](https://etherscan.io/address/0x050c0c205ceB17d7388F9B0e45919Ba82480D93b)
2. Hashi ISM:[0x54F42816229F0022c2EcD4d05c9f823a9d7F3093](https://etherscan.io/address/0x54F42816229F0022c2EcD4d05c9f823a9d7F3093)
3. Hashi Manager: [0xa1836695013CE41C487a6DbDD0AB137dB603f036](https://etherscan.io/address/0xa1836695013CE41C487a6DbDD0AB137dB603f036#code)
4. SP1Helios: [0x8F9e162480CCc831EE2B038a14eF6B1b4f12D5Be](https://etherscan.io/address/0x8F9e162480CCc831EE2B038a14eF6B1b4f12D5Be#readContract)
5. SP1HeliosAdapter: [0xc039e9A0668250C79692db06889CEAF380578c6e](https://etherscan.io/address/0xc039e9A0668250C79692db06889CEAF380578c6e)
6. Yaho: [0xbAE4Ebbf42815BB9Bc3720267Ea4496277d60DB8](https://etherscan.io/address/0xbAE4Ebbf42815BB9Bc3720267Ea4496277d60DB8)
7. Yaru(w.r.t LUKSO): [0x5e499f1845dEE19FD1eFdD4A9bf17c21446f613E](https://etherscan.io/address/0x5e499f1845dEE19FD1eFdD4A9bf17c21446f613E#readContract)
8. Hashi: [0xA86bc62Ac53Dc86687AB6C15fdebC71ad51fB615](https://etherscan.io/address/0xA86bc62Ac53Dc86687AB6C15fdebC71ad51fB615)

## LUKSO

### Hyperlane componetns

1.  StaticAggregationHook: [0xd9ea210350751d5c7323abcaadebacd9d1960505](https://explorer.execution.mainnet.lukso.network/address/0xd9ea210350751d5c7323abcaadebacd9d1960505)
    - [Default Hook](https://github.com/hyperlane-xyz/hyperlane-registry/blob/main/chains/lukso/addresses.yaml#L4) + [Hashi Hook](https://explorer.lukso.network/address/0xd270F259198340da5987a350b04b88139D304562)
2.  StaticAggregationISM:
    - [Default ISM](https://github.com/hyperlane-xyz/hyperlane-registry/blob/main/chains/lukso/addresses.yaml#L8) + [MulitsigISM (LUKSO validator)](https://explorer.execution.mainnet.lukso.network/address/0xa03eE82a353646c0047e607d7DcafF3de59BE628)(0x4e2555edeC23C92F135D6155BC6ccC8Ee57a6BD6) + [Hashi ISM]()
    - Threshold: 3/3 [0xf8199F8E39e1D7B70062E27AE1Fd0C0E778b6752](https://explorer.execution.mainnet.lukso.network/address/0xf8199F8E39e1D7B70062E27AE1Fd0C0E778b6752)
    - Threshold: 2/3 [0x0267f3ad580269b8ace60fa4d8b16bfd92cee2c9](https://explorer.execution.mainnet.lukso.network/address/0x0267f3ad580269b8ace60fa4d8b16bfd92cee2c9)

### Hashi components

1.  Hashi Hook:[0xd270F259198340da5987a350b04b88139D304562](https://explorer.lukso.network/address/0xd270F259198340da5987a350b04b88139D304562)
2.  Hashi ISM:[0xdB5BfacbEa5ff1Dee5d8aACB48021c6F6Bc59930](https://explorer.execution.mainnet.lukso.network/address/0xdB5BfacbEa5ff1Dee5d8aACB48021c6F6Bc59930)
3.  Hashi Manager: [0x998dA7f6cF98541E4F4469cc9d53B9374F186591](https://explorer.lukso.network/address/0x998dA7f6cF98541E4F4469cc9d53B9374F186591?tab=contract)
4.  SP1Helios : [0x879b10aF142790789069Db7cA24543E41BEA4c8c](https://explorer.execution.mainnet.lukso.network/address/0x879b10aF142790789069Db7cA24543E41BEA4c8c)
5.  SP1HeliosAdapter: [0xb0b8D5af8330BB4017F15E967bEeB76455EAfAD1](https://explorer.execution.mainnet.lukso.network/address/0xb0b8D5af8330BB4017F15E967bEeB76455EAfAD1)
