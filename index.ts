import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { abi, bytecode } from './out/RecoverReject.sol/RecoverReject.json';

dotenv.config();

const PROVIDER_URL = process.env.PROVIDER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BENEFICIARIES = process.env.BENEFICIARIES?.split(`,`);
const AMOUNT_PER_BENEFICIARY = process.env.AMOUNT_PER_BENEFICIARY?.split(`,`);
const CONFIRMATIONS = 5;

async function main() {
  if (
    !PROVIDER_URL ||
    !PRIVATE_KEY ||
    !AMOUNT_PER_BENEFICIARY ||
    !BENEFICIARIES
  ) {
    console.error('Missing variables.');
    process.exit(1);
  }

  if (
    AMOUNT_PER_BENEFICIARY.length != BENEFICIARIES.length ||
    AMOUNT_PER_BENEFICIARY.length === 0
  ) {
    console.error('Mismatch in beneficiaries and amounts');
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

  while (nextTxNonce < targetNonce) {
    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0,
      nonce: nextTxNonce
    });

    console.info(
      `Increasing next nonce to ${nextTxNonce + 1} sent. Waiting for confs...`
    );
    await tx.wait(CONFIRMATIONS);
    console.info('Nonce increased');
    console.info();

    nextTxNonce = await provider.getTransactionCount(wallet.address);
  }

  console.info(
    `Deploying contract with nonce ${nextTxNonce} and recovering funds.`
  );
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy({ nonce: targetNonce });
  await contract.deployTransaction.wait(CONFIRMATIONS);

  const walletBalanceAfter = await wallet.getBalance();
  console.info(`Done. `);
  console.info(
    `Recovered approximately ${ethers.utils.formatUnits(
      walletBalanceAfter.sub(walletBalanceBefore)
    )} coins`
  );

  // Distribute recovered funds.
  console.info('Distributing funds.');
  console.info(
    "Don't stop the proram or be carefull with the beneficiaries in the dotenv..."
  );
  for (let i = 0; i < AMOUNT_PER_BENEFICIARY.length; i++) {
    console.info(`Tx ${i + 1} of ${AMOUNT_PER_BENEFICIARY.length} sent`);
    const tx = await wallet.sendTransaction({
      to: BENEFICIARIES[i],
      value: ethers.utils.parseEther(AMOUNT_PER_BENEFICIARY[i]),
      data: ethers.utils.toUtf8Bytes(
        'Proof of Humanity missend recovery. Happy 2023!'
      )
    });
    await tx.wait(CONFIRMATIONS);
    console.info(
      `Sent ${AMOUNT_PER_BENEFICIARY[i]} coins to ${BENEFICIARIES[i]}`
    );
    console.info();
  }

  console.info(
    'Done distributing ETH. Clear dotenv beneficiaries to avoid resending.'
  );
}

main();
