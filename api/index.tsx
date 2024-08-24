import { NextApiRequest, NextApiResponse } from 'next';

const IMAGE_URL = 'https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmPajdnayjQgnbtLAXf1FyFL2tpZ7kDZBrqULB4XRLBWkb';
const MINT_URL = 'https://embed.ipfscdn.io/ipfs/bafybeicd3qfzelz4su7ng6n523virdsgobrc5pcbarhwqv3dj3drh645pi/?contract=0x404240F00cDDC0070117e6D046Bf5D118A7E9641&chain=%7B%22name%22%3A%22Base%22%2C%22chain%22%3A%22ETH%22%2C%22rpc%22%3A%5B%22https%3A%2F%2F8453.rpc.thirdweb.com%2F%24%7BTHIRDWEB_API_KEY%7D%22%5D%2C%22nativeCurrency%22%3A%7B%22name%22%3A%22Ether%22%2C%22symbol%22%3A%22ETH%22%2C%22decimals%22%3A18%7D%2C%22shortName%22%3A%22base%22%2C%22chainId%22%3A8453%2C%22testnet%22%3Afalse%2C%22slug%22%3A%22base%22%2C%22icon%22%3A%7B%22url%22%3A%22ipfs%3A%2F%2FQmaxRoHpxZd8PqccAynherrMznMufG6sdmHZLihkECXmZv%22%2C%22width%22%3A1200%2C%22height%22%3A1200%2C%22format%22%3A%22png%22%7D%7D&clientId=d5e30dbd9670f95f0e4c6af6e635c750&theme=dark&primaryColor=blue';

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
        responseHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Redirecting to NFT Minting</title>
              <meta property="fc:frame" content="vNext" />
              <meta property="fc:frame:image" content="${IMAGE_URL}" />
              <meta property="fc:frame:button:1" content="Go to Minting Page" />
              <meta property="fc:frame:post_url" content="${postUrl}" />
            </head>
            <body>
              <p>Ready to mint your NFT!</p>
            </body>
          </html>
        `;
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