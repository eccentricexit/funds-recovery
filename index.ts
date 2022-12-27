import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { abi, bytecode } from './out/RecoverReject.sol/RecoverReject.json';

dotenv.config();

const PROVIDER_URL = process.env.PROVIDER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
  if (!PROVIDER_URL || !PRIVATE_KEY) {
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const walletBalanceBefore = await wallet.getBalance();
  const targetNonce = Number(process.env.TARGET_NONCE);
  let nextTxNonce = await provider.getTransactionCount(wallet.address);

  console.info('Wallet:', wallet.address);
  console.info(
    'Current wallet balance:',
    ethers.utils.formatUnits(walletBalanceBefore),
    'ether'
  );
  console.info(
    `Will deploy recovery contract at nonce ${targetNonce}, address: ${ethers.utils.getContractAddress(
      {
        from: wallet.address,
        nonce: targetNonce
      }
    )}`
  );
  console.info(`Next nonce: ${nextTxNonce}`);
  console.info();

  if (nextTxNonce >= targetNonce) {
    console.info(
      `Target nonce was already used. Next nonce: ${nextTxNonce}, target nonce: ${targetNonce}`
    );
    return;
  }

  while (nextTxNonce < targetNonce) {
    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0,
      nonce: nextTxNonce
    });

    console.info(
      `Increasing next nonce to ${nextTxNonce + 1} sent. Waiting for confs...`
    );
    await tx.wait(5);
    console.info('Nonce increased');
    console.info();

    nextTxNonce = await provider.getTransactionCount(wallet.address);
  }

  console.info(
    `Deploying contract with nonce ${nextTxNonce} and recovering funds.`
  );
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy({ nonce: targetNonce });
  await contract.deployTransaction.wait();

  const walletBalanceAfter = await wallet.getBalance();
  console.info(`Done. `);
  console.info(
    `Recovered approximately ${ethers.utils.formatUnits(
      walletBalanceAfter.sub(walletBalanceBefore)
    )} coins`
  );
}

main();
