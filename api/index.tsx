import { NextApiRequest, NextApiResponse } from 'next';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Base } from "@thirdweb-dev/chains";

const IMAGE_URL = 'https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmPajdnayjQgnbtLAXf1FyFL2tpZ7kDZBrqULB4XRLBWkb';
const CONTRACT_ADDRESS = '0x404240F00cDDC0070117e6D046Bf5D118A7E9641';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || getBaseUrl(req);
  const postUrl = `${baseUrl}/api/frame`;

  if (req.method === 'GET') {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NFT Minting Frame</title>
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${IMAGE_URL}" />
          <meta name="og:image" content="${IMAGE_URL}" />
          <meta name="og:title" content="NFT Minting Frame" />
          <meta name="fc:frame:button:1" content="Mint NFT" />
          <meta name="fc:frame:button:1:action" content="post" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
        </head>
        <body>
          <h1>Mint Your NFT</h1>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } else if (req.method === 'POST') {
    try {
      console.log('Received POST request:', req.body);
      const { untrustedData } = req.body;
      const userFid = untrustedData?.fid;
      
      if (!userFid) {
        throw new Error("User FID not provided");
      }

      console.log('Attempting to mint for FID:', userFid);
      const transactionHash = await performMint(userFid);
      console.log('Minting successful. Transaction hash:', transactionHash);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>NFT Minted Successfully</title>
            <meta name="fc:frame" content="vNext" />
            <meta name="fc:frame:image" content="${IMAGE_URL}" />
            <meta name="og:image" content="${IMAGE_URL}" />
            <meta name="og:title" content="NFT Minted Successfully" />
            <meta name="fc:frame:button:1" content="View Transaction" />
            <meta name="fc:frame:button:1:action" content="post" />
            <meta name="fc:frame:button:2" content="Mint Another" />
            <meta name="fc:frame:button:2:action" content="post" />
            <meta name="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>NFT Minted Successfully!</h1>
            <p>Transaction Hash: ${transactionHash}</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (error) {
      console.error('Error minting NFT:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Minting Error</title>
            <meta name="fc:frame" content="vNext" />
            <meta name="fc:frame:image" content="${IMAGE_URL}" />
            <meta name="og:image" content="${IMAGE_URL}" />
            <meta name="og:title" content="Minting Error" />
            <meta name="fc:frame:button:1" content="Try Again" />
            <meta name="fc:frame:button:1:action" content="post" />
            <meta name="fc:frame:post_url" content="${postUrl}" />
          </head>
          <body>
            <h1>Minting Error</h1>
            <p>${errorMessage}</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function performMint(userFid: string) {
  console.log('Initializing ThirdwebSDK');
  const sdk = new ThirdwebSDK(Base, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });

  console.log('Getting contract');
  const contract = await sdk.getContract(CONTRACT_ADDRESS);
  
  // Convert FID to an Ethereum address (this is a simplified approach)
  const address = `0x${userFid.padStart(40, '0')}`;
  console.log('Minting to address:', address);
  
  const mintResult = await contract.erc721.mint(address);
  console.log('Mint result:', mintResult);
  return mintResult.receipt.transactionHash;
}

function getBaseUrl(req: NextApiRequest): string {
  const host = req.headers.host || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}