import React, {useState} from 'react'
import { Recipient } from 'cashscript'
import { Form, InputGroup } from 'react-bootstrap'

interface Props {
  outputs: Recipient[]
  setOutputs: (outputs: Recipient[]) => void
}

const TransactionOutputs: React.FC<Props> = ({ outputs, setOutputs }) => {
  const [outputHasFT, setOutputHasFT] = useState<boolean[]>([])
  const [outputHasNFT, setOutputHasNFT] = useState<boolean[]>([])
  
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
  
  return (
    <>{outputFields}</>
  )
}

export default TransactionOutputs
