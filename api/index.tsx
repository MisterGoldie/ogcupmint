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

async function initializeSDK() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is not set');
  }
  
  sdk = ThirdwebSDK.fromPrivateKey(
    process.env.PRIVATE_KEY,
    BaseGoerli
  );
  
  const contractAddress = '0x404240F00cDDC0070117e6D046Bf5D118A7E9641';
  return await sdk.getContract(contractAddress);
}

// Initialize SDK before defining routes
const contract = initializeSDK().catch(console.error);

const STATIC_IMAGE_URL = 'https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmYmLrfR3R67ZUfcFpo8DvnEoKnRqRv3gY9oRbsrnP7UZm';

app.frame('/', (c) => {
  return c.res({
    image: `
      <html>
        <head>
          <title>NFT Minting Frame</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${STATIC_IMAGE_URL}" />
          <meta property="og:image" content="${STATIC_IMAGE_URL}" />
        </head>
      </html>
    `,
    intents: [
      <Button value="mint">Mint NFT</Button>
    ],
  });
});

app.frame('/mint', async (c) => {
  const contractInstance = await contract;
  if (!contractInstance) {
    return c.res({
      image: `
        <html>
          <head>
            <title>NFT Minting Frame - Error</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${STATIC_IMAGE_URL}" />
            <meta property="og:image" content="${STATIC_IMAGE_URL}" />
          </head>
        </html>
      `,
      intents: [
        <Button value="retry">Try Again</Button>
      ],
    });
  }

  try {
    const address = c.frameData?.fid ? `fid:${c.frameData.fid}` : 'unknown';
    await contractInstance.erc721.mint(address);
    
    return c.res({
      image: `
        <html>
          <head>
            <title>NFT Minting Frame - Success</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${STATIC_IMAGE_URL}" />
            <meta property="og:image" content="${STATIC_IMAGE_URL}" />
          </head>
        </html>
      `,
      intents: [
        <Button value="view">View Transaction</Button>,
        <Button value="mint">Mint Another</Button>
      ],
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    
    return c.res({
      image: `
        <html>
          <head>
            <title>NFT Minting Frame - Error</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${STATIC_IMAGE_URL}" />
            <meta property="og:image" content="${STATIC_IMAGE_URL}" />
          </head>
        </html>
      `,
      intents: [
        <Button value="retry">Try Again</Button>
      ],
    });
  }
});

export default app;