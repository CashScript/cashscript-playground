import React, { useEffect } from 'react'
import { Network, ElectrumNetworkProvider } from 'cashscript'
import { ColumnFlex, Wallet } from './shared'
import { Button, Card } from 'react-bootstrap'
import {
  binToHex,
  hexToBin,
  instantiateSecp256k1,
  generatePrivateKey,
  instantiateRipemd160,
  instantiateSha256,
  encodeCashAddress,
  encodePrivateKeyWif,
} from '@bitauth/libauth'
import CopyText from './shared/CopyText'
import InfoUtxos from './InfoUtxos'

interface Props {
  network: Network
  setShowWallets:(showWallets: boolean) => void
  wallets: Wallet[]
  setWallets:(wallets: Wallet[]) => void
  style: any
}

const WalletInfo: React.FC<Props> = ({network, setShowWallets,  wallets, setWallets, style}) => {
  useEffect(() => {
    const localStorageData = localStorage.getItem("wallets");
    // If the local storage is null
    if (localStorageData == null) {
        addWallet()
      }
  }, [])

  async function addWallet() {
    const walletsCopy = [...wallets]

    const secp256k1 = await instantiateSecp256k1();
    const ripemd160 = await instantiateRipemd160();
    const sha256 = await instantiateSha256();

    const walletName = `Wallet${wallets.length+1}`

    const privKey = generatePrivateKey(() =>
      window.crypto.getRandomValues(new Uint8Array(32))
    )
    const privKeyHex = binToHex(privKey)

    const pubKey = secp256k1.derivePublicKeyCompressed(privKey)
    if(typeof pubKey == "string") throw("error derivePublicKeyCompressed")
    const pubKeyHex = binToHex(pubKey)

    const pubKeyHash = ripemd160.hash(sha256.hash(pubKey))
    const pubKeyHashHex = binToHex(pubKeyHash)

    const address = hash160ToCash(pubKeyHashHex)
    const testnetAddress = hash160ToCash(pubKeyHashHex, true)

    walletsCopy.push({walletName,privKey,privKeyHex,pubKeyHex,pubKeyHashHex,address,testnetAddress, utxos:[]})
    setWallets(walletsCopy)
  }

  function hash160ToCash(hex: string, forTestnet?: boolean, tokenSupport?: boolean) {
    const prefix = forTestnet ? "bchtest" : "bitcoincash";
    const type = tokenSupport ? "p2pkhWithTokens" : "p2pkh";
    return encodeCashAddress(prefix, type, hexToBin(hex));
  }

  function removeWallet(index:number) {
    const confirmDelete = confirm("Sure you want to permanently remove this wallet?")
    if(!confirmDelete) return
    const walletsCopy = [...wallets]
    walletsCopy.splice(index, 1)
    setWallets(walletsCopy)
  }

  function changeName(e:any, i:number) {
    const walletsCopy = [...wallets]
    walletsCopy[i].walletName = e.target.value;
    setWallets(walletsCopy)
  };
 

  useEffect(() => {
    const readLocalStorage = async () => {
      // Convert the string back to the wallets object
      const localStorageData = localStorage.getItem("wallets");
      // If the local storage is not null
      if (localStorageData !== null) {
        const newWallets = JSON.parse(localStorageData);
        for (const wallet of newWallets){
          wallet.privKey = new Uint8Array(Object.values( wallet.privKey))
        }
        setWallets(newWallets);
        // fetch UTXOs
        const networkProvider = new ElectrumNetworkProvider(network)
        for (const wallet of newWallets){
          const walletUtxos = await networkProvider.getUtxos(wallet.address);
          wallet.utxos = walletUtxos
        }
        setWallets(newWallets);
      }
    };
    // Read local storage on initialization
    readLocalStorage();
  }, []);

  useEffect(() => {
    const writeToLocalStorage = () => {
      if(!wallets.length) return
      const localStorageData = localStorage.getItem("wallets") ?? "{}";
      const objLocalStorageData = JSON.parse(localStorageData);
      // Deep copy except for the utxos
      const walletsCopy = wallets.map(wallet => ({...wallet, utxos: []}));
      // Clear local storage and write the walletlist array to it as a string
      if(JSON.stringify(walletsCopy) === JSON.stringify(objLocalStorageData)) return
      localStorage.setItem("wallets", JSON.stringify(walletsCopy));
    };
    writeToLocalStorage();
  }, [wallets]);

  async function updateUtxosWallet (wallet: Wallet, index: number) {
    const walletUtxos = await new ElectrumNetworkProvider(network).getUtxos(wallet.address);
    const walletsCopy = [...wallets]
    walletsCopy[index].utxos = walletUtxos
    setWallets(walletsCopy)
  }

  const walletList = wallets.map((wallet, index) => (
    <Card style={{ marginBottom: '10px' }} key={wallet.privKeyHex}>
      <Card.Header style={{ display:"flex", justifyContent:"space-between"}}>
        <input
          type="text"
          id="inputName"
          value={wallet.walletName}
          onChange={(e) => changeName(e, index)}
          className="inputName"
          placeholder="name"
        />
        <Button
          style={{padding: "0px 6px"}}
          onClick={() => removeWallet(index)}
          variant="danger"
          size="sm">
          x
        </Button>
      </Card.Header>
      <Card.Body>
        <Card.Text style={{overflowWrap:'anywhere'}}>
          <strong>Pubkey hex: </strong>
          <CopyText>{wallet.pubKeyHex}</CopyText>
          <strong>Pubkeyhash hex: </strong>
          <CopyText>{wallet.pubKeyHashHex}</CopyText>
          <strong>{network==="mainnet"? "Address:" : "Testnet Address:"}</strong>
          <CopyText>{network==="mainnet"? wallet.address : wallet.testnetAddress}</CopyText>
          <strong>{network==="mainnet"? "Token address:" : "Testnet Token Address:"}</strong>
          <CopyText>{network==="mainnet"? hash160ToCash(wallet.pubKeyHashHex, false, true) : hash160ToCash(wallet.pubKeyHashHex, true, true)}</CopyText>
          <strong>Wallet utxos</strong>
          <div>
            <span>{wallet.utxos?.length} {wallet.utxos?.length == 1 ? "utxo" : "utxos"}</span>
            <span onClick={() => updateUtxosWallet(wallet,index)} style={{cursor:"pointer", marginLeft:"10px"}}>
              (refresh wallet utxos ⭯)
              </span>
          </div>
        </Card.Text>
        <details>
          <summary>Show Private Key</summary>
          <strong>WIF: </strong>
          <CopyText>{encodePrivateKeyWif(wallet.privKey, network === "mainnet" ? "mainnet" : "testnet")}</CopyText>
          <strong>Hex: </strong>
          <CopyText>{wallet.privKeyHex}</CopyText>
        </details>
        <details>
          <summary>Show utxos</summary>
          <div>
            <InfoUtxos utxos={wallet.utxos}/>
          </div>
        </details>
      </Card.Body>
    </Card>
  ))

  return (
    <ColumnFlex
      id="preview"
      style={{ ...style, flex: 1, margin: '16px' }}
    >
      <div style={{
        height: '100%',
        border: '2px solid black',
        borderBottom: '1px solid black',
        fontSize: '100%',
        lineHeight: 'inherit',
        overflow: 'auto',
        background: '#fffffe',
        padding: '8px 16px',
        color: '#000'
      }}>
        <h2>Wallets <Button onClick={addWallet} variant="outline-secondary" size="sm">+</Button>
          <button onClick={() => setShowWallets(false)} style={{float:'right', border:'none', backgroundColor: 'transparent',outline: 'none'}}>⇆</button>
        </h2>
        {walletList}
      </div>
    </ColumnFlex>

  )
}

export default WalletInfo
