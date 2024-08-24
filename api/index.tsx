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
    image: STATIC_IMAGE_URL,
    intents: [
      <Button action="post">Mint NFT</Button>
    ],
  });
});

app.frame('/mint', async (c) => {
  const contractInstance = await contract;
  if (!contractInstance) {
    return c.res({
      image: STATIC_IMAGE_URL,
      intents: [
        <Button action="post">Try Again</Button>
      ],
    });
  }

  try {
    const address = c.frameData?.fid ? `fid:${c.frameData.fid}` : 'unknown';
    await contractInstance.erc721.mint(address);
    
    return c.res({
      image: STATIC_IMAGE_URL,
      intents: [
        <Button action="post">View Transaction</Button>,
        <Button action="post">Mint Another</Button>
      ],
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    
    return c.res({
      image: STATIC_IMAGE_URL,
      intents: [
        <Button action="post">Try Again</Button>
      ],
    });
  }
});

export default app;