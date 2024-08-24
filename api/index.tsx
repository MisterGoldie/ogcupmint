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
const NEXT_PUBLIC_URL = 'https://ogcupmint.vercel.app';

app.frame('/', (c) => {
  return c.res({
    image: STATIC_IMAGE_URL,
    intents: [
      <Button action="mint">Mint NFT</Button>
    ],
  });
});

app.frame('/mint', async (c) => {
  const contractInstance = await contract;
  if (!contractInstance) {
    return c.res({
      image: `${NEXT_PUBLIC_URL}/api/images/error`,
      intents: [
        <Button action="retry">Try Again</Button>
      ],
    });
  }

  try {
    const address = c.frameData?.fid ? `fid:${c.frameData.fid}` : 'unknown';
    const mintResult = await contractInstance.erc721.mint(address);
    const tokenId = mintResult.id.toString();
    const transactionHash = mintResult.receipt.transactionHash;

    return c.res({
      image: `${NEXT_PUBLIC_URL}/api/images/success?tokenId=${tokenId}`,
      intents: [
        <Button action={`view_transaction:${transactionHash}`}>View Transaction</Button>,
        <Button action="mint">Mint Another</Button>
      ],
    });
  } catch (error) {
    console.error('Error minting NFT:', error);

    return c.res({
      image: `${NEXT_PUBLIC_URL}/api/images/error`,
      intents: [
        <Button action="retry">Try Again</Button>
      ],
    });
  }
});

app.frame('/view-transaction', (c) => {
  const action = c.buttonValue;
  const txHash = action?.startsWith('view_transaction:') ? action.split(':')[1] : null;

  if (txHash) {
    const url = `https://basescan.org/tx/${txHash}`;
    return c.res({
      image: `${NEXT_PUBLIC_URL}/api/images/redirect?url=${encodeURIComponent(url)}`,
      intents: [
        <Button action="link" value={url}>Open in Browser</Button>,
        <Button action="mint">Back to Minting</Button>
      ],
    });
  } else {
    return c.res({
      image: `${NEXT_PUBLIC_URL}/api/images/error`,
      intents: [
        <Button action="mint">Back to Minting</Button>
      ],
    });
  }
});

export default app;