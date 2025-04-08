# Integrating Hashi into Aggregation Hook & Aggregation ISM

This guide explains how to integrate Hashi into a Hyperlane Warp Route using Aggregation Hook (on source chain) and Aggregation ISM (on destination chain).

---

## Integration Steps: Hook & ISM

### 🔗 On the **Source Chain**

#### Step 1: Deploy `StaticAggregationHook` via Factory

1. Locate the `staticAggregationHookFactory` address for your source chain from the [Hyperlane Registry](https://github.com/hyperlane-xyz/hyperlane-registry/blob/main/chains/ethereum/addresses.yaml#L15).
2. Deploy a new `StaticAggregationHook` contract using the factory:

   ```solidity
   staticAggregationHookFactory.deploy(
   [HashiHook_address, other_Hook_address],
   threshold
   )
   ```

> > Note that the deploy transaction will not emit event and you have to get the created contract by checking the internal states of the transaction.

#### Step 2: Set the Hook in Warp Route

Call the `setHook` 0x3dfd3873 function in the warp route contract with the newly deployed staticAggregationHook contract address.

### 🔗 On the **Destination Chain**

#### Step 3: Deploy `StaticAggregationISM` via Factory

1. Locate the staticAggregationIsmFactory address for your destination chain from the [Hyperlane Registry](https://github.com/hyperlane-xyz/hyperlane-registry/blob/main/chains/lukso/addresses.yaml#L17).

2. Deploy a new StaticAggregationISM contract using the factory:

   ```solidity
   staticAggregationIsmFactory.deploy(
   [HashiIsm_address, other_Ism_address],
   threshold
   )
   ```

> > Note: This deployment does not emit an event. You must retrieve the deployed contract address from the internal transaction state.

#### Step 4: Set the ISM in Warp Route

Call the `setInterchainSecurityModule` function (0x0e72cc06) on the Warp Route contract with the new StaticAggregationISM address.

📁 Refer to [hookAndIsm.js](../task/setup/hookAndIsm.js) for implementation details.

## Removing Current Hook or ISM

To remove the existing hook or ISM from the Warp Route contract:

Call the respective function and set the address to `0x0`:

- `setHook(0x0)`
- `setInterchainSecurityModule(0x0)`

## Setting up Hashi Manager

To configure Hashi Manager:

Setup the following parameters on source chain:

      - Yaho(source chain)
      - Yaru(source chain)
      - ReportersAdaptersAndThreshold: Reporters (source chain), Adapters (destination chain)
      - ExpectedAdaptersHash: Adapters (source chain)
      - targetAddress: Hashi Hook (destination chain)
      - expectedThreshold
      - targetChainId

Refer to [hashiManager.js](../task/setup/hashiManager.js)
