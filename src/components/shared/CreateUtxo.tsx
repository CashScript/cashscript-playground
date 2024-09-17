import React, { useState } from 'react'
import { MockNetworkProvider, NetworkProvider, randomToken, randomUtxo, Utxo } from 'cashscript'
import { Form, InputGroup, Button } from 'react-bootstrap'

interface Props {
  provider: NetworkProvider
  address: string
  updateUtxos: (() => Promise<void>) | (() => void)
}

const CreateUtxo: React.FC<Props> = ({provider, address, updateUtxos}) => {
  const [customUtxo, setCustomUtxo] = useState<Utxo>({...randomUtxo()})

  const addCustomUtxo = () => {
    try{
      if(!(provider instanceof MockNetworkProvider)) return
      if(customUtxo.satoshis < 546n) throw new Error('Utxo must have atleast 546n sats')
      provider.addUtxo(address, customUtxo)
      updateUtxos()
    } catch(e){
      alert(e)
    }
  }

  return (
    <div style={{marginLeft: "20px", marginBottom: "10px"}}>
      Fill in (partial) utxo data:
      <div>
        <div>
          <InputGroup>
            <Form.Control size="sm"
              placeholder="TxId"
              aria-label="TxId"
              onChange={(event) => {
                const utxoCopy = { ...customUtxo }
                utxoCopy.txid = event.target.value as string
                setCustomUtxo(utxoCopy)
              }}
            />
            <Form.Control size="sm"
              placeholder="OutputIndex"
              aria-label="OutputIndex"
              onChange={(event) => {
                const utxoCopy = { ...customUtxo }
                utxoCopy.vout = parseInt(event.target.value)
                setCustomUtxo(utxoCopy)
              }}
            />
          </InputGroup>
        </div>
        <div>
          <InputGroup>
            <Form.Control size="sm"
              placeholder="Satoshi amount"
              aria-label="Satoshi amount"
              onChange={(event) => {
                const utxoCopy = { ...customUtxo }
                utxoCopy.satoshis = BigInt(event.target.value)
                setCustomUtxo(utxoCopy)
              }}
            />
          </InputGroup>
          <InputGroup>
            <Form.Control size="sm"
              placeholder="Token Category"
              aria-label="Token Category"
              onChange={(event) => {
                const utxoCopy = { ...customUtxo }
                if(!utxoCopy.token) utxoCopy.token = {category: "", amount:0n}
                const newCategory = event.target.value ? event.target.value : randomToken().category
                utxoCopy.token.category = newCategory
                setCustomUtxo(utxoCopy)
              }}
            />
            <Form.Control size="sm"
              placeholder="Amount Fungible Tokens"
              aria-label="Amount Fungible Tokens"
              onChange={(event) => {
                const utxoCopy = { ...customUtxo }
                if(!utxoCopy.token) utxoCopy.token = {category: randomToken().category, amount:0n}
                utxoCopy.token.amount = BigInt(event.target.value)
                setCustomUtxo(utxoCopy)
              }}
            />
          </InputGroup>
          <InputGroup>
            <Form.Control size="sm"
              placeholder="Token Commitment"
              aria-label="Token Commitment"
              onChange={(event) => {
                const utxoCopy = { ...customUtxo }
                if(!utxoCopy.token) utxoCopy.token = {...randomToken()}
                if(!utxoCopy.token.nft) utxoCopy.token.nft = {commitment: "", capability:"none"}
                utxoCopy.token.nft.commitment = event.target.value
                setCustomUtxo(utxoCopy)
              }}
            />
            <Form.Control size="sm" id="capability-selector"
              as="select"
              onChange={(event) => {
                const utxoCopy = { ...customUtxo }
                if(!utxoCopy.token) utxoCopy.token = {...randomToken()}
                if(!utxoCopy.token.nft) utxoCopy.token.nft = {commitment: "", capability:"none"}
                utxoCopy.token.nft.capability = event.target.value as "none" | "mutable" | "minting"
                setCustomUtxo(utxoCopy)
              }}
            >
              <option>Select Capability</option>
              <option value={"none"}>none</option>
              <option value={"minting"}>minting</option>
              <option value={"mutable"}>mutable</option>
            </Form.Control>
          </InputGroup>
        </div>
      </div>
      <Button size='sm' variant='secondary' onClick={() => addCustomUtxo()} style={{padding:" 0px 2px"}}>add custom utxo</Button>
    </div>
  )
}

export default CreateUtxo