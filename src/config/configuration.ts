export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  ethereum: {
    rpcUrl: process.env.ETHEREUM_RPC_URL,
    contractAddress: process.env.ETHEREUM_MORPHO_CONTRACT_ADDRESS,
  },
});
