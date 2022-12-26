import * as dotenv from 'dotenv';
import { ethers, Wallet } from 'ethers';
import { abi, bytecode } from './out/RecoverReject.sol/RecoverReject.json';

dotenv.config();

const PROVIDER_URL = process.env.PROVIDER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

function sleep(s: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, s * 1000);
  });
}

async function main() {
  if (!PROVIDER_URL || !PRIVATE_KEY) {
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Setup

  const targetNonce = 116;
  console.info('wallet address: ', wallet.address);
  let nextNonce = await provider.getTransactionCount(wallet.address);
  while (nextNonce < targetNonce) {
    console.info('next tx nonce:', nextNonce);
    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0,
      nonce: nextNonce
    });

    console.info('Tx submitted, wait for an epoch');
    console.info();

    await tx.wait(32); // Confirmations

    nextNonce = await provider.getTransactionCount(wallet.address);
  }

  console.info(
    'next nonce: ',
    await provider.getTransactionCount(wallet.address)
  );

  console.info();
  console.info();
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy({ nonce: targetNonce });
  await contract.deployTransaction.wait();

  console.info('done, value recovered.');
  console.log(
    'current wallet balance',
    ethers.utils.formatUnits(await wallet.getBalance())
  );
}

main();
