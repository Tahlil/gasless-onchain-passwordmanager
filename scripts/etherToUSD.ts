import fs from 'fs';
import path from 'path';
import { CoinGeckoClient } from 'coingecko-api-v3';
const client = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true,
});

async function main() {
    // const list = await client.coinList({});
    // console.log(list);
    const price = (await client.simplePrice({vs_currencies: "usd", ids: "ethereum"})).ethereum.usd
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
  
