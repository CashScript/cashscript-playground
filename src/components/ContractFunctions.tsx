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
    <div>
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
