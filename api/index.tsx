import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

// Constants
const PRIMARY_IMAGE_URL = 'https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmPajdnayjQgnbtLAXf1FyFL2tpZ7kDZBrqULB4XRLBWkb';
const FALLBACK_IMAGE_URL = 'https://placekitten.com/800/600'; // Replace with your own fallback image
const RPC_URL = process.env.BASE_RPC_URL;
const PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const NFT_CONTRACT_ABI = [
  "function mint(address to) public",
  // Add other necessary functions from your contract
];

// Rate limiting (simple implementation, consider using a more robust solution in production)
const RATE_LIMIT = 5; // Number of requests allowed per minute
const requestCounts = new Map<string, { count: number; timestamp: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || { count: 0, timestamp: now };
  
  if (now - userRequests.timestamp > 60000) {
    // Reset if it's been more than a minute
    userRequests.count = 1;
    userRequests.timestamp = now;
  } else {
    userRequests.count++;
  }
  
  requestCounts.set(ip, userRequests);
  return userRequests.count <= RATE_LIMIT;
}

async function isImageAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking image accessibility:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to /api/frame`);
  
  const baseUrl = process.env.NEXT_PUBLIC_URL || getBaseUrl(req);
  const postUrl = `${baseUrl}/api/frame`;

  // Apply rate limiting
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (typeof userIp === 'string' && !rateLimit(userIp)) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }

  // Determine which image URL to use
  const imageUrl = await isImageAccessible(PRIMARY_IMAGE_URL) ? PRIMARY_IMAGE_URL : FALLBACK_IMAGE_URL;

  if (req.method === 'GET') {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NFT Minting Frame</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="og:image" content="${imageUrl}" />
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
    console.log('Handling POST request');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
      const { untrustedData } = req.body;
      const userFid = untrustedData?.fid;
      
      if (!userFid) {
        throw new Error("User FID not provided");
      }

      console.log('Attempting to mint for FID:', userFid);

      // Check for required environment variables
      if (!RPC_URL || !PRIVATE_KEY || !NFT_CONTRACT_ADDRESS) {
        throw new Error("Missing required environment variables");
      }

      // Set up provider and wallet
      console.log('Setting up provider...');
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      console.log('Provider set up successfully');

      console.log('Setting up wallet...');
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      console.log('Wallet set up successfully');

      // Create contract instance
      console.log('Creating contract instance...');
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, wallet);
      console.log('Contract instance created successfully');

      // Call mint function
      console.log('Calling mint function...');
      const tx = await nftContract.mint(userFid);
      console.log('Minting transaction sent:', tx.hash);

      // Wait for transaction to be mined
      console.log('Waiting for transaction to be mined...');
      const receipt = await tx.wait();
      console.log('Minting successful. Transaction hash:', receipt.transactionHash);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>NFT Minted Successfully</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${imageUrl}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:title" content="NFT Minted Successfully" />
            <meta property="fc:frame:button:1" content="View Transaction" />
            <meta property="fc:frame:button:1:action" content="link" />
            <meta property="fc:frame:button:1:target" content="https://basescan.org/tx/${receipt.transactionHash}" />
            <meta property="fc:frame:button:2" content="Mint Another" />
            <meta property="fc:frame:button:2:action" content="post" />
            <meta property="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>NFT Minted Successfully!</h1>
            <p>Transaction Hash: ${receipt.transactionHash}</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(html);
    } catch (error) {
      console.error('Error minting NFT:', error);
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error stack:', error.stack);
      }
      
      // Log additional details that might be helpful
      console.error('RPC_URL:', RPC_URL);
      console.error('NFT_CONTRACT_ADDRESS:', NFT_CONTRACT_ADDRESS);
      console.error('User FID:', req.body?.untrustedData?.fid);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Minting Error</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${imageUrl}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:title" content="Minting Error" />
            <meta property="fc:frame:button:1" content="Try Again" />
            <meta property="fc:frame:button:1:action" content="post" />
            <meta property="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>Minting Error</h1>
            <p>Error: ${errorMessage}</p>
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

function getBaseUrl(req: NextApiRequest): string {
  const host = req.headers.host || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}