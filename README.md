# Recover Funds

Little tool recover ether accidentally sent in the wrong chain. Bumps the nonce up to the target and deploys a contract that sends the ether to msg.sender.

Use at your own risk.

## Usage

Duplicate `.env.example`, rename to `.env`, fill the variables and `yarn start`. Set the provider to `http://127.0.0.1:8545` and run `yarn anvil` to start a local blockchain for testing.
