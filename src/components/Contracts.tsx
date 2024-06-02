import React from 'react'
import { Artifact, Contract, Network, Utxo } from 'cashscript'

interface Props {
  artifacts?: Artifact[]
  network: Network
  setNetwork: (network: Network) => void
  balance: bigint | undefined
  utxos: Utxo[] | undefined
  updateUtxosContract: () => void
  contract: Contract | undefined
  setContract: (contract: Contract | undefined) => void
}

const Contracts: React.FC<Props> = ({ artifacts, network, setNetwork, contract, setContract, utxos, balance, updateUtxosContract }) => {

  return (
    <div style={{
      height: 'calc(100vh - 170px)',
      border: '2px solid black',
      borderBottom: '1px solid black',
      fontSize: '100%',
      lineHeight: 'inherit',
      overflow: 'auto',
      background: '#fffffe',
      padding: '8px 16px',
      color: '#000',
      margin: "16px"
    }}>
      <h2>Contracts</h2>
      hello world
    </div>
  )
}

export default Contracts
