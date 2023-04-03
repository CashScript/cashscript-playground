import React, { useState, useEffect } from 'react'
import { Artifact, Contract, Network, Utxo } from 'cashscript'
import { ColumnFlex, Wallet } from './shared'
import ContractCreation from './ContractCreation'
import ContractFunctions from './ContractFunctions'

interface Props {
  artifact?: Artifact
  network: Network
  setNetwork: (network: Network) => void
  style: any
  setShowWallets:(showWallets: boolean) => void
  wallets: Wallet[]
}

const ContractInfo: React.FC<Props> = ({ artifact, network, setNetwork, setShowWallets, style, wallets }) => {
  const [contract, setContract] = useState<Contract | undefined>(undefined)
  const [balance, setBalance] = useState<bigint | undefined>(undefined)
  const [utxos, setUtxos] = useState<Utxo[] | undefined>([])

  useEffect(() => setContract(undefined), [artifact])

  async function updateUtxosContract () {
    if (!contract) return
    setBalance(await contract.getBalance())
    setUtxos(await contract.getUtxos())
  }

  return (
    <ColumnFlex
      id="preview"
      style={{ ...style, flex: 1, margin: '16px' }}
    >
      <ContractCreation artifact={artifact} contract={contract} setContract={setContract} network={network} setNetwork={setNetwork} setShowWallets={setShowWallets} utxos={utxos} balance={balance} updateUtxosContract={updateUtxosContract}/>
      <ContractFunctions artifact={artifact} contract={contract} network={network} wallets={wallets} updateUtxosContract={updateUtxosContract}/>
    </ColumnFlex>
  )
}

export default ContractInfo
