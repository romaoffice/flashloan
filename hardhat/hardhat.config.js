require("@nomicfoundation/hardhat-toolbox");
require("hardhat-interface-generator");
// Replace this private key with your Goerli account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const ARBITRUM_PRIVATE_KEY = "YOUR GOERLI PRIVATE KEY";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR : true,
        },        
      }
    ],
  }
};
