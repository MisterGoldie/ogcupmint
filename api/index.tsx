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
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${IMAGE_URL}" />
          <meta property="fc:frame:button:1" content="Start Minting Process" />
          <meta property="fc:frame:post_url" content="${postUrl}" />
        </head>
        <body>
          <h1>Start NFT Minting Process</h1>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } else if (req.method === 'POST') {
    const { untrustedData } = req.body;
    const step = req.query.step || 'start';

    switch (step) {
      case 'start':
        return res.status(200).send(getConfirmationHtml(postUrl));
      case 'confirm':
        return res.status(200).send(getAddressInputHtml(postUrl));
      case 'mint':
        const address = untrustedData?.inputText;
        if (!address) {
          return res.status(200).send(getErrorHtml("No address provided", postUrl));
        }
        try {
          const result = await performMint(address);
          return res.status(200).send(getSuccessHtml(result, postUrl));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return res.status(200).send(getErrorHtml(errorMessage, postUrl));
        }
      default:
        return res.status(400).send("Invalid step");
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getConfirmationHtml(postUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Confirm Minting</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${IMAGE_URL}" />
        <meta property="fc:frame:button:1" content="Confirm Minting" />
        <meta property="fc:frame:button:2" content="Cancel" />
        <meta property="fc:frame:post_url" content="${postUrl}?step=confirm" />
      </head>
      <body>
        <h1>Confirm NFT Minting</h1>
      </body>
    </html>
  `;
}

function getAddressInputHtml(postUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Enter Ethereum Address</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${IMAGE_URL}" />
        <meta property="fc:frame:input:text" content="Enter your Ethereum address" />
        <meta property="fc:frame:button:1" content="Mint NFT" />
        <meta property="fc:frame:post_url" content="${postUrl}?step=mint" />
      </head>
      <body>
        <h1>Enter Your Ethereum Address</h1>
      </body>
    </html>
  `;
}

async function performMint(address: string) {
  const sdk = new ThirdwebSDK(Base, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });

  const contract = await sdk.getContract(CONTRACT_ADDRESS);
  const mintResult = await contract.erc721.mint(address);
  return mintResult.receipt.transactionHash;
}

function getSuccessHtml(transactionHash: string, postUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>NFT Minted Successfully</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${IMAGE_URL}" />
        <meta property="fc:frame:button:1" content="View Transaction" />
        <meta property="fc:frame:button:2" content="Mint Another" />
        <meta property="fc:frame:post_url" content="${postUrl}" />
      </head>
      <body>
        <h1>NFT Minted Successfully!</h1>
        <p>Transaction Hash: ${transactionHash}</p>
      </body>
    </html>
  `;
}

function getErrorHtml(errorMessage: string, postUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Minting Error</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${IMAGE_URL}" />
        <meta property="fc:frame:button:1" content="Try Again" />
        <meta property="fc:frame:post_url" content="${postUrl}" />
      </head>
      <body>
        <h1>Minting Error</h1>
        <p>${errorMessage}</p>
      </body>
    </html>
  `;
}

function getBaseUrl(req: NextApiRequest): string {
  const host = req.headers.host || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}