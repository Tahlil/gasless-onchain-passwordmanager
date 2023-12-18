import fs from 'fs';
import path from 'path';
import { CoinGeckoClient } from 'coingecko-api-v3';
const client = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true,
});

let csvStringCost = "Functions, Ethereum, Polygon, Celo, Avalanche, Hedera Hashgraph, Binance smart chain, Arbitrum, Optimism, Fantom, Tron, Conflux\n"
let csvStringTime = "Functions, Ethereum, Polygon, Celo, Avalanche, Hedera Hashgraph, Binance smart chain, Arbitrum, Optimism, Fantom, Tron, Conflux\n"
let price;

async function getPriceInUSD(crypto: string) {
  return (await client.simplePrice({vs_currencies: "usd", ids: crypto}))[crypto].usd
}

async function main() {
    // const list = await client.coinList({});
    // console.log(list);
    // price = await getPriceInUSD("ethereum")
    // price = await getPriceInUSD("matic-network")
    // price = await getPriceInUSD("celo")
    // price = await getPriceInUSD("avalanche-2")
    // price = await getPriceInUSD("hedera-hashgraph")
    // price = await getPriceInUSD("binancecoin")
    // price = await getPriceInUSD("arbitrum")
    // price = await getPriceInUSD("optimism")
    // price = await getPriceInUSD("fantom")
    // price = await getPriceInUSD("tron")
    price = await getPriceInUSD("conflux-token")

    console.log({price});
    
}
// const contractDetailsDataPath = path.join(__dirname, "../", "results", "ethereumPass.json");

// const jsonData = JSON.parse(fs.readFileSync(contractDetailsDataPath, 'utf8'));


// for (const data of jsonData) {
//     for (const val in data) {
//         for (const det in data[val]) {
//            const gas = data[val][det].split("/")[0]
//            console.log(gas);           
//         }
//     } 
// }

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
