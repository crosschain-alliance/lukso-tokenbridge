# Hashi API for LUKSO token bridge UI

This API allows users to check the status of a message being processed on the LUKSO blockchain through the Hashi bridge. By entering a transaction hash, the system will return whether the message has been detected or approved:

1. When a tx is originated on the source chain, one can check the messageId from Hashi from `MessageDisaptched` event: (i.e. `0xed0bdd51708bfc1048e5bdaa808905dc664f7654858dbddb4a202db787a9f9e5` in https://gnosisscan.io/tx/0x697aa6b0ae1780fa424107cbdcb60dc03e4168badc0d07eec44676c1882ad918#eventlog). The API returns `detected` when this event is emitted.
2. On destination chain, `MessageExecuted` event will emit for the same messageId (https://explorer.execution.mainnet.lukso.network/tx/0xde88ee76855de7fdf8289b8c16202bf6aca9d8437554ff58ad0e96f2e72b0185?tab=logs). The API returns `approved` when this event is emitted.

## How to Use

Send a GET request to the following URL with your txhash

```
https://hashi-url/txhash=0xYourTransactionHash
```

Response Format
The API will return a response in this format:

```
{
  "txhash": "0xYourTransactionHash",
  "messageId": "0xUniqueMessageID",
  "status": "detected" | "approved"
}
```

## Open API spec

```openapi: 3.0.0
info:
  title: LUKSO Hashi Message Status API
  description: API to query the status of a message from Hashi on LUKSO
  version: 1.0.0
servers:
  - url: https://hashi-api.lukso.io
    description: Production Server
paths:
  /message-status:
    get:
      summary: Get the status of a message from Hashi
      description: Returns the status of a message based on its transaction hash.
      parameters:
        - name: txhash
          in: query
          description: The transaction hash of the message
          required: true
          schema:
            type: string
            pattern: '^0x[a-fA-F0-9]{64}$'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  txhash:
                    type: string
                    pattern: '^0x[a-fA-F0-9]{64}$'
                    description: The transaction hash
                  messageId:
                    type: string
                    pattern: '^0x[a-fA-F0-9]{64}$'
                    description: The unique identifier of the message
                  status:
                    type: string
                    enum: ["detected", "approved"]
                    description: |
                      - "detected": Only `MessageDispatched` from the source chain's Yaho is detected.
                      - "approved": `MessageExecuted` for the same messageId has been detected.
        '400':
          description: Invalid request parameters
        '404':
          description: Message not found
        '500':
          description: Internal server error
```
