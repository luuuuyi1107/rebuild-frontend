import React from 'react'
import './style.scss'

export default props => <div className="shop-items">
  { 
    props.items.map(item => (<div className="item" key={item.ID} onClick={() => { props.clickEvent(item.ID) }}>
      <img className="itemImg" src={item.Logo} />
      <div className="title">{ item.Title }</div>
    </div>))
  }
  </div>