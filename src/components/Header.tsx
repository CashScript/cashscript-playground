import React from 'react'

interface Props {}

const Header: React.FC<Props> = () => {
  return (
    <header style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      color: 'black',
      padding: '24px 44px',
      fontSize: '30px'
    }}>
      <div className="header-title">CashScript Playground</div>
    </header>
  )
}

export default Header
