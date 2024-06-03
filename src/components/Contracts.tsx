import React from 'react'
import { Contract, Utxo } from 'cashscript'
import CopyText from './shared/CopyText'
import { Card } from 'react-bootstrap'

interface Props {
  contracts: Contract[] | undefined
  setContracts: (contract: Contract[] | undefined) => void
  balance: bigint | undefined
  utxos: Utxo[] | undefined
  updateUtxosContract: () => void
}

const Contracts: React.FC<Props> = ({ contracts, setContracts, utxos, balance, updateUtxosContract }) => {

  const removeContract = (contractToRemove: Contract) => {
    const contractToRemoveAddress = contractToRemove.address;
    const newContracts = contracts?.filter(contract => contract.address !== contractToRemoveAddress)
    setContracts(newContracts)
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
      {contracts?.map(contract => (
        <Card style={{ marginBottom: '10px' }} key={contract.address}>
          <Card.Header style={{ display:"flex", justifyContent:"space-between"}}>
            <div>{contract.name}</div>
            <img src='./trash.svg' onClick={() => removeContract(contract)} style={{padding: "0px 6px", width: "fit-content", cursor:"pointer"}}/>
          </Card.Header>
          <Card.Body>
            <div style={{ margin: '5px', width: '100%' }}>
              <strong>Contract address (p2sh32)</strong>
              <CopyText>{contract.address}</CopyText>
              <strong>Contract token address (p2sh32)</strong>
              <CopyText>{contract.tokenAddress}</CopyText>
              <strong>Contract artifact</strong>
              <p>{contract.artifact.contractName}</p>
              <strong>Contract utxos</strong>
              {utxos == undefined? 
                <p>loading ...</p>:
                (<>
                <p>{utxos.length} {utxos.length == 1 ? "utxo" : "utxos"}</p>
                {utxos.length ? 
                  <details>
                    <summary>Show utxos</summary>
                    <div>
                    </div>
                </details> : null}
                </>)
              }
              <strong>Total contract balance</strong>
              {balance == undefined? 
                <p>loading ...</p>:
                <p>{balance.toString()} satoshis</p>
              }
              <strong>Contract size</strong>
              <p>{contract.bytesize} bytes (max 520), {contract.opcount} opcodes (max 201)</p>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  )
}

export default Contracts
