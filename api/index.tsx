// @ts-ignore
import React from 'react';
import { Frog, Button } from 'frog';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { BaseGoerli } from '@thirdweb-dev/chains';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = new Frog({
  basePath: '/',
  title: 'NFT Minting Frame',
});

let sdk: ThirdwebSDK;
let contract: Awaited<ReturnType<typeof ThirdwebSDK.prototype.getContract>>;

async function initializeSDK() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is not set');
  }
  
  sdk = ThirdwebSDK.fromPrivateKey(
    process.env.PRIVATE_KEY,
    BaseGoerli
  );
  
  const contractAddress = '0x404240F00cDDC0070117e6D046Bf5D118A7E9641';
  contract = await sdk.getContract(contractAddress);
}

// Initialize SDK before defining routes
initializeSDK().catch(console.error);

app.frame('/', (c) => {
  return c.res({
    image: 'https://example.com/nft-minting-frame.png', // Replace with your actual image URL
    intents: [
      <Button action="mint">Mint NFT</Button>
    ],
  });
});

app.frame('/mint', async (c) => {
  if (!contract) {
    throw new Error('Contract not initialized');
  }

  try {
    const address = c.frameData?.fid ? `fid:${c.frameData.fid}` : 'unknown';
    const mintResult = await contract.erc721.mint(address);
    const tokenId = mintResult.id;

    return c.res({
      image: 'https://example.com/nft-minted-success.png', // Replace with your actual success image URL
      intents: [
        <Button action="/">Mint Another</Button>
      ],
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    if (error && typeof error === 'object') {
      console.error('Error details:', JSON.stringify(error, null, 2));
    }

    return c.res({
      image: 'https://example.com/nft-minting-error.png', // Replace with your actual error image URL
      intents: [
        <Button action="/">Try again</Button>
      ],
    });
  }
});

export default app;