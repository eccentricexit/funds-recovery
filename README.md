# Recover Funds

Little tool recover ether accidentally sent in the wrong chain. Bumps the nonce up to the target and deploys a contract that sends the ether to msg.sender.

Use at your own risk.

## Usage

Duplicate `.env.example`, rename to `.env`, fill the variables and `yarn start`. Set the provider to `http://127.0.0.1:8545` and run `yarn anvil` to start a local blockchain for testing.

Example .env

```
PROVIDER=http://127.0.0.1:8545
PRIVATE_KEY=0xyourkey
TARGET_NONCE=200
BENEFICIARIES=0xdea...dbe,0xc0f...fee
AMOUNT_PER_BENEFICIARY=0.1,0.2
```

`AMOUNT_PER_BENEFICIARY` is in ether.
