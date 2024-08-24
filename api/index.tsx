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
  const imageJsx = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>NFT Minting Frame</h1>
      <p style={{ fontSize: '24px', marginBottom: '30px' }}>Click the button below to mint your NFT!</p>
    </div>
  );

  return c.res({
    image: imageJsx,
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

    const successImageJsx = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#e6ffe6', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>NFT Minted Successfully!</h1>
        <p style={{ fontSize: '24px', marginBottom: '15px' }}>Congratulations! Your NFT has been minted.</p>
        <p style={{ fontSize: '20px' }}>Token ID: {tokenId}</p>
      </div>
    );

    return c.res({
      image: successImageJsx,
      intents: [
        <Button action="/">Mint Another</Button>
      ],
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    if (error && typeof error === 'object') {
      console.error('Error details:', JSON.stringify(error, null, 2));
    }

    const errorImageJsx = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#ffe6e6', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Minting Failed</h1>
        <p style={{ fontSize: '24px' }}>Sorry, there was an error while minting your NFT. Please try again.</p>
      </div>
    );

    return c.res({
      image: errorImageJsx,
      intents: [
        <Button action="/">Try Again</Button>
      ],
    });
  }
});

export default app;