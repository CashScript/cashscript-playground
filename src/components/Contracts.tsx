import React from 'react'
import CopyText from './shared/CopyText'
import { Card, Button } from 'react-bootstrap'
import { ContractInfo } from './shared'
import InfoUtxos from './shared/InfoUtxos'
import { MockNetworkProvider, NetworkProvider, randomUtxo } from 'cashscript'
import CreateUtxo from './shared/CreateUtxo'

interface Props {
  provider: NetworkProvider
  contracts: ContractInfo[] | undefined
  setContracts: (contract: ContractInfo[] | undefined) => void
  updateUtxosContract: (contractName: string) => void
}

const Contracts: React.FC<Props> = ({ provider, contracts, setContracts, updateUtxosContract }) => {

  const removeContract = (contractInfo: ContractInfo) => {
    const contractToRemove = contractInfo.contract
    const newContracts = contracts?.filter(ci => ci.contract.name !== contractToRemove.name)
    setContracts(newContracts)
  }

  const addRandomUtxo = (contractInfo:ContractInfo) => {
    if(!(provider instanceof MockNetworkProvider)) return
    const contract = contractInfo.contract as any
    const address = contract.contractType === 'p2s' ? contract.lockingBytecode : contract.address
    provider.addUtxo(address, randomUtxo())
    updateUtxosContract(contractInfo.contract.name)
  }

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
      <h2>Contracts</h2>
      {contracts == undefined ? <p>
        No Contracts created yet...
      </p>:null}
      {contracts?.map((contractInfo) => {
        const contract = contractInfo.contract as any
        const isP2s = contract.contractType === 'p2s'
        return (
        <Card style={{ marginBottom: '10px' }} key={contractInfo.contract.name + (isP2s ? contract.lockingBytecode : contract.address)}>
          <Card.Header style={{ display:"flex", justifyContent:"space-between"}}>
            <div>{contractInfo.contract.name}</div>
            <img src='./trash.svg' onClick={() => removeContract(contractInfo)} style={{padding: "0px 6px", width: "28px", cursor:"pointer"}}/>
          </Card.Header>
          <Card.Body>
            <div style={{ margin: '5px', width: '100%' }}>
              <strong>Contract type: </strong>
              <span>{contract.contractType}</span><br/>
              {!isP2s && <>
                <strong>Contract address</strong>
                <CopyText>{contract.address}</CopyText>
                <strong>Contract token address</strong>
                <CopyText>{contract.tokenAddress}</CopyText>
              </>}
              <strong>Contract locking bytecode</strong>
              <CopyText>{contract.lockingBytecode}</CopyText>
              <strong>Contract artifact</strong>
              <p>{contractInfo.contract.artifact.contractName}</p>
              <strong>Contract arguments</strong>
              <p>{contractInfo.args.length} {contractInfo.args.length === 1 ? "argument" : "arguments"}</p>
              {contractInfo.args.length > 0 && (
                <details>
                  <summary>Details</summary>
                    <div>
                      {contractInfo.args.map((arg, index) => (<div key={`${contractInfo.contract.name}-arg-${index}`}>
                          {contractInfo.contract.artifact.constructorInputs[index]?.type} {contractInfo.contract.artifact.constructorInputs[index]?.name + ": "}
                          {typeof arg == "bigint" ? arg.toString() : null}
                          {typeof arg == "string" || typeof arg == "number" ? arg : null}
                      </div>))}
                    </div>
                </details>
              )}
              <strong>Contract utxos</strong>
              {contractInfo?.utxos == undefined? 
                <p>loading ...</p>:
                (<div>
                  {contractInfo?.utxos.length} {contractInfo?.utxos.length == 1 ? "utxo" : "utxos"}
                  <details style={{width: "fit-content"}}>
                    <summary>Show utxos</summary>
                    <div>
                      <InfoUtxos utxos={contractInfo?.utxos}/>
                    </div>
                  </details> 
                  { undefined === (provider as MockNetworkProvider)?.addUtxo ? (
                    <div style={{cursor:"pointer", marginLeft:"10px"}}>
                      <Button size='sm' onClick={() => updateUtxosContract(contractInfo.contract.name)} variant='secondary' style={{padding:" 0px 2px"}}>refresh ⭯</Button>
                    </div>)
                  : null}
                </div>)
              }
              { undefined !== (provider as MockNetworkProvider)?.addUtxo ? (
                <div>
                  <strong>Create new contract utxo</strong>
                  <div onClick={() => addRandomUtxo(contractInfo)} style={{cursor:"pointer"}}>
                    <Button size='sm' variant='secondary' style={{padding:"0px 2px"}}>add random utxo</Button>
                  </div>
                  <details style={{maxWidth: "50%"}}>
                    <summary>Create custom utxo</summary>
                    <CreateUtxo provider={provider} address={isP2s ? contract.lockingBytecode : contract.address}
                      updateUtxos={() => updateUtxosContract(contractInfo.contract.name)}/>
                  </details>
                </div>) : null}
              <strong>Total contract balance</strong>
              {contractInfo.utxos == undefined? 
                <p>loading ...</p>:
                <p>{contractInfo.utxos?.reduce((acc, utxo) => acc + utxo.satoshis, 0n).toString()} satoshis</p>
              }
              <strong>Contract size</strong>
              <p>{contractInfo.contract.bytesize} bytes (max {isP2s ? '201' : '10,000'} bytes)</p>
            </div>
          </Card.Body>
        </Card>
        )
      })}
    </div>
  )
}

export default Contracts
