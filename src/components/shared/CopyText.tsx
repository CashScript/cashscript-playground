import React from 'react'
import { Card, Badge } from 'react-bootstrap'
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
    <>
      <Card.Text
        onClick={copyWithTimeout}
        style={{ cursor: 'pointer' }}
      >
        {children}
        { copied && <Badge style={{ marginLeft: '0.5rem' }} pill variant="success">Copied!</Badge> }        
      </Card.Text>
    </>
  );
}

export default CopyText
