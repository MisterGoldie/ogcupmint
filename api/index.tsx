import { NextApiRequest, NextApiResponse } from 'next';

// Constants
const IMAGE_URL = 'https://placehold.co/600x400?text=NFT+Minting+Frame';
const THIRDWEB_CLIENT_ID = process.env.THIRDWEB_CLIENT_ID;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to /api/frame`);
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || getBaseUrl(req);
    const postUrl = `${baseUrl}/api/frame`;

    if (req.method === 'GET') {
      console.log('IMAGE_URL:', IMAGE_URL); // Log the image URL
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
            <h1>Click to mint your NFT</h1>
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

      // In a real implementation, you would use the FID to authenticate the user
      // and get their wallet address. For this example, we'll use a placeholder.
      const userAddress = `0x${userFid.padStart(40, '0')}`;

      console.log('User address:', userAddress);

      // Check for required environment variables
      if (!THIRDWEB_CLIENT_ID || !THIRDWEB_SECRET_KEY || !NFT_CONTRACT_ADDRESS) {
        throw new Error("Missing required environment variables");
      }

      // Simulate minting process
      console.log('Simulating NFT mint...');
      const txHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      console.log('Simulated transaction hash:', txHash);

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
            <meta property="fc:frame:button:1:target" content="https://basescan.org/tx/${txHash}" />
            <meta property="fc:frame:button:2" content="Mint Another" />
            <meta property="fc:frame:button:2:action" content="post" />
            <meta property="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>NFT Minted Successfully!</h1>
            <p>Transaction Hash: ${txHash}</p>
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
    console.error('IMAGE_URL:', IMAGE_URL);
    console.error('THIRDWEB_CLIENT_ID:', THIRDWEB_CLIENT_ID ? 'Set' : 'Not set');
    console.error('THIRDWEB_SECRET_KEY:', THIRDWEB_SECRET_KEY ? 'Set' : 'Not set');
    console.error('NFT_CONTRACT_ADDRESS:', NFT_CONTRACT_ADDRESS);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Minting Error</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${IMAGE_URL}" />
          <meta property="og:image" content="${IMAGE_URL}" />
          <meta property="og:title" content="Minting Error" />
          <meta property="fc:frame:button:1" content="Try again" />
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
    return res.status(200).send(html);
  }
}

function getBaseUrl(req: NextApiRequest): string {
  const host = req.headers.host || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}