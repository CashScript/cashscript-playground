import React from 'react'
import { Artifact, Contract, Network, Utxo } from 'cashscript'
import ContractFunctions from './ContractFunctions';
import { Wallet } from './shared'

interface Props {
  artifacts?: Artifact[]
  network: Network
  wallets: Wallet[]
  utxos: Utxo[] | undefined
  updateUtxosContract: () => void
  contract: Contract | undefined
}

const TransactionBuilder: React.FC<Props> = ({ artifacts, network, wallets, contract, utxos, updateUtxosContract }) => {

  const contractName = contract?.name
  const artifact = artifacts?.find(artifact => artifact.contractName == contractName)

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
      <h2>TransactionBuilder</h2>
      <ContractFunctions artifact={artifact} contract={contract} network={network} wallets={wallets} contractUtxos={utxos} updateUtxosContract={updateUtxosContract} />
    </div>
  )
}

export default TransactionBuilder
