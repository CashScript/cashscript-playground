import React, { useEffect } from 'react'
import { Network } from 'cashscript'
import { ColumnFlex, Wallet } from './shared'
import { Button, Card } from 'react-bootstrap'
import { 
  binToHex,
  hexToBin,
  instantiateSecp256k1,
  generatePrivateKey, 
  instantiateRipemd160, 
  instantiateSha256,
  Base58AddressFormatVersion,
  encodeCashAddress,
  CashAddressType
} from '@bitauth/libauth'

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
    const pubKeyHex = binToHex(pubKey)

    const pubKeyHash = ripemd160.hash(sha256.hash(pubKey))
    const pubKeyHashHex = binToHex(pubKeyHash)

    const address = hash160ToCash(pubKeyHashHex)
    const testnetAddress = hash160ToCash(pubKeyHashHex,0x6f)

    walletsCopy.push({walletName,privKey,privKeyHex,pubKeyHex,pubKeyHashHex,address,testnetAddress})
    setWallets(walletsCopy)
  }

  function hash160ToCash(hex: string, network: number = 0x00) {
    let type: string = Base58AddressFormatVersion[network] || "p2pkh";
    let prefix = "bitcoincash";
    if (type.endsWith("Testnet")) prefix = "bchtest"
    let cashType: CashAddressType = 0;
    return encodeCashAddress(prefix, cashType, hexToBin(hex));
  }

  function removeWallet(index:number) {
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
    const readLocalStorage = () => {
      // Convert the string back to the wallets object
      const localStorageData = localStorage.getItem("wallets");
      // If the local storage is not null
      if (localStorageData !== null) {
        const newWallets = JSON.parse(localStorageData);
        setWallets(newWallets);
      }
    };
    // Read local storage on initialization
    readLocalStorage();
  }, []);

  useEffect(() => {
    const readLocalStorage = () => {
      // Convert the string back to the wallets object
      const localStorageData = localStorage.getItem("wallets");
      // If the local storage is not null
      if (localStorageData !== null) {
        const newWallets = JSON.parse(localStorageData);
        for (const wallet of newWallets){
          wallet.privKey = new Uint8Array(Object.values( wallet.privKey))
        }
        setWallets(newWallets);
      }
    };
    // Read local storage on initialization
    readLocalStorage();
  }, []);

  useEffect(() => {
    const writeToLocalStorage = () => {
      // Clear local storage and write the walletlist array to it as a string
      localStorage.setItem("wallets", JSON.stringify(wallets));
    };
    writeToLocalStorage();
  }, [wallets]);

  const walletList = wallets.map((wallet, index) => (
    <Card style={{ marginBottom: '10px' }} key={wallet.privKeyHex}>
      <Card.Header>
        <input
          type="text"
          id="inputName"
          value={wallet.walletName}
          onChange={(e) => changeName(e, index)}
          className="inputName"
          placeholder="name"
        />
        <Button 
          style={{float:"right", marginTop:"2px"}} 
          onClick={() => removeWallet(index)} 
          variant="outline-secondary" 
          size="sm">
          -
        </Button>
      </Card.Header>
      <Card.Body>
        <Card.Text style={{overflowWrap:'anywhere'}}>
          <strong>Pubkey hex: </strong>
          <p>{wallet.pubKeyHex}</p>
          <strong>Pubkeyhash hex: </strong>
          <p>{wallet.pubKeyHashHex}</p>
          <strong>{network==="mainnet"? "Address:" : "Testnet Address:"}</strong>
          <p>{network==="mainnet"? wallet.address : wallet.testnetAddress}</p>
        </Card.Text>
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
