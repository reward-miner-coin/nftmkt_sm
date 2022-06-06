import fs from 'fs-extra';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { MediaFactory } from '../typechain/MediaFactory';
import { MarketFactory } from '../typechain/MarketFactory';
const hre = require("hardhat");
const ethers = hre.ethers;

async function start() {
  /*const args = require('minimist')(process.argv.slice(2));
  if (!args.chainId) {
    throw new Error('--chainId chain ID is required');
  }
  const path = `${process.cwd()}/.env${
    args.chainId === 1 ? '.prod' : args.chainId === 4 ? '.dev' : '.local'
  }`;*/
  await require('dotenv').config();

  //const provider = new JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
  //const wallet = new Wallet(`0x${process.env.PRIVATEKEY}`, provider);
  const [deployer] = await ethers.getSigners();

  //const sharedAddressPath = `${process.cwd()}/addresses/${process.env.CHAIN_ID}.json`;
  //@ts-ignore
  //const addressBook = JSON.parse(await fs.readFileSync(sharedAddressPath));

  //console.log(addressBook);

  /*if (addressBook.market) {
     throw new Error(
       `market already exists in address book at ${sharedAddressPath}. Please move it first so it is not overwritten`
     );
  }
  if (addressBook.media) {
    throw new Error(
      `media already exists in address book at ${sharedAddressPath}. Please move it first so it is not overwritten`
    );
  }*/

  let addressBook = { media: '', market: '' };

  console.log('Deploying Market...');
  const deployTx = await new MarketFactory(deployer).deploy();
  console.log('Deploy TX: ', deployTx.deployTransaction.hash);
  await deployTx.deployed();
  console.log('Market deployed at ', deployTx.address);
  addressBook.market = deployTx.address;
  
  console.log('Deploying Media...');
  const mediaDeployTx = await new MediaFactory(deployer).deploy(
    addressBook.market
  );
  console.log(`Deploy TX: ${mediaDeployTx.deployTransaction.hash}`);
  console.log(`Media deployed at ${mediaDeployTx.address}`);
  addressBook.media = mediaDeployTx.address;

  console.log('Configuring Market...');
  const market = MarketFactory.connect(addressBook.market, deployer);
  const tx = await market.configure(addressBook.media);
  console.log(`Market configuration tx: ${tx.hash}`);
  await tx.wait();
  console.log(`Market configured.`);

  // await fs.writeFile(sharedAddressPath, JSON.stringify(addressBook, null, 2));
  // console.log(`Contracts deployed and configured.`);
}

start().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
