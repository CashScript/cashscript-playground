import React from 'react'
import { Contract, Network, Utxo } from 'cashscript'
import ContractFunction from './ContractFunction'
import { Wallet } from './shared'

interface Props {
  contract: Contract
  network: Network
  wallets: Wallet[]
  contractUtxos: Utxo[] | undefined
  updateUtxosContract: () => void
}

const ContractFunctions: React.FC<Props> = ({ contract, network, wallets, contractUtxos, updateUtxosContract }) => {
  const functions = contract.artifact?.abi.map(func => (
    <ContractFunction contract={contract} key={func.name} abi={func} network={network} wallets={wallets} contractUtxos={contractUtxos} updateUtxosContract={updateUtxosContract}/>
  ))

  return (
    <div>
      <h5>Functions</h5>
      {functions}
    </div>
  )
}

export default ContractFunctions
