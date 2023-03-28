import React from 'react'
import { Artifact, Contract, Network } from 'cashscript'
import ContractFunction from './ContractFunction'
import { Wallet } from './shared'

interface Props {
  artifact?: Artifact
  contract?: Contract
  network: Network
  wallets: Wallet[]
}

const ContractFunctions: React.FC<Props> = ({ artifact, contract, network, wallets }) => {
  const functions = artifact?.abi.map(func => (
    <ContractFunction contract={contract} key={func.name} abi={func} network={network} wallets={wallets}/>
  ))

  return (
    <div style={{
      height: '100%',
      border: '2px solid black',
      borderTop: '1px solid black',
      fontSize: '100%',
      lineHeight: 'inherit',
      overflow: 'auto',
      background: '#fffffe',
      padding: '8px 16px',
      color: '#000'
    }}>
      {contract &&
        <div>
          <h2>Functions</h2>
          {functions}
        </div>
      }
    </div>
  )
}

export default ContractFunctions
