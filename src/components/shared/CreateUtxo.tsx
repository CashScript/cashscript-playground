import React, { useState } from 'react'
import { MockNetworkProvider, NetworkProvider, Utxo } from 'cashscript'
import { Form, InputGroup, Button, Card } from 'react-bootstrap'

interface Props {
  provider: NetworkProvider
  address: string
  updateUtxos: (() => Promise<void>) | (() => void)
}

const CreateUtxo: React.FC<Props> = ({provider, address, updateUtxos}) => {
  const [customUtxo, setCustomUtxo] = useState<Utxo>({txid: "", satoshis: 0n, vout: 0})
  // const [hasFT, setHasFT] = useState<boolean>(false)
  // const [hasNFT, setHasNFT] = useState<boolean>(false)

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
        </div>
        {/*
        <Form style={{ marginTop: '5px', marginBottom: '5px', display: "inline-block" }}>
        <Form.Check
          type="switch"
          id={"HasFT"}
          label="add tokens to Utxo"
          onChange={(event) => console.log("b")}
          />
        </Form>*/}
      </div>
      <Button size='sm' variant='secondary' onClick={() => addCustomUtxo()} style={{padding:" 0px 2px"}}>add custom utxo</Button>
    </div>
  )
}

export default CreateUtxo