import { ethers } from "ethers";
import { useAccount, useConnect, configureChains, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { polygon, bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import {useRef, useEffect, useState } from "react"
import excutorAbi from './abi/executor'
import ERC20_ABI from './abi/ERC20'
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'

import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'
import { useMoralis } from "react-moralis";
import Moralis from 'moralis-v1';
const { chains } = configureChains(
  [polygon,bsc],
  [publicProvider(), publicProvider()],
)

//https://moralis.io/walletconnect-integration-how-to-integrate-walletconnect/

function Profile() {

  const { logout,authenticate, user,isInitialized,enableWeb3 } = useMoralis();

  const [firstAmount, setFirstAmount] = useState(1);
  const [address1, setAddress1] = useState('0xc2132d05d31c914a87c6611c10748aeb04b58e8f');
  const [address2, setAddress2] = useState('0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270');
  const [dex1, setDex1] = useState('0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506');
  const [dex2, setDex2] = useState('0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff');

  const [hashvalue, sethashValue] = useState("")
  const { address } = useAccount()

  const metamaskConnect  = useConnect({
    connector: new InjectedConnector()
  })

  const walletConnect  = useConnect({
    connector: new WalletConnectLegacyConnector({
      chains: [polygon,bsc],
      options: {
        qrcode: true,
      },})
  })
  
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork();
  const { error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();

  const authhandle = async()=>{
    try{
      // 'auth'
      //await enableWeb3({ throwOnError: true, provider:'walletconnect'});
      //const { account, chainId } = Moralis;
      // Get message to sign from the auth api
      const { message } = await Moralis.Cloud.run('requestMessage', {
        address: address,
        chain: chain.id,
        networkType: 'evm',
      });

      // Authenticate and login via parse
      await authenticate({
        signingMessage: message,
        throwOnError: true,
      });
    }catch(e){
      alert('fail to login');
    }

  }

  const routers = {
    [polygon.id]:[
    { "name": "Uniswap", 'address': '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' ,type:1},
    { "name": "Quickswap", 'address': '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff' ,type:0 },
    { "name": "Sushiswap", 'address': '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506' ,type:0 },
    { "name": "Polycatswap", 'address': '0x94930a328162957FF1dd48900aF67B5439336cBD'  ,type:0}
    ]
    ,
    [bsc.id]:[
      { "name": "Uniswap", 'address': '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2' ,type:1},
      { "name": "MDEX", 'address': '0x62c1a0d92b09d0912f7bb9c96c5ecdc7f2b87059' ,type:0},
      { "name": "PancakeSwap", 'address': '0x10ed43c718714eb63d5aa57b78b54704e256024e' ,type:0}
    ]
  
  }

  const lendingPool = '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb';
  const pool = '0x794a61358d6845594f94dc1db02a252b5b4814ad';

  const executorAddress = {
    [polygon.id]: '0x6372fabb049d554ef26c347989b596b38c664c7f',
    [bsc.id]: '0xB0dd551dAB7B7945aA330873bD355305BBaCf2f2',
  }

  
  const flashLoanExecute = async () => {

    const routerAddress = [dex1, dex2];
    const paths = [address1, address2,address1];
    const types=[0,0];

    if(dex1=='0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45') types[0]=1;
    if(dex1=='0xC60aE14F2568b102F8Ca6266e8799112846DD088') types[0]=2;
    if(dex2=='0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45') types[1]=1;
    if(dex2=='0xC60aE14F2568b102F8Ca6266e8799112846DD088') types[1]=2;

    const decimals = await readContract({
      address: paths[0],
      abi: ERC20_ABI,
      functionName: 'decimals'
    })
    const firstAmountWei = ethers.utils.parseUnits(firstAmount.toString(), decimals);
    const payloadData = [
      firstAmountWei,
      address,
      paths,
      routerAddress,
      types
    ];
    const abiCoder = new ethers.utils.AbiCoder();
    const args =[
      executorAddress[chain.id],
      paths[0],
      firstAmountWei,
      abiCoder.encode(
        ["uint256", "address","address[]","address[]"],
        payloadData
      ),
      0
    ] 
    try{
      const {hash} = await writeContract({
        address: pool,
        abi: [
          { "inputs": [
              { "internalType": "address", "name": "receiverAddress", "type": "address" }, { "internalType": "address", "name": "asset", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "params", "type": "bytes" }, { "internalType": "uint16", "name": "referralCode", "type": "uint16" }], "name": "flashLoanSimple", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        ],
        functionName: 'flashLoanSimple',
        args: args,
        account: address
      })
      sethashValue(hash);
      
    }catch(e){
      alert('Transaction reverted');
    }

    
  }

  const regularExecute = async () => {

    const routerAddress = [dex1,dex2];
    const paths = [address1, address2,address1];
    const types=[0,0];

    if(dex1=='0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45') types[0]=1;
    if(dex1=='0xC60aE14F2568b102F8Ca6266e8799112846DD088') types[0]=2;
    if(dex2=='0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45') types[1]=1;
    if(dex2=='0xC60aE14F2568b102F8Ca6266e8799112846DD088') types[1]=2;

    //approve
    const decimals = await readContract({
      address: paths[0],
      abi: ERC20_ABI,
      functionName: 'decimals'
    })

    const firstAmountWei = ethers.utils.parseUnits(firstAmount.toString(), decimals);
    const allowance = await readContract({
      address: paths[0],
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [address, executorAddress[chain.id]]
    })
    if (Number(allowance)<Number(firstAmountWei)) {
      const args = [executorAddress[chain.id], firstAmountWei];
      await writeContract({
        address: paths[0],
        abi: ERC20_ABI,
        functionName: 'approve',
        args: args,
        account: address
      })
    }
    //send
    const args = [
      [
        firstAmountWei,
        address,
        paths,
        routerAddress,
        types
      ]
    ];
    try {
      const { hash } = await writeContract({
        address: executorAddress[chain.id],
        abi: excutorAbi,
        functionName: 'executeswap',
        args: args,
        account: address
      })
      sethashValue(hash);
    } catch (e) {
      alert('Trasaction reverted');
      console.log(e);
    }
  }
  if (address)
    return (
      <div style={{ 'padding': '50px' }}>
        <h2>Executor</h2>
        {user && 
          (
          <h3>Welcome to morails  {user.get("username")}&nbsp;<button onClick={() => logout()}>Logout from morails</button></h3>)}
        {!user && 
          (<button onClick={() => authhandle()}>Login to morails</button>)
        }
        <div>
          Connected to {address} ({chain.name})
          {chains.map((x) => (
            <button
              disabled={!switchNetwork || x.id === chain?.id}
              key={x.id}
              onClick={() => switchNetwork?.(x.id)}
              style={{"marginRight":"10px","marginLeft":"10px"}}
            >
              Switch to {x.name}
              {isLoading && pendingChainId === x.id && ' (switching)'}
            </button>
          ))}
          <div>{error && error.message}</div>
          {(chain?.id != polygon.id && chain?.id != bsc.id) &&
            <div style={{ 'color': 'red' }}>Please switch network to polygon or bsc</div>
          }

        </div>
        <div>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
        <div style={{ "paddingTop": "30px" }}>
          Amount : <input value={firstAmount} onChange={e => setFirstAmount(e.target.value)} /><br />
          Token1 Address : <input size="50" value={address1} onChange={e => setAddress1(e.target.value)} /><br />
          Token2 Address : <input size="50" value={address2} onChange={e => setAddress2(e.target.value)} /><br />
          Dex 1 :
          <select value={dex1} onChange={e => setDex1(e.target.value)}>
            {routers[chain.id]?.map((item, i) =>
            (
              <option key={i} value={item.address}>
                {item.name}
              </option>
            )
            )}

          </select>
          <br />
          Dex 2 :
          <select value={dex2} onChange={e => setDex2(e.target.value)}>
            {routers[chain.id]?.map((item, i) =>
            (
              <option key={i} value={item.address}>
                {item.name}
              </option>
            )
            )}

          </select>
          <br /><br />
          <button onClick={() => flashLoanExecute()}>Execute FlashLoan</button> &nbsp;&nbsp;&nbsp;
          <button onClick={() => regularExecute()}>Execute Regular</button><br />
          
          
          {hashvalue != "" &&
            <a href={"https://polygonscan.com/tx/" + hashvalue}>last transaction tx : {hashvalue}</a>
          }
        </div>
      </div>
    )
  return (
    <div style={{ 'padding': '50px' }}>
      <h2>Executor</h2>
      <div>
        Connect with :&nbsp;
        <button onClick={() => metamaskConnect.connect()}>Metamask</button>&nbsp;
        <button onClick={() => walletConnect.connect()}>WalletConnector</button>
      </div>
    </div>
  )
}

export default Profile;