import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer>
      <div
        className="footer-description"
        style={{
          padding: '16px 0px',
          overflow: 'hidden',
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
          bottom: '0px',
          color: '#fff',
          background: 'black'
      }}>
        <a href="https://cashscript.org" target="_blank" rel="noopener noreferrer">cashscript.org</a>
      </div>
    </footer>
  )
}

export default Footer
