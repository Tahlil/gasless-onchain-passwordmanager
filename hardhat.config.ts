import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers';
// import '@nomiclabs/hardhat-waffle';
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, './.env') });

const chainIds = {
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  sepolia: 11155111,
  ropsten: 3,
  bsctest: 97,
  bscmain: 56,
  mumbai: 80001,
  polygon: 137,
  fuji: 43113,
  avalanche: 43114,
  alfajores: 44787,
  celo: 42220,
  arbitrumgoerli: 421613,
  optimismgoerli: 420,
  fantomtest: 0xfa2
};

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY1 = process.env.PRIVATE_KEY1;
const API_KEY  = process.env.RPC_NODE_API_KEY;
const MNEMONIC  = process.env.MNEMONIC;
const ETHERSCAN_API_KEY  = process.env.ETHERSCAN_API_KEY as string;

const defaultRPCNodeProvider = process.env.RPC_PROVIDER as string;

const getRPCURL = (network: string, RPCNodeProvider: string) => {
  switch (RPCNodeProvider) {
    case "moralis":
      return `https://speedy-nodes-nyc.moralis.io/${API_KEY}/eth/${network}`;
      
    case "alchemy":
      return `https://eth-${network}.g.alchemy.com/v2/${API_KEY}`;
  
    case "infura":
      return `https://${network}.infura.io/v3/${API_KEY}`;
      
    case "datahub":
      return `https://ethereum-${network}--rpc.datahub.figment.io//apikey/${API_KEY}`;
      
    default:
      console.error("Unknown provider:", RPCNodeProvider);
  }
  return;
};



const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: {
        mnemonic: MNEMONIC,
      },
      chainId: chainIds.hardhat,
    },
    ropsten: {
      url: getRPCURL('ropsten', defaultRPCNodeProvider),
      accounts:  [`0x${PRIVATE_KEY}`],
      chainId: chainIds.ropsten,
    },
    rinkeby: {
      url: getRPCURL('rinkeby', defaultRPCNodeProvider),
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: chainIds.rinkeby,
    },
    kovan: {
      url: getRPCURL('kovan', defaultRPCNodeProvider),
      accounts:  [`0x${PRIVATE_KEY}`],
      chainId: chainIds.kovan,
    },
    goerli: {
      url: getRPCURL('goerli', defaultRPCNodeProvider),
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: chainIds.goerli,
    },
    sepolia: {
      url: getRPCURL('sepolia', defaultRPCNodeProvider),
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
      chainId: chainIds.sepolia,
    },
    mainnet: {
      url: getRPCURL('mainnet', defaultRPCNodeProvider),
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: chainIds.mainnet,
    },
    bsctest: {
      url: 'https://data-seed-prebsc-2-s1.binance.org:8545/',
      chainId: chainIds.bsctest,
      gasPrice: 20000000000,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
    },
    bscmain: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: chainIds.bscmain,
      gasPrice: 20000000000,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com/',
      chainId: chainIds.mumbai,
      gasPrice: 20000000000,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
    },
    polygon: {
      url: 'https://polygon-rpc.com/',
      chainId: chainIds.polygon,
      gasPrice: 20000000000,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: chainIds.fuji,
      // gasPrice: 20000000000,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: chainIds.avalanche,
      // gasPrice: 20000000000,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    arbitrumgoerli: {
      url: 'https://goerli-rollup.arbitrum.io/rpc',
      chainId: chainIds.arbitrumgoerli,
      // gasPrice: 20000000,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
    },
    optimismgoerli: {
      url: 'https://goerli.optimism.io/',
      chainId: chainIds.optimismgoerli,
      // gasPrice: 20000000,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
    },
    fantomtest: {
      url: 'https://rpc.testnet.fantom.network/',
      chainId: chainIds.fantomtest,
      // gasPrice: 20000000,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
    },
    alfajores: {
      url: 'https://alfajores-forno.celo-testnet.org',
      chainId: chainIds.alfajores,
      // gasPrice: 20000000,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
    },
    conflux: {
      url: "https://test.confluxrpc.com",
      // gasPrice: 20000000,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
    },
    celo: {
      url: 'https://forno.celo.org',
      chainId: chainIds.celo,
      // gasPrice: 20000000000,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    nile: {
      url: "https://nile.trongrid.io",
      // gasPrice: 20000000,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY1}`],
    }
  },
 
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },
  gasReporter: {
    currency: 'USD',
    enabled: true,
  },
  typechain: {
    outDir: "./frontend/typechain",
    target: "ethers-v5",
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  }
};

export default config;
