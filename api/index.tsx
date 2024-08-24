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

function createDataUrl(html: string): string {
  const encodedHtml = encodeURIComponent(html);
  return `data:text/html;charset=utf-8,${encodedHtml}`;
}

app.frame('/', (c) => {
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background-color:#f0f0f0;font-family:Arial,sans-serif;">
      <h1 style="font-size:48px;margin-bottom:20px;">NFT Minting Frame</h1>
      <p style="font-size:24px;margin-bottom:30px;">Click the button below to mint your NFT!</p>
    </div>
  `;

  return c.res({
    image: createDataUrl(html),
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

    const html = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background-color:#e6ffe6;font-family:Arial,sans-serif;">
        <h1 style="font-size:48px;margin-bottom:20px;">NFT Minted Successfully!</h1>
        <p style="font-size:24px;margin-bottom:15px;">Congratulations! Your NFT has been minted.</p>
        <p style="font-size:20px;">Token ID: ${tokenId}</p>
      </div>
    `;

    return c.res({
      image: createDataUrl(html),
      intents: [
        <Button action="/">Mint Another</Button>
      ],
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    if (error && typeof error === 'object') {
      console.error('Error details:', JSON.stringify(error, null, 2));
    }

    const html = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background-color:#ffe6e6;font-family:Arial,sans-serif;">
        <h1 style="font-size:48px;margin-bottom:20px;">Minting Failed</h1>
        <p style="font-size:24px;">Sorry, there was an error while minting your NFT. Please try again.</p>
      </div>
    `;

    return c.res({
      image: createDataUrl(html),
      intents: [
        <Button action="/">Try Again</Button>
      ],
    });
  }
});

export default app;