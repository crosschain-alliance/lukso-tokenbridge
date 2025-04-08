# LUKSO Tokenbridge

## Workflow (Ethereum → LUKSO)

![LUKSO tokenbridge ETH->LUKSO](./static/img/ETH_LUKSO.png)
**Ethereum**

1. User transfer ERC20 token to Hyp Collateral contract and the token is locked in the collateral contract.
2. Hyp Collateral contract call Mailbox to pass the message.
3. Mailbox call Default Hook (created by Hyperlane) and Hashi Hook (created by CCIA team).
4. Hashi Hook dispatch the token relaying message from Yaho contracts.

**Off chain**

1. ZK light client will update the header from Ethereum periodically on LUKSO. [code](https://github.com/crosschain-alliance/sp1-helios)
1. Zk light Client prover will listen to the `MessageDispatched` event from Yaho, generate proof, and verify on the adapter contract. [code](https://github.com/crosschain-alliance/hashi-adapter-prover)
1. Hashi [executor](https://github.com/gnosis/hashi/tree/feat/v0.2.0/packages/executor) (managed by CCIA team) will listen to event from each Hashi adapter contracts and call Yaru.executeMessages. This step will check whether the Hashi adapters agree on a specific message id (a threshold number of the same hash is stored), and set the message as approved.
1. [Validator](https://docs.hyperlane.xyz/docs/protocol/agents/validators) (run by Hyperlane & LUKSO team) will sign the Merkle root when new dispatches happen in Mailbox.
1. [Hyperlane relayer](https://docs.hyperlane.xyz/docs/protocol/agents/relayer) (run by Hyperlane team) relays the message by calling Mailbox.process().

**LUKSO**

1. When Mailbox.process() is called, it will verify with Static Aggregation ISM (aggregate result from Hyperlane default ISM, Multisig ISM (validated by LUKSO validator), Hashi ISM). If so, it will mint hypERC20 token to the receiver.
2. For compatibility, LSP7 wrapper need to be created to mint LSP7 token to the user.

## Workflow ( LUKSO → Ethereum)

![LUKSO tokenbridge LUKSO->ETH](./static/img/LUKSO_ETH.png)

**LUKSO**

1. User transfer LSP7 token to HypLSP7 contract and the token is locked.
2. HypLSP7 contract call Mailbox to pass the message.
3. Mailbox call Default Hook (created by Hyperlane) and Hashi Hook (created by CCIA team).
4. Hashi Hook dispatch the token relaying message from Yaho contracts.

**Off chain**

1. Off chain process remains the same as the previous section, with the opposite direction.

**Ethereum**

1. When Mailbox.process() is called, it will check with Static Aggregation ISM (aggregate result from Hyperlane defualt ISM, Multisig ISM (validated by LUKSO validator), Hashi ISM). If so, it will unlock ERC20 token to the receiver.

> > For the contract transaction calls, refer to [End to End test](./docs/EndToEndTest.md)

## Reference

### Hyperlane

1. Warp Route: https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/main/solidity/contracts/token/README.md
2. Implement Connext xERC20 and Circle FiatToken collateral:https://github.com/hyperlane-xyz/hyperlane-monorepo/pull/3618
3. Hyperlane core contracts on LUKSO: https://github.com/hyperlane-xyz/hyperlane-registry/blob/main/chains/lukso/addresses.yaml

### Hashi

1. Hashi ISM: https://github.com/crosschain-alliance/lukso-tokenbridge/tree/main/contracts
2. Hashi: https://github.com/gnosis/hashi

### LUKSO

1. LSP7: https://docs.lukso.tech/standards/tokens/LSP7-Digital-Asset/
2. HypLSP7: https://github.com/lukso-network/lsp-bridge-HypLSP7/blob/main/README.md

# Dev

### Setup

```
nvm use
yarn install
git submodule update --init --recursive
```

Compile contracts

```
yarn hardhat compile
```

Test

```
yarn hardhat test
```

### Deployment

1. Deploy and setup Hashi Manager

```
yarn hardhat setup:hashiManager --network ethereum
```

2. Deploy and setup hook and ism

```
yarn hardhat setup:hookAndIsm --network ethereum
```

3. Deploy HypERC20 Collateral & HypERC20

```
yarn hardhat setup:hypERC20
```

Check out `task/deploy.js` for individual deployment scripts.

### Testing

Unit test

```
yarn hardhat test
```

Fork test

```
yarn hardhat node --fork $ETHEREUM_RPC_URL
yarn hardhat node --fork $LUKSO_RPC_URL --port 8544
yarn hardhat lukso:e2e --network fethereum
```

# Configuration

Check out the contract addresses in [Contracts Deployment](./docs/ContractDeployment.md)

```
PRIVATE_KEY= # Private key for contract deployments

LUKSO_RPC_URL=
ETHEREUM_RPC_URL=

SOURCE_CHAIN_ID=1
DESTINATION_CHAIN_ID=42
SOURCE_CHAIN_NAME=ETHEREUM
DESTINATION_CHAIN_NAME=LUKSO
HASHI_MANAGER_THRESHOLD=1    // threshold of Hashi oracles to validate a message

#  Deployed by CCIA team, https://crosschain-alliance.gitbook.io/hashi/deployments/blockchains
ETHEREUM_HASHI=0xA86bc62Ac53Dc86687AB6C15fdebC71ad51fB615
ETHEREUM_HEADER_STORAGE=0x117D7D593e6a7d9699a763C552BFA3177a46B957
ETHEREUM_YAHO=0xbAE4Ebbf42815BB9Bc3720267Ea4496277d60DB8
ETHEREUM_YARU=0x5e499f1845dEE19FD1eFdD4A9bf17c21446f613E  # w.r.t LUKSO
LUKSO_HASHI=0xA86bc62Ac53Dc86687AB6C15fdebC71ad51fB615
LUKSO_HEADER_STORAGE=0x117D7D593e6a7d9699a763C552BFA3177a46B957
LUKSO_YAHO=0xbAE4Ebbf42815BB9Bc3720267Ea4496277d60DB8
LUKSO_YARU=0x3f94989763A27CAeAF1f7aEF4Df2752CD5B58a5A

# Hyperlane-registry
ETHEREUM_MAILBOX=0xc005dc82818d67AF737725bD4bf75435d065D239
ETHEREUM_STATIC_AGGREGATION_HOOK_FACTORY=0x6D2555A8ba483CcF4409C39013F5e9a3285D3C9E
ETHEREUM_STATIC_AGGREGATION_ISM_FACTORY=0x46FA191Ad972D9674Ed752B69f9659A0d7b22846

LUKSO_STATIC_AGGREGATION_HOOK_FACTORY=0xEb9FcFDC9EfDC17c1EC5E1dc085B98485da213D6
LUKSO_STATIC_AGGREGATION_ISM_FACTORY=0x8F7454AC98228f3504Bb91eA3D8Adafe6406110A
LUKSO_MAILBOX=0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7

# New contracts (address might change in the producation)
ETHEREUM_HASHI_HOOK=
ETHEREUM_HASHI_ISM=
ETHEREUM_MERKLE_ROOT_MULTISIG_ISM= #Multisig ISM contract validated by LUKSO validator
ETHEREUM_STATIC_AGGREGATION_HOOK=
ETHEREUM_STATIC_AGGREGATION_ISM=

LUKSO_HASHI_HOOK=
LUKSO_HASHI_ISM=
LUKSO_MERKLE_ROOT_MULTISIG_ISM=
LUKSO_STATIC_AGGREGATON_HOOK=
LUKSO_STATIC_AGGREGATION_ISM=

# Threshold configuration
HASHI_MANAGER_THRESHOLD=1
HOOK_THRESHOLD=1
ISM_THRESHOLD=1
```
