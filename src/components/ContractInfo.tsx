import React, { useState, useEffect } from 'react'
import { Artifact, Contract, Network, Utxo } from 'cashscript'
import { ColumnFlex, Wallet } from './shared'
import ContractCreation from './ContractCreation'
import ContractFunctions from './ContractFunctions'
import { ElectrumClient, ElectrumTransport } from 'electrum-cash'

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
  const [electrumClient, setElectrumClient] = useState<ElectrumClient | undefined>(undefined)

  useEffect(() => setContract(undefined), [artifact])

  async function initElectrumSubscription(){
    if(electrumClient) electrumClient?.disconnect()
    if(!contract?.address) return

    // connect to ElectrumClient for subscription
    let electrumServerName: string= ""
    if(network == "mainnet") electrumServerName = 'bch.imaginary.cash'
    if(network == "chipnet")electrumServerName = 'chipnet.imaginary.cash'
    if(network == "testnet4") electrumServerName = 'testnet4.imaginary.cash'
    if(!electrumServerName) return // no imaginary server for  testnet3
    
    const newElectrumClient = new ElectrumClient('Electrum client example', '1.4.1', electrumServerName, ElectrumTransport.WSS.Port, ElectrumTransport.WSS.Scheme)
    await newElectrumClient?.connect();
    // subscribe to contract address
    const refetchContractBalance = async(data:any) => {
      if(data) updateUtxosContract()
    }
    await newElectrumClient?.subscribe(refetchContractBalance, 'blockchain.address.subscribe', contract.address);
    setElectrumClient(newElectrumClient)
  }

  useEffect(() => {
    initElectrumSubscription()
  }, [contract])

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
