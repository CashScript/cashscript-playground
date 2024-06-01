import React from 'react'
import { Artifact, Contract, Network, Utxo } from 'cashscript'
import ContractFunction from './ContractFunction'
import { Wallet } from './shared'

interface Props {
  artifact?: Artifact
  contract?: Contract
  network: Network
  wallets: Wallet[]
  contractUtxos: Utxo[] | undefined
  updateUtxosContract: () => void
}

const ContractFunctions: React.FC<Props> = ({ artifact, contract, network, wallets, contractUtxos, updateUtxosContract }) => {
  const functions = artifact?.abi.map(func => (
    <ContractFunction contract={contract} key={func.name} abi={func} network={network} wallets={wallets} contractUtxos={contractUtxos} updateUtxosContract={updateUtxosContract}/>
  ))

  return (
    <div style={{
      height: 'calc(100vh - 170px)',
      margin: '16px',
      border: '2px solid black',
      borderTop: '1px solid black',
      fontSize: '100%',
      lineHeight: 'inherit',
      overflow: 'auto',
      background: '#fffffe',
      padding: '8px 16px',
      color: '#000'
    }}>
      {contract ?
        (<div>
          <h2>Functions</h2>
          {functions}
        </div>) : 
        <div>No contract initialised yet...</div>
      }
    </div>
  )
}

export default ContractFunctions
