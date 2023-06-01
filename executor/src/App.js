import logo from './logo.svg';
import './App.css';
import { WagmiConfig, configureChains ,createConfig } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { polygon,bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import Profile from './Profile';
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy'
import { MoralisProvider } from "react-moralis";
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

const { chains, publicClient } = configureChains(
  [polygon,bsc],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if(chain.id==polygon.id){
          return ({
            http: `https://polygon.llamarpc.com`,
          })
        }
        if(chain.id==bsc.id){
          return ({
            http: `https://bsc-dataseed.binance.org`,
          })
        }
      }
    })
  ]
)

  

const config = createConfig({
  autoConnect: true,
  
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectLegacyConnector({
      chains: [polygon],
      options: {
        qrcode: true,
      },})
  ],
  publicClient
})

function App() {
  return (
    <MoralisProvider appId="001" serverUrl="http://147.182.213.149:2083/server">
      <WagmiConfig config={config}>
        <Profile/>

      </WagmiConfig>
    </MoralisProvider>
  );
}

export default App;
