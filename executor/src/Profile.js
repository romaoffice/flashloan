import { useAccount, useConnect, configureChains,useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import {useEffect} from "react"
const { chains, publicClient } = configureChains(
  [polygon],
  [publicProvider(), publicProvider()],
)

function Profile() {
  const { address } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork();
  const { error, isLoading, pendingChainId, switchNetwork } =useSwitchNetwork();

  // useEffect(()=>{
  //   console.log('chain',chain);
  //   if(address && chain.id!=polygon.id){
  //     switchNetwork?.(polygon.id);
  //   }
  // },[chain,address])
  
  if (address)
    return (
      <div  style={{'padding':'50px'}}>
        <h2>Executor</h2>
        <div>
          Connected to {address} ({chain.name})
          {chains.map((x) => (
          <button
            disabled={!switchNetwork || x.id === chain?.id}
            key={x.id}
            onClick={() => switchNetwork?.(x.id)}
          >
            Switch to {x.name}
            {isLoading && pendingChainId === x.id && ' (switching)'}
          </button>
          ))}
          <div>{error && error.message}</div>
          {chain?.id !=polygon.id &&
            <div style={{'color':'red'}}>Please switch network to polygon</div>
          }
          
        </div>
        <div>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      </div>
    )
  return (
    <div  style={{'padding':'50px'}}>
      <h2>Executor</h2>
      <button onClick={() => connect()}>Connect Wallet</button>
    </div>
  )
}

export default Profile;