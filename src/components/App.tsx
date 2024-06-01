// Components
import React, { useState, useEffect } from 'react';
import { Artifact, Network } from 'cashscript';
import Header from './Header'
import Main from './Main'
import Footer from './Footer';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import WalletInfo from './Wallets';
import { Wallet } from './shared';
import ContractInfo from './ContractInfo';

function App() {
  const [network, setNetwork] = useState<Network>('chipnet')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [key, setKey] = useState('editor');
  const [artifact, setArtifact] = useState<Artifact | undefined>(undefined);

  return (
    <>
      <div className="App" style={{ backgroundColor: '#eee', color: '#000', padding: '0px 32px' }}>
        <Header />
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-2 mt-4 justify-content-center"
          style={{ display: "inline-flex", marginLeft: "calc(100vw - 1000px)" }}
        >
          <Tab eventKey="editor" title="Editor">
            <Main artifact={artifact} setArtifact={setArtifact}/>
          </Tab>
          <Tab eventKey="contracts" title="Contracts">
            <ContractInfo artifact={artifact} network={network} setNetwork={setNetwork} wallets={wallets}/>
          </Tab>
          <Tab eventKey="wallets" title="Wallets">
            <WalletInfo network={network} wallets={wallets} setWallets={setWallets}/>
          </Tab>
          <Tab eventKey="transactionBuilder" title="TransactionBuilder">
            <div>hello2</div>
          </Tab>
        </Tabs>
      </div>
      <Footer />
    </>
  );
}

export default App;
