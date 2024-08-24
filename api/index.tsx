// pages/api/frame.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { BaseGoerli } from '@thirdweb-dev/chains';

// Using a publicly accessible image from Imgur
const IMAGE_URL = 'https://i.imgur.com/Wc8a4M2.png';
const CONTRACT_ADDRESS = '0x404240F00cDDC0070117e6D046Bf5D118A7E9641';

function getBaseUrl(req: NextApiRequest) {
  const host = req.headers.host || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to /api/frame`);
  const baseUrl = process.env.NEXT_PUBLIC_URL || getBaseUrl(req);
  const postUrl = `${baseUrl}/api/frame`;

  if (req.method === 'GET') {
    console.log('Handling GET request');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NFT Minting Frame</title>
          <meta property="og:image" content="${IMAGE_URL}" />
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${IMAGE_URL}" />
          <meta property="fc:frame:button:1" content="Mint NFT" />
          <meta property="fc:frame:post_url" content="${postUrl}" />
        </head>
        <body>
          <h1>NFT Minting Frame</h1>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } else if (req.method === 'POST') {
    console.log('Handling POST request');
    try {
      console.log('Initializing ThirdwebSDK');
      const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY!, BaseGoerli);
      
      console.log('Getting contract');
      const contract = await sdk.getContract(CONTRACT_ADDRESS);
      
      console.log('Extracting address from request body');
      const address = req.body?.untrustedData?.fid ? `fid:${req.body.untrustedData.fid}` : 'unknown';
      console.log(`Minting to address: ${address}`);
      
      console.log('Minting NFT');
      const mintResult = await contract.erc721.mint(address);
      const transactionHash = mintResult.receipt.transactionHash;
      console.log(`Minted successfully. Transaction hash: ${transactionHash}`);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>NFT Minted Successfully</title>
            <meta property="og:image" content="${IMAGE_URL}" />
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${IMAGE_URL}" />
            <meta property="fc:frame:button:1" content="View Transaction" />
            <meta property="fc:frame:button:2" content="Mint Another" />
            <meta property="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>NFT Minted Successfully</h1>
            <p>Transaction Hash: ${transactionHash}</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (error) {
      console.error('Error minting NFT:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Minting Failed</title>
            <meta property="og:image" content="${IMAGE_URL}" />
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${IMAGE_URL}" />
            <meta property="fc:frame:button:1" content="Try Again" />
            <meta property="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>Minting Failed</h1>
            <p>An error occurred while minting the NFT: ${errorMessage}</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }
  } else {
    console.log(`Unsupported method: ${req.method}`);
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}