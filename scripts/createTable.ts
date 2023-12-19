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

async function writeCSVToFile(
  csvData: string,
  filePath: string
): Promise<void> {
  try {
    await fs.promises.writeFile(filePath, csvData);
    console.log(`CSV data has been written to ${filePath}`);
  } catch (error) {
    console.error("Error writing CSV file:", error);
  }
}

function getAverageOfAvges(fileName: string, price: number) {
  let decimal = 18;
  if (fileName.startsWith("hedera")) {
    decimal = 0
  }
  const [avgGas1, avgTime1] = getPerfs(fileName + ".json", price, decimal);
  const [avgGas2, avgTime2] = getPerfs(fileName + "2.json", price, decimal);
  const [avgGas3, avgTime3] = getPerfs(fileName + "3.json", price, decimal);
  let gasAvges = [avgGas1, avgGas2, avgGas3];
  let timeAvges = [avgTime1, avgTime2, avgTime3];
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
  const maticPrice = await getPriceInUSD("matic-network");
  const celoPrice = await getPriceInUSD("celo");
  const avalanchePrice = await getPriceInUSD("avalanche-2");
  // const hederaPrice = await getPriceInUSD("hedera-hashgraph");
  const binancecoinPrice = await getPriceInUSD("binancecoin");
  const arbitrumPrice = await getPriceInUSD("arbitrum");
  const optimismPrice = await getPriceInUSD("optimism");
  const fantomPrice = await getPriceInUSD("fantom");
  const tronPrice = await getPriceInUSD("tron");
  const confluxPrice = await getPriceInUSD("conflux-token");

  let [ethereumGasAvges, ethereumTimeAvges] = getAverageOfAvges(
    "ethereumPass",
    ethereumPrice
  );
  let [maticGasAvges, maticTimeAvges] = getAverageOfAvges(
    "polygonPass",
    maticPrice
  );
  let [celoGasAvges, celoTimeAvges] = getAverageOfAvges("celoPass", celoPrice);
  let [avalancheGasAvges, avalancheTimeAvges] = getAverageOfAvges(
    "avalanchePass",
    avalanchePrice
  );
  let [hederaGasAvges, hederaTimeAvges] = getAverageOfAvges("hederaPass", 1);
  let [binanceGasAvges, binanceTimeAvges] = getAverageOfAvges(
    "binancePass",
    binancecoinPrice
  );
  let [arbitrumGasAvges, arbitrumTimeAvges] = getAverageOfAvges(
    "arbitrumPass",
    arbitrumPrice
  );
  let [optimismGasAvges, optimismTimeAvges] = getAverageOfAvges(
    "optimismPass",
    optimismPrice
  );
  let [fantomGasAvges, fantomTimeAvges] = getAverageOfAvges(
    "fantomPass",
    fantomPrice
  );
  let [tronGasAvges, tronTimeAvges] = getPerfs("tronPass.json", tronPrice, 0);
  let [confluxGasAvges, confluxTimeAvges] = getAverageOfAvges(
    "confluxPass",
    confluxPrice
  );
  console.log(ethereumGasAvges, ethereumTimeAvges);

  csvStringCost +=
    [
      "registerFunction",
      ethereumGasAvges.registerFunction,
      maticGasAvges.registerFunction,
      celoGasAvges.registerFunction,
      avalancheGasAvges.registerFunction,
      hederaGasAvges.registerFunction,
      binanceGasAvges.registerFunction,
      arbitrumGasAvges.registerFunction,
      optimismGasAvges.registerFunction,
      fantomGasAvges.registerFunction,
      tronGasAvges.registerFunction,
      confluxGasAvges.registerFunction,
    ].join(",") +
    "\n" +
    [
      "registerPlatform",
      ethereumGasAvges.registerPlatform,
      maticGasAvges.registerPlatform,
      celoGasAvges.registerPlatform,
      avalancheGasAvges.registerPlatform,
      hederaGasAvges.registerPlatform,
      binanceGasAvges.registerPlatform,
      arbitrumGasAvges.registerPlatform,
      optimismGasAvges.registerPlatform,
      fantomGasAvges.registerPlatform,
      tronGasAvges.registerPlatform,
      confluxGasAvges.registerPlatform,
    ].join(",") +
    "\n" +
    [
      "storePassword",
      ethereumGasAvges.storePassword,
      maticGasAvges.storePassword,
      celoGasAvges.storePassword,
      avalancheGasAvges.storePassword,
      hederaGasAvges.storePassword,
      binanceGasAvges.storePassword,
      arbitrumGasAvges.storePassword,
      optimismGasAvges.storePassword,
      fantomGasAvges.storePassword,
      tronGasAvges.storePassword,
      confluxGasAvges.storePassword,
    ].join(",") +
    "\n" +
    [
      "getPassword",
      ethereumGasAvges.getPassword,
      maticGasAvges.getPassword,
      celoGasAvges.getPassword,
      avalancheGasAvges.getPassword,
      hederaGasAvges.getPassword,
      binanceGasAvges.getPassword,
      arbitrumGasAvges.getPassword,
      optimismGasAvges.getPassword,
      fantomGasAvges.getPassword,
      tronGasAvges.getPassword,
      confluxGasAvges.getPassword,
    ].join(",") +
    "\n" +
    [
      "freezeAccount",
      ethereumGasAvges.freezeAccount,
      maticGasAvges.freezeAccount,
      celoGasAvges.freezeAccount,
      avalancheGasAvges.freezeAccount,
      hederaGasAvges.freezeAccount,
      binanceGasAvges.freezeAccount,
      arbitrumGasAvges.freezeAccount,
      optimismGasAvges.freezeAccount,
      fantomGasAvges.freezeAccount,
      tronGasAvges.freezeAccount,
      confluxGasAvges.freezeAccount,
    ].join(",") +
    "\n";

  // Time in MS
  csvStringTime +=
    [
      "registerFunction",
      ethereumTimeAvges.registerFunction,
      maticTimeAvges.registerFunction,
      celoTimeAvges.registerFunction,
      avalancheTimeAvges.registerFunction,
      hederaTimeAvges.registerFunction,
      binanceTimeAvges.registerFunction,
      arbitrumTimeAvges.registerFunction,
      optimismTimeAvges.registerFunction,
      fantomTimeAvges.registerFunction,
      tronTimeAvges.registerFunction,
      confluxTimeAvges.registerFunction,
    ].join(",") +
    "\n" +
    [
      "registerPlatform",
      ethereumTimeAvges.registerPlatform,
      maticTimeAvges.registerPlatform,
      celoTimeAvges.registerPlatform,
      avalancheTimeAvges.registerPlatform,
      hederaTimeAvges.registerPlatform,
      binanceTimeAvges.registerPlatform,
      arbitrumTimeAvges.registerPlatform,
      optimismTimeAvges.registerPlatform,
      fantomTimeAvges.registerPlatform,
      tronTimeAvges.registerPlatform,
      confluxTimeAvges.registerPlatform,
    ].join(",") +
    "\n" +
    [
      "storePassword",
      ethereumTimeAvges.storePassword,
      maticTimeAvges.storePassword,
      celoTimeAvges.storePassword,
      avalancheTimeAvges.storePassword,
      hederaTimeAvges.storePassword,
      binanceTimeAvges.storePassword,
      arbitrumTimeAvges.storePassword,
      optimismTimeAvges.storePassword,
      fantomTimeAvges.storePassword,
      tronTimeAvges.storePassword,
      confluxTimeAvges.storePassword,
    ].join(",") +
    "\n" +
    [
      "getPassword",
      ethereumTimeAvges.getPassword,
      maticTimeAvges.getPassword,
      celoTimeAvges.getPassword,
      avalancheTimeAvges.getPassword,
      hederaTimeAvges.getPassword,
      binanceTimeAvges.getPassword,
      arbitrumTimeAvges.getPassword,
      optimismTimeAvges.getPassword,
      fantomTimeAvges.getPassword,
      tronTimeAvges.getPassword,
      confluxTimeAvges.getPassword,
    ].join(",") +
    "\n" +
    [
      "freezeAccount",
      ethereumTimeAvges.freezeAccount,
      maticTimeAvges.freezeAccount,
      celoTimeAvges.freezeAccount,
      avalancheTimeAvges.freezeAccount,
      hederaTimeAvges.freezeAccount,
      binanceTimeAvges.freezeAccount,
      arbitrumTimeAvges.freezeAccount,
      optimismTimeAvges.freezeAccount,
      fantomTimeAvges.freezeAccount,
      tronTimeAvges.freezeAccount,
      confluxTimeAvges.freezeAccount,
    ].join(",") +
    "\n";

  writeCSVToFile(
    csvStringCost,
    path.join(__dirname, "../", "results", "gasCost.csv")
  );

  writeCSVToFile(
    csvStringTime,
    path.join(__dirname, "../", "results", "timingMS.csv")
  );

  //   const [avgGas1, avgTime1] = getPerfs("ethereumPass.json", ethereumPrice, 18);
  //   const [avgGas2, avgTime2] = getPerfs("ethereumPass2.json", ethereumPrice, 18);
  //   const [avgGas3, avgTime3] = getPerfs("ethereumPass3.json", ethereumPrice, 18);
  //   let avgsGas = [avgGas1, avgGas2, avgGas3];
  //   let avgsTime = [avgTime1, avgTime2, avgTime3];
  //   let [ethereumGasAvges, ethereumTimeAvges] = getAverageOfAvges(avgsGas, avgsTime);
  //   console.log(ethereumGasAvges, ethereumTimeAvges);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
