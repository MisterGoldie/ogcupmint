"use strict";(()=>{var e={};e.id=905,e.ids=[905],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},312:(e,t,r)=>{r.r(t),r.d(t,{config:()=>u,default:()=>f,routeModule:()=>h});var o={};r.r(o),r.d(o,{default:()=>handler});var n=r(802),a=r(44),s=r(249);let c=require("@thirdweb-dev/sdk"),i="https://amaranth-adequate-condor-278.mypinata.cloud/ipfs/QmPajdnayjQgnbtLAXf1FyFL2tpZ7kDZBrqULB4XRLBWkb",l=process.env.THIRDWEB_CLIENT_ID,m=process.env.THIRDWEB_SECRET_KEY,p=process.env.NFT_CONTRACT_ADDRESS,d=process.env.PRIVATE_KEY;async function handler(e,t){console.log(`Received ${e.method} request to /api/frame`);try{let r=process.env.NEXT_PUBLIC_URL||function(e){let t=e.headers.host||"localhost:3000";return`https://${t}`}(e),o=`${r}/api/frame`;if("GET"===e.method){let e=`
        <!DOCTYPE html>
        <html>
          <head>
            <title>NFT Minting Frame</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${i}" />
            <meta property="og:image" content="${i}" />
            <meta property="og:title" content="NFT Minting Frame" />
            <meta property="fc:frame:button:1" content="Mint NFT" />
            <meta property="fc:frame:button:1:action" content="post" />
            <meta property="fc:frame:post_url" content="${o}" />
          </head>
          <body>
            <h1>Click to mint your NFT</h1>
          </body>
        </html>
      `;return t.setHeader("Content-Type","text/html"),t.setHeader("Cache-Control","no-cache, no-store, must-revalidate"),t.status(200).send(e)}if("POST"!==e.method)return t.setHeader("Allow",["GET","POST"]),t.status(405).end(`Method ${e.method} Not Allowed`);{console.log("Handling POST request for minting"),console.log("Request body:",JSON.stringify(e.body,null,2));let{untrustedData:r}=e.body,n=r?.fid;if(!n)throw Error("User FID not provided");let a=`0x${n.padStart(40,"0")}`;if(console.log("User address:",a),!l||!m||!p||!d)throw Error("Missing required environment variables");let s=c.ThirdwebSDK.fromPrivateKey(d,"base",{clientId:l,secretKey:m}),f=await s.getContract(p);console.log("Minting NFT...");let u=await f.erc721.mint({to:a,metadata:{name:"Farcaster Frame NFT",description:"An NFT minted through a Farcaster Frame",image:i}}),h=await u.receipt,y=h.transactionHash;console.log("Minting successful. Transaction hash:",y);let T=`
        <!DOCTYPE html>
        <html>
          <head>
            <title>NFT Minted Successfully</title>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${i}" />
            <meta property="og:image" content="${i}" />
            <meta property="og:title" content="NFT Minted Successfully" />
            <meta property="fc:frame:button:1" content="View Transaction" />
            <meta property="fc:frame:button:1:action" content="link" />
            <meta property="fc:frame:button:1:target" content="https://basescan.org/tx/${y}" />
            <meta property="fc:frame:button:2" content="Mint Another" />
            <meta property="fc:frame:button:2:action" content="post" />
            <meta property="fc:frame:post_url" content="${o}" />
          </head>
          <body>
            <h1>NFT Minted Successfully!</h1>
            <p>Transaction Hash: ${y}</p>
          </body>
        </html>
      `;return t.setHeader("Content-Type","text/html"),t.setHeader("Cache-Control","no-cache, no-store, must-revalidate"),t.status(200).send(T)}}catch(n){console.error("Error in frame handler:",n);let r="An unknown error occurred";n instanceof Error&&(r=n.message,console.error("Error stack:",n.stack)),console.error("THIRDWEB_CLIENT_ID:",l?"Set":"Not set"),console.error("THIRDWEB_SECRET_KEY:",m?"Set":"Not set"),console.error("NFT_CONTRACT_ADDRESS:",p),console.error("PRIVATE_KEY:",d?"Set":"Not set");let o=`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Minting Error</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${i}" />
          <meta property="og:image" content="${i}" />
          <meta property="og:title" content="Minting Error" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:post_url" content="${e.headers.host}/api/frame" />
        </head>
        <body>
          <h1>Minting Error</h1>
          <p>Error: ${r}</p>
        </body>
      </html>
    `;return t.setHeader("Content-Type","text/html"),t.setHeader("Cache-Control","no-cache, no-store, must-revalidate"),t.status(200).send(o)}}let f=(0,s.l)(o,"default"),u=(0,s.l)(o,"config"),h=new n.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/frame",pathname:"/api/frame",bundlePath:"",filename:""},userland:o})}};var t=require("../../webpack-api-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),r=t.X(0,[222],()=>__webpack_exec__(312));module.exports=r})();