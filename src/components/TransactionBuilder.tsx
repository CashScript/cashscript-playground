import React, {useEffect, useState} from 'react'
import { AbiFunction, NetworkProvider, Recipient } from 'cashscript'
import { Wallet, ContractInfo, NamedUtxo } from './shared'
import { Button, Card, Form, InputGroup } from 'react-bootstrap'

interface Props {
  provider: NetworkProvider
  wallets: Wallet[]
  updateUtxosContract: (contractName: string) => void
  contracts: ContractInfo[] | undefined
}

const TransactionBuilderPage: React.FC<Props> = ({ provider, wallets, contracts, updateUtxosContract }) => {

  const [enableLocktime, setEnableLocktime] = useState<Boolean>(false)
  const [locktime, setLocktime] = useState<String>("")

  // transaction inputs, not the same as abi.inputs
  const [inputs, setInputs] = useState<NamedUtxo[]>([{ txid: '', vout: 0, satoshis: 0n, name: ``, isP2pkh: false }])
  const [outputs, setOutputs] = useState<Recipient[]>([{ to: '', amount: 0n }])
  const [outputHasFT, setOutputHasFT] = useState<boolean[]>([])
  const [outputHasNFT, setOutputHasNFT] = useState<boolean[]>([])
  const [namedUtxoList, setNamedUtxoList] = useState<NamedUtxo[]>([])

  const outputFields = outputs.map((output, index) => (
    <div  key={`output-${index}`}>
      {`Output #${index}`}
      <div>
        <InputGroup>
          <Form.Control size="sm"
            placeholder="Receiver address"
            aria-label="Receiver address"
            onChange={(event) => {
              const outputsCopy = [...outputs]
              const output = outputsCopy[index]
              output.to = event.target.value
              outputsCopy[index] = output
              setOutputs(outputsCopy)
            }}
          />
          <Form.Control size="sm"
            placeholder="Satoshi amount"
            aria-label="Satoshi amount"
            onChange={(event) => {
              const outputsCopy = [...outputs]
              const output = outputsCopy[index]
              output.amount = BigInt(event.target.value)
              outputsCopy[index] = output
              setOutputs(outputsCopy)
            }}
          />
        </InputGroup>
      </div>
      <Form style={{ marginTop: '5px', marginBottom: '5px', display: "inline-block" }}>
      <Form.Check
          type="switch"
          id={"outputHasFT" + index}
          label="add tokens to output"
          onChange={() => {
            const oldValue = outputHasFT[index]
            const arrayCopy = [...outputHasFT]
            arrayCopy[index] = !oldValue
            setOutputHasFT(arrayCopy)
          }}
        />
      </Form>
      {outputHasFT[index] ? (
        <Form style={{ marginLeft: '25px', display: "inline-block" }}>
          <Form.Check
            type="switch"
            id={"outputHasNFT" + index}
            label="add NFT to output"
            onChange={() => {
              const oldValue = outputHasNFT[index]
              const arrayCopy = [...outputHasNFT]
              arrayCopy[index] = !oldValue
              setOutputHasNFT(arrayCopy)
            }}
          />
        </Form>)
        : null}
      {outputHasFT[index] ? (
        <div style={{marginBottom:"10px"}}>
          {tokenFields(index)}
        </div>)
        : null}
    </div>
  ))

    const tokenFields = (index: number) => (
      <>
      <InputGroup key={`output-${index}-tokens`}>
        <Form.Control size="sm"
          placeholder="Token Category"
          aria-label="Token Category"
          onChange={(event) => {
            const outputsCopy = [...outputs]
            const output = outputsCopy[index]
            const amount = output.token?.amount || 0n
            const category = event.target.value
            output.token = {...output.token, amount, category}
            outputsCopy[index] = output
            setOutputs(outputsCopy)
          }}
        />
        <Form.Control size="sm"
          placeholder="Amount Fungible Tokens"
          aria-label="Amount Fungible Tokens"
          onChange={(event) => {
            const outputsCopy = [...outputs]
            const output = outputsCopy[index]
            const category = output.token?.category || ""
            const amount = BigInt(event.target.value)
            output.token = {...output.token, amount, category}
            outputsCopy[index] = output
            setOutputs(outputsCopy)
          }}
        />
      </InputGroup>
      {outputHasNFT[index] ? (
          <div>
            <InputGroup key={`output-${index}-NFT`}>
              <Form.Control size="sm"
                placeholder="Token Commitment"
                aria-label="Token Commitment"
                onChange={(event) => {
                  const outputsCopy = [...outputs]
                  const output = outputsCopy[index]
                  const capability = output.token?.nft?.capability || "none"
                  const commitment = event.target.value
                  if(!output.token) output.token = {amount: 0n , category:""}
                  output.token.nft = {capability, commitment}
                  outputsCopy[index] = output
                  setOutputs(outputsCopy)
                }}
              />
              <Form.Control size="sm" id="capability-selector"
                key={`output-${index}-capability-selector`}
                as="select"
                onChange={(event) => {
                  const outputsCopy = [...outputs]
                  const output = outputsCopy[index]
                  const commitment = output.token?.nft?.commitment || ""
                  const capability= event.target.value
                  if(capability != "none" && capability != "minting" && capability != "mutable") return
                  if(!output.token) output.token = {amount: 0n , category:""}
                  output.token.nft = {capability, commitment}
                  outputsCopy[index] = output
                  setOutputs(outputsCopy)
                }}
              >
                <option>Select Capability</option>
                <option value={"none"}>none</option>
                <option value={"minting"}>minting</option>
                <option value={"mutable"}>mutable</option>
              </Form.Control>
            </InputGroup>
          </div>)
          : null}
      </>
    )

  function addOutput() {
    const outputsCopy = [...outputs]
    outputsCopy.push({ to: '', amount: 0n })
    setOutputs(outputsCopy)
  }
  function removeOutput() {
    const outputsCopy = [...outputs]
    outputsCopy.splice(-1)
    setOutputs(outputsCopy)
  }

  function addInput() {
    const inputsCopy = [...inputs]
    inputsCopy.push({ txid: '', vout: 0, satoshis: 0n, name: ``, isP2pkh: false })
    setInputs(inputsCopy)
  }
  function removeInput() {
    const inputsCopy = [...inputs]
    inputsCopy.splice(-1)
    setInputs(inputsCopy)
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
      <h2>TransactionBuilder</h2>
      <Form style={{ marginTop: '10px', marginBottom: '5px' }}>
        <Form.Check
          type="switch"
          id={"noAutomaticChange"}
          label="Enable Transansaction Locktime"
          className='primary'
          style={{ display: "inline-block" }}
          onChange={() => setEnableLocktime(!enableLocktime)}
        />
        
        { enableLocktime && <Form.Control size="sm"
          placeholder="locktime"
          aria-label="locktime"
          style={{ width: "350px", display: "inline-block", marginLeft: "10px" }}
          onChange={(event) => setLocktime(event.target.value)}
        />}
      </Form>

      <div style={{margin: "10px 0"}}> Add Inputs and Outputs to build the transaction:</div>

      <Card style={{ marginBottom: '10px' }}>
          <Card.Header>Inputs{' '}
            <Button variant="outline-secondary" size="sm" disabled={inputs.length <= 1} onClick={removeInput}>-</Button>
              {' ' + inputs.length + ' '}
            <Button variant="outline-secondary" size="sm" onClick={addInput}>+</Button>
          </Card.Header>
          <Card.Body>
          </Card.Body>
      </Card>

      <Card style={{ marginBottom: '10px' }}>
          <Card.Header>Outputs{' '}
            <Button variant="outline-secondary" size="sm" disabled={outputs.length <= 1} onClick={removeOutput}>-</Button>
              {' ' + outputs.length + ' '}
            <Button variant="outline-secondary" size="sm" onClick={addOutput}>+</Button>
          </Card.Header>
          <Card.Body>
            {outputFields}
          </Card.Body>
      </Card>

      <Button variant="secondary" style={{ display: "block" }} size="sm" onClick={() => {}}>
        { provider.network === "mocknet" ? "Evaluate" : "Send" }
      </Button>
    </div>
  )
}

export default TransactionBuilderPage
