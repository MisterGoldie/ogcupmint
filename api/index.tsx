import { NextApiRequest, NextApiResponse } from 'next';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Base } from "@thirdweb-dev/chains";

const IMAGE_URL = 'https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmPajdnayjQgnbtLAXf1FyFL2tpZ7kDZBrqULB4XRLBWkb';
const CONTRACT_ADDRESS = '0x404240F00cDDC0070117e6D046Bf5D118A7E9641';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to /api/frame`);
  
  const baseUrl = process.env.NEXT_PUBLIC_URL || getBaseUrl(req);
  const postUrl = `${baseUrl}/api/frame`;

  if (req.method === 'GET') {
    // GET handler remains the same
    // ...
  } else if (req.method === 'POST') {
    console.log('Handling POST request');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
      const { untrustedData } = req.body;
      const userFid = untrustedData?.fid;
      
      if (!userFid) {
        throw new Error("User FID not provided");
      }

      console.log('Attempting to mint for FID:', userFid);
      const transactionHash = await performMint(userFid);
      console.log('Minting successful. Transaction hash:', transactionHash);

      // Success response remains the same
      // ...
    } catch (error) {
      console.error('Error minting NFT:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
      console.error('Error stack:', errorStack);
      
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
            <meta property="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>Minting Error</h1>
            <p>Error: ${errorMessage}</p>
            <p>Details: ${errorStack}</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(html);
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function performMint(userFid: string): Promise<string> {
  if (!process.env.THIRDWEB_SECRET_KEY) {
    throw new Error('THIRDWEB_SECRET_KEY is not set in environment variables');
  }

  console.log('Initializing ThirdwebSDK');
  const sdk = new ThirdwebSDK(Base, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });

  console.log('Getting contract');
  const contract = await sdk.getContract(CONTRACT_ADDRESS);
  
  console.log('Converting FID to address');
  const address = await convertFidToAddress(userFid);
  console.log('Minting to address:', address);

  console.log('Calling mint function');
  const mintResult = await contract.erc721.mint(address);
  console.log('Mint result:', JSON.stringify(mintResult, null, 2));

  return mintResult.receipt.transactionHash;
}

async function convertFidToAddress(fid: string): Promise<string> {
  // This is still a placeholder. You need to implement the actual conversion logic.
  return `0x${fid.padStart(40, '0')}`;
}

function getBaseUrl(req: NextApiRequest): string {
  const host = req.headers.host || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}