import React from 'react'
import { NetworkProvider } from 'cashscript'
import ContractFunction from './ContractFunction'
import { Wallet, ContractInfo } from './shared'

interface Props {
  contractInfo: ContractInfo
  provider: NetworkProvider
  wallets: Wallet[]
  updateUtxosContract: (contractName: string) => void
}

const ContractFunctions: React.FC<Props> = ({ contractInfo, provider, wallets, updateUtxosContract }) => {
  const functions = contractInfo.contract.artifact?.abi.map(func => (
    <ContractFunction contractInfo={contractInfo} key={func.name} abi={func} provider={provider} wallets={wallets} updateUtxosContract={updateUtxosContract}/>
  ))

  return (
    <div>
      <h5>Functions</h5>
      {functions}
    </div>
  )
}

export default ContractFunctions
