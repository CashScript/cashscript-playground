import React, { useState, useEffect } from 'react'
import { Artifact, Contract, Network, Utxo } from 'cashscript'
import { ColumnFlex } from './shared'
import ContractCreation from './ContractCreation'
import { ElectrumClient, ElectrumTransport } from 'electrum-cash'

interface Props {
  artifact?: Artifact
  network: Network
  balance: bigint | undefined
  utxos: Utxo[] | undefined
  updateUtxosContract: () => void
  contract: Contract | undefined
  setContract: (contract: Contract | undefined) => void
}

const ContractInfo: React.FC<Props> = ({ artifact, network, contract, setContract, utxos, balance, updateUtxosContract }) => {
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

  return (
    <ColumnFlex>
      <ContractCreation artifact={artifact} contract={contract} setContract={setContract} network={network} utxos={utxos} balance={balance} updateUtxosContract={updateUtxosContract}/>
    </ColumnFlex>
  )
}

export default ContractInfo
