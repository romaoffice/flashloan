import logo from './logo.svg';
import './App.css';
import { WagmiConfig, configureChains ,createConfig } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { polygon } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import Profile from './Profile';


const { chains, publicClient } = configureChains(
  [polygon],
  [publicProvider(), publicProvider()],
)


const config = createConfig({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  publicClient
})

function App() {
  return (
    <WagmiConfig config={config}>
      <Profile/>

    </WagmiConfig>
  );
}

export default App;
