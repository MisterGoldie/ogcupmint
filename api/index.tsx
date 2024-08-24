import { NextApiRequest, NextApiResponse } from 'next';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { BaseGoerli } from "@thirdweb-dev/chains";

// Define the contract address
const CONTRACT_ADDRESS = '0x404240F00cDDC0070117e6D046Bf5D118A7E9641';
const IMAGE_URL = 'https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmPajdnayjQgnbtLAXf1FyFL2tpZ7kDZBrqULB4XRLBWkb';

function getBaseUrl(req: NextApiRequest) {
  const host = req.headers.host || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

const mintABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to /api/frame`);
  const baseUrl = process.env.NEXT_PUBLIC_URL || getBaseUrl(req);
  const postUrl = `${baseUrl}/api/frame`;

  if (req.method === 'GET') {
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
    try {
      if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY is not set in environment variables');
      }
      const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, BaseGoerli);
      const contract = await sdk.getContract(CONTRACT_ADDRESS, mintABI);
      const address = req.body?.untrustedData?.fid ? `fid:${req.body.untrustedData.fid}` : 'unknown';
      const mintResult = await contract.call("mint", [address]);
      const transactionHash = mintResult.receipt.transactionHash;

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
            <p>Error: ${errorMessage}</p>
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

async function getAdminRole() {
  try {
    const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY!, BaseGoerli);
    const contract = await sdk.getContract(CONTRACT_ADDRESS);
    const adminRole = await contract.call("DEFAULT_ADMIN_ROLE");
    console.log('Admin Role:', adminRole);
    return adminRole;
  } catch (error) {
    console.error('Error fetching admin role:', error);
  }
}

getAdminRole();
