// pages/api/frame.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { BaseGoerli } from '@thirdweb-dev/chains';

const STATIC_IMAGE_URL = 'https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmYmLrfR3R67ZUfcFpo8DvnEoKnRqRv3gY9oRbsrnP7UZm';
const CONTRACT_ADDRESS = '0x404240F00cDDC0070117e6D046Bf5D118A7E9641';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Initial frame
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NFT Minting Frame</title>
          <meta property="og:image" content="${STATIC_IMAGE_URL}" />
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${STATIC_IMAGE_URL}" />
          <meta property="fc:frame:button:1" content="Mint NFT" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_URL}/api/frame" />
        </head>
        <body>
          <h1>NFT Minting Frame</h1>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } else if (req.method === 'POST') {
    // Handle minting
    try {
      const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY!, BaseGoerli);
      const contract = await sdk.getContract(CONTRACT_ADDRESS);
      
      const address = req.body?.untrustedData?.fid ? `fid:${req.body.untrustedData.fid}` : 'unknown';
      const mintResult = await contract.erc721.mint(address);
      const transactionHash = mintResult.receipt.transactionHash;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>NFT Minted Successfully</title>
            <meta property="og:image" content="${STATIC_IMAGE_URL}" />
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${STATIC_IMAGE_URL}" />
            <meta property="fc:frame:button:1" content="View Transaction" />
            <meta property="fc:frame:button:2" content="Mint Another" />
            <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_URL}/api/frame" />
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
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Minting Failed</title>
            <meta property="og:image" content="${STATIC_IMAGE_URL}" />
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${STATIC_IMAGE_URL}" />
            <meta property="fc:frame:button:1" content="Try Again" />
            <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_URL}/api/frame" />
          </head>
          <body>
            <h1>Minting Failed</h1>
            <p>An error occurred while minting the NFT. Please try again.</p>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}