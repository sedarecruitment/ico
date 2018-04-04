require('babel-register');
require('babel-polyfill');

const fs = require('fs');
const HDWalletProvider = require("truffle-hdwallet-provider");

// const filePath = '/home/john/Documents/EthData/MetaMask\ Seed\ Words';
// const encoding = 'utf-8';
let mnemonic = 'retire hollow frost beach know moon alarm tobacco measure near federal wish';

// fs.readFile(filePath, encoding, function(err, data) {
//   if (!err) {
//     mnemonic = data;
//   } else {
//     console.error(err);
//     return;
//   }
// });

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    develop: {
      host: "localhost",
      port: 9003,
      network_id: "9394",
      gas: 4612388
    },
    secdevelop: {
      host: "localhost",
      port: 9394,
      network_id: "9394",
      gas: 4700000
    },
    ganache: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 6000000
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      from: "0x4ceB72413a95A6926c4ca9b8334Cd51dC6EF6612",
      network_id: 4,
      gas: 4612388
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/DTcDoW9ioMK8TORBeG4F");
      },
      network_id: 3,
      gas: 4612388
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  mocha: {
    useColors: true
  }
};
