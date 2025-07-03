import React, { useState, useMemo } from 'react'
import './index.scss'
export default (props) => {
  const [active, setActive] = useState(props.value);
  const titles = props.titles || ['', ''];
  const showText = useMemo(() =>  titles[active ? 0 : 1], [active]);

  function clickEvent() {
    setActive(!active);
    setTimeout(() => {
      props.onChange({ value: !active });
    }, 0);
  }
  return <div className={`r-frame ${active ? 'active':''}`} onClick={() => { clickEvent() }}>
      <span>{ showText }</span>
      <div className="size-box">{ showText }</div>
      <div className="ball" />
  </div>
}
