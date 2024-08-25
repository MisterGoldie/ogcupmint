import { NextApiRequest, NextApiResponse } from 'next';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

// Constants
const IMAGE_URL = 'https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmPajdnayjQgnbtLAXf1FyFL2tpZ7kDZBrqULB4XRLBWkb';
const THIRDWEB_CLIENT_ID = process.env.THIRDWEB_CLIENT_ID;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Construct the RPC URL using the API key
const RPC_URL = `https://8453.rpc.thirdweb.com/${THIRDWEB_SECRET_KEY}`;

// Define the Base chain
const baseChain = {
  chainId: 843,
  rpc: [RPC_URL],
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  slug: "base",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to /api/frame`);
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || getBaseUrl(req);
    const postUrl = `${baseUrl}/api/frame`;

    if (req.method === 'GET') {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>NFT Minting Frame</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${IMAGE_URL}" />
            <meta property="og:image" content="${IMAGE_URL}" />
            <meta property="og:title" content="NFT Minting Frame" />
            <meta property="fc:frame:button:1" content="Mint NFT" />
            <meta property="fc:frame:button:1:action" content="post" />
            <meta property="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>Mint Your NFT</h1>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(html);
    } else if (req.method === 'POST') {
      console.log('Handling POST request for minting');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const { untrustedData } = req.body;
      const userFid = untrustedData?.fid;
      
      if (!userFid) {
        throw new Error("User FID not provided");
      }

      console.log('Attempting to mint for FID:', userFid);

      // Check for required environment variables
      if (!THIRDWEB_CLIENT_ID || !THIRDWEB_SECRET_KEY || !NFT_CONTRACT_ADDRESS || !PRIVATE_KEY) {
        throw new Error("Missing required environment variables");
      }

      // Initialize the SDK with the custom RPC URL
      console.log('Initializing Thirdweb SDK...');
      const sdk = new ThirdwebSDK(baseChain, {
        clientId: THIRDWEB_CLIENT_ID,
        secretKey: THIRDWEB_SECRET_KEY,
      });
      await sdk.wallet.connect(PRIVATE_KEY);
      console.log('SDK initialized and wallet connected');

      // Get the contract
      console.log('Getting contract...');
      const contract = await sdk.getContract(NFT_CONTRACT_ADDRESS);
      console.log('Contract retrieved');

      // Mint the NFT
      console.log('Minting NFT...');
      const tx = await contract.erc721.mint({
        to: userFid,
        metadata: {
          name: "Farcaster Frame NFT",
          description: "An NFT minted through a Farcaster Frame",
          image: IMAGE_URL,
        },
      });
      console.log('Minting transaction:', tx);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>NFT Minted Successfully</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${IMAGE_URL}" />
            <meta property="og:image" content="${IMAGE_URL}" />
            <meta property="og:title" content="NFT Minted Successfully" />
            <meta property="fc:frame:button:1" content="View Transaction" />
            <meta property="fc:frame:button:1:action" content="link" />
            <meta property="fc:frame:button:1:target" content="https://basescan.org/tx/${tx.receipt.transactionHash}" />
            <meta property="fc:frame:button:2" content="Mint Another" />
            <meta property="fc:frame:button:2:action" content="post" />
            <meta property="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>NFT Minted Successfully!</h1>
            <p>Transaction Hash: ${tx.receipt.transactionHash}</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(html);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in frame handler:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error stack:', error.stack);
    }
    
    // Log additional details that might be helpful
    console.error('THIRDWEB_CLIENT_ID:', THIRDWEB_CLIENT_ID ? 'Set' : 'Not set');
    console.error('THIRDWEB_SECRET_KEY:', THIRDWEB_SECRET_KEY ? 'Set' : 'Not set');
    console.error('NFT_CONTRACT_ADDRESS:', NFT_CONTRACT_ADDRESS);
    console.error('RPC_URL:', RPC_URL);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Minting Error</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${IMAGE_URL}" />
          <meta property="og:image" content="${IMAGE_URL}" />
          <meta property="og:title" content="Minting Error" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:post_url" content="${req.headers.host}/api/frame" />
        </head>
        <body>
          <h1>Minting Error</h1>
          <p>Error: ${errorMessage}</p>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(500).send(html);
  }
}

function getBaseUrl(req: NextApiRequest): string {
  const host = req.headers.host || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}