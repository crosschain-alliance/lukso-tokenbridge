# Hashi Components

1. **[SP1 Helios Light Clients](https://github.com/crosschain-alliance/sp1-helios)**  
   SP1 Helios is a light client built with [SP1](https://docs.succinct.xyz/docs/sp1/introduction).  
   It requests header updates from the [SP1 Prover Network](https://docs.succinct.xyz/docs/network/introduction), then verifies them on the destination chain using the `SP1Helios.update` function in the [SP1Helios contract](https://github.com/crosschain-alliance/sp1-helios/blob/main/contracts/src/SP1Helios.sol).  
   A script to run SP1 Helios is available [here](https://github.com/crosschain-alliance/sp1-helios/blob/main/script/bin/operator.rs).

2. **[Hashi Adapter Prover](https://github.com/crosschain-alliance/hashi-adapter-prover)**  
   This component listens for `MessageDispatched` events on the source chain, generates a Merkle proof for the event, and verifies it on the SP1 Helios Adapter contract using the `SP1HeliosAdapter.verifyAndStoreDispatchedMessage` function.

3. **[Hashi Executor](https://github.com/gnosis/hashi/tree/main/packages/executor)**  
   The executor calls `Yaru.executeMessages` to finalize a message execution and mark it as `approvedByHashi` in the Hashi ISM contract.

# Hyperlane Components

1. **[Hyperlane Validator](https://docs.hyperlane.xyz/docs/operate/validators/run-validators)**  
   Instructions and setup guide for running a Hyperlane validator.

2. **[Hyperlane Relayer](https://docs.hyperlane.xyz/docs/operate/relayer/run-relayer)**  
   Instructions and setup guide for running a Hyperlane relayer.
