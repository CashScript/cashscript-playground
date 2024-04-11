import React, { useState, useEffect } from 'react'
import { Artifact, Contract, Argument, Network, ElectrumNetworkProvider, Utxo } from 'cashscript'
import { InputGroup, Form, Button } from 'react-bootstrap'
import useCopy from 'use-copy'

interface Props {
    children: string
}

const CopyText: React.FC<Props> = ({ children }) => {
    const [copied, copy, setCopied] = useCopy(children);

    const copyWithTimeout = () => {
        copy();
        setTimeout(() => {
            setCopied(false);
        }, 1000);
    };

    return (
        <div>
            <p onClick={copyWithTimeout} style={{ cursor: 'pointer' }}>{children}</p>
            { copied && <div className="alert alert-success" style={{ width: 'fit-content' }}>Copied!</div> }
        </div>
    );
}

export default CopyText
