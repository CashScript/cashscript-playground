import React from 'react'
import { Network } from 'cashscript'
import ContractFunction from './ContractFunction'
import { Wallet, ContractInfo } from './shared'

interface Props {
  contractInfo: ContractInfo
  network: Network
  wallets: Wallet[]
  updateUtxosContract: (contractName: string) => void
}

const ContractFunctions: React.FC<Props> = ({ contractInfo, network, wallets, updateUtxosContract }) => {
  const functions = contractInfo.contract.artifact?.abi.map(func => (
    <ContractFunction contractInfo={contractInfo} key={func.name} abi={func} network={network} wallets={wallets} updateUtxosContract={updateUtxosContract}/>
  ))

  return (
    <div>
      <h5>Functions</h5>
      {functions}
    </div>
  )
}

export default ContractFunctions
