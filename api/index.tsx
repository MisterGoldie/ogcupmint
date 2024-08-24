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
    console.log('Handling GET request');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NFT Minting Frame</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${IMAGE_URL}" />
          <meta property="fc:frame:button:1" content="Mint NFT" />
          <meta property="fc:frame:button:2" content="Learn More" />
          <meta property="fc:frame:button:3" content="View Collection" />
          <meta property="fc:frame:post_url" content="${postUrl}" />
        </head>
        <body>
          <h1>Mint Your NFT</h1>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } else if (req.method === 'POST') {
    console.log('Handling POST request');
    const { untrustedData } = req.body;
    const buttonIndex = untrustedData?.buttonIndex;

    let responseHtml;
    switch (buttonIndex) {
      case 1:
        // Mint NFT
        try {
          const sdk = new ThirdwebSDK(Base, {
            secretKey: process.env.THIRDWEB_SECRET_KEY,
          });

          const contract = await sdk.getContract(CONTRACT_ADDRESS);
          
          // Use the FID as the recipient address (this is a simplification and may not work as-is)
          const recipientAddress = `0x${untrustedData.fid.toString(16).padStart(40, '0')}`;
          
          const mintResult = await contract.erc721.mint(recipientAddress);
          console.log('Mint result:', mintResult);

          responseHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>NFT Minted Successfully</title>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${IMAGE_URL}" />
                <meta property="fc:frame:button:1" content="View Transaction" />
                <meta property="fc:frame:button:2" content="Back to Main" />
                <meta property="fc:frame:post_url" content="${postUrl}" />
              </head>
              <body>
                <p>Your NFT has been minted successfully!</p>
                <p>Transaction Hash: ${mintResult.receipt.transactionHash}</p>
              </body>
            </html>
          `;
        } catch (error) {
          console.error('Minting error:', error);
          responseHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Minting Failed</title>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${IMAGE_URL}" />
                <meta property="fc:frame:button:1" content="Try Again" />
                <meta property="fc:frame:post_url" content="${postUrl}" />
              </head>
              <body>
                <p>Minting failed. Please try again.</p>
              </body>
            </html>
          `;
        }
        break;
      case 2:
        // Learn More
        responseHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Learn More About Our NFT</title>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${IMAGE_URL}" />
              <meta property="fc:frame:button:1" content="Back to Minting" />
              <meta property="fc:frame:post_url" content="${postUrl}" />
            </head>
            <body>
              <p>Learn more about our amazing NFT collection!</p>
            </body>
          </html>
        `;
        break;
      case 3:
        // View Collection
        responseHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>View NFT Collection</title>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${IMAGE_URL}" />
              <meta property="fc:frame:button:1" content="Back to Minting" />
              <meta property="fc:frame:post_url" content="${postUrl}" />
            </head>
            <body>
              <p>Here's our current NFT collection!</p>
            </body>
          </html>
        `;
        break;
      default:
        responseHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>NFT Minting Frame</title>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${IMAGE_URL}" />
              <meta property="fc:frame:button:1" content="Mint NFT" />
              <meta property="fc:frame:button:2" content="Learn More" />
              <meta property="fc:frame:button:3" content="View Collection" />
              <meta property="fc:frame:post_url" content="${postUrl}" />
            </head>
            <body>
              <p>Welcome back to the main minting page!</p>
            </body>
          </html>
        `;
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(responseHtml);
  } else {
    console.log(`Unsupported method: ${req.method}`);
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getBaseUrl(req: NextApiRequest): string {
  const host = req.headers.host || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}