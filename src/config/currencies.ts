import { Types } from "@requestnetwork/request-client.js";

// Tip: For more advanced currency managment, use CurrencyManager from @requestnetwork/currency

export interface ICurrency extends Types.RequestLogic.ICurrency {
  name: string;
  symbol: string;
  chainId: number;
  decimals: number;
}

// key: {chainId}_{checksummedAddress}
export const currencies = new Map<string, ICurrency>([
  [
    "11155111_0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C",
    {
      name: "FaucetToken",
      symbol: "FAU",
      value: "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C",
      chainId: 11155111,
      network: "sepolia",
      decimals: 18, // 18 is correct TODO. just for test
      type: Types.RequestLogic.CURRENCY.ERC20,
    },
  ],
  [
    "11155111_0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    {
      name: "USD Coin",
      symbol: "USDC",
      value: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      chainId: 11155111,
      network: "sepolia",
      decimals: 6,
      type: Types.RequestLogic.CURRENCY.ERC20,
    },
  ],
  [
    "11155111_0x0EC435037161ACd3bB94eb8DF5BC269f17A4E1b9",
    {
      name: "USDT Coin",
      symbol: "USDT",
      value: "0x0EC435037161ACd3bB94eb8DF5BC269f17A4E1b9",
      chainId: 11155111,
      network: "sepolia",
      decimals: 6,
      type: Types.RequestLogic.CURRENCY.ERC20,
    },
  ],
  [
    "11155111_0x0EC435037161ACd3bB94eb8DF5BC269f17A4E1b8", // Testing only
    {
      name: "Solana",
      symbol: "SOL",
      value: "0x0EC435037161ACd3bB94eb8DF5BC269f17A4E1b9",
      chainId: 11155111,
      network: "sepolia",
      decimals: 9,
      type: Types.RequestLogic.CURRENCY.ERC20,
    },
  ],
  [
    "11155111_0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C", // Testing only
    {
      name: "Ethereum",
      symbol: "ETH",
      value: "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623D",
      chainId: 11155111,
      network: "sepolia",
      decimals: 18, // 18 is correct TODO. just for test
      type: Types.RequestLogic.CURRENCY.ETH,
    },
  ],
]);
