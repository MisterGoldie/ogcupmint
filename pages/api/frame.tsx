import { NextApiRequest, NextApiResponse } from 'next';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

// Constants
const IMAGE_URL = 'https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmPajdnayjQgnbtLAXf1FyFL2tpZ7kDZBrqULB4XRLBWkb'; // Your image URL
const THIRDWEB_CLIENT_ID = process.env.THIRDWEB_CLIENT_ID;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request to /api/frame`);
  
  const baseUrl = process.env.NEXT_PUBLIC_URL || `https://${req.headers.host}`;
  const postUrl = `${baseUrl}/api/frame`;

  if (req.method === 'GET') {
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
    
    try {
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

      // Initialize the SDK
      const sdk = new ThirdwebSDK("base", {
        clientId: THIRDWEB_CLIENT_ID,
        secretKey: THIRDWEB_SECRET_KEY,
      });

      // Get the contract
      console.log('Getting contract...');
      const contract = await sdk.getContract(NFT_CONTRACT_ADDRESS);
      console.log('Contract retrieved');

      // Mint the NFT
      console.log('Minting NFT...');
      const tx = await contract.erc721.mint({
        to: userAddress,
        metadata: {
          name: "Farcaster Frame NFT",
          description: "An NFT minted through a Farcaster Frame",
          image: IMAGE_URL,
        },
      });
      console.log('Minting transaction:', tx);

      const receipt = await tx.receipt;
      const txHash = receipt.transactionHash;

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
    } catch (error) {
      console.error('Error in frame handler:', error);
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error stack:', error.stack);
      }
      
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