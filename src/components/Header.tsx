import React from 'react'

interface Props {}

const Header: React.FC<Props> = () => {
  return (
    <header style={{
      display: 'inline-flex',
      color: 'black',
      padding: '24px 28px',
      width: "fit-content",
      fontSize: '30px'
    }}>
      <div className="header-title">CashScript Playground</div>
    </header>
  )
}

export default Header
