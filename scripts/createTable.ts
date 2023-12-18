import fs from "fs";
import path from "path";
import { CoinGeckoClient } from "coingecko-api-v3";
const client = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true,
});

let csvStringCost =
  "Functions, Ethereum, Polygon, Celo, Avalanche, Hedera Hashgraph, Binance smart chain, Arbitrum, Optimism, Fantom, Tron, Conflux\n";
let csvStringTime =
  "Functions, Ethereum, Polygon, Celo, Avalanche, Hedera Hashgraph, Binance smart chain, Arbitrum, Optimism, Fantom, Tron, Conflux\n";

async function getPriceInUSD(crypto: string) {
  console.log("Calling price");

  return (await client.simplePrice({ vs_currencies: "usd", ids: crypto }))[
    crypto
  ].usd;
}

function getPerfs(fileName: string, price: number, decimal: number) {
  const contractDetailsDataPath = path.join(
    __dirname,
    "../",
    "results",
    fileName
  );

  const jsonData = JSON.parse(fs.readFileSync(contractDetailsDataPath, "utf8"));
  let avgGas: any = {
      registerFunction: 0.0,
      registerPlatform: 0.0,
      storePassword: 0.0,
      getPassword: 0.0,
      freezeAccount: 0.0,
    },
    avgTime: any = {
      registerFunction: 0.0,
      registerPlatform: 0.0,
      storePassword: 0.0,
      getPassword: 0.0,
      freezeAccount: 0.0,
    };
  for (const data of jsonData) {
    for (const val in data) {
      for (const det in data[val]) {
        const splitted = data[val][det].split("/");
        let gas = parseFloat(splitted[0]),
          time = parseFloat(splitted[1].split("ms")[0]);
        avgGas[val] += gas;
        avgTime[val] += time;
      }
    }
  }

  for (let key in avgTime) {
    if (avgTime.hasOwnProperty(key)) {
      avgTime[key] /= 5;
      avgGas[key] /= 5 * 10 ** decimal;
      avgGas[key] *= price;
    }
  }

  return [avgGas, avgTime];
}

function getAverageOfAvges(gasAvges: any, timeAvges: any) {
  let avgGas: any = {
      registerFunction: 0.0,
      registerPlatform: 0.0,
      storePassword: 0.0,
      getPassword: 0.0,
      freezeAccount: 0.0,
    },
    avgTime: any = {
      registerFunction: 0.0,
      registerPlatform: 0.0,
      storePassword: 0.0,
      getPassword: 0.0,
      freezeAccount: 0.0,
    };
  for (const data of gasAvges) {
    for (const val in data) {
      avgGas[val] += data[val];
    }
  }
  for (const data of timeAvges) {
    for (const val in data) {
      avgTime[val] += data[val];
    }
  }
  for (let key in avgTime) {
    if (avgTime.hasOwnProperty(key)) {
      avgTime[key] /= 3;
      avgGas[key] /= 3;
    }
  }
  return [avgGas, avgTime];
}

async function main() {
  const ethereumPrice = await getPriceInUSD("ethereum");
  // const maticPrice = await getPriceInUSD("matic-network");
  // const celoPrice = await getPriceInUSD("celo");
  // const avalanchePrice = await getPriceInUSD("avalanche-2");
  // const hederaPrice = await getPriceInUSD("hedera-hashgraph");
  // const binancecoinPrice = await getPriceInUSD("binancecoin");
  // const arbitrumPrice = await getPriceInUSD("arbitrum");
  // const optimismPrice = await getPriceInUSD("optimism");
  // const fantomfantomPrice = await getPriceInUSD("fantom");
  // const tronPrice = await getPriceInUSD("tron");
  // const confluxPrice = await getPriceInUSD("conflux-token");

  const [avgGas1, avgTime1] = getPerfs("ethereumPass.json", ethereumPrice, 18);
  const [avgGas2, avgTime2] = getPerfs("ethereumPass2.json", ethereumPrice, 18);
  const [avgGas3, avgTime3] = getPerfs("ethereumPass3.json", ethereumPrice, 18);
  let avgsGas = [avgGas1, avgGas2, avgGas3];
  let avgsTime = [avgTime1, avgTime2, avgTime3];
  let [ethereumGasAvges, ethereumTimeAvges] = getAverageOfAvges(avgsGas, avgsTime);
  // console.log(ethereumGasAvges, ethereumTimeAvges);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
