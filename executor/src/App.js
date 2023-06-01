import logo from './logo.svg';
import './App.css';
import { WagmiConfig, configureChains ,createConfig } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { polygon } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import Profile from './Profile';
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { MoralisProvider } from "react-moralis";

const { chains, publicClient } = configureChains(
  [polygon],
  [publicProvider(), publicProvider()],
)

  

const config = createConfig({
  autoConnect: true,
  
  connectors: [
    new InjectedConnector({ chains })
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
