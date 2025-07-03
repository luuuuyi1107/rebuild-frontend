import React, { useState, useRef, useEffect } from "react"

export default (props) => {
  const [coins, setIcons] = useState([])
  const parentRef = useRef(null)
  const betOfObject = [
    [
      { text: "闲", odds: "1:2", value: 1 },
      { text: "闲", odds: "1:2", value: 3 },
    ],
    [{ text: "庄", odds: "1:1", value: 0 }],
    [
      { text: "闲", odds: "1:2", value: 2 },
      { text: "闲", odds: "1:2", value: 4 },
    ],
  ]

  useEffect(() => {
    if (!props.betResult.some((bets) => Object.keys(bets).length > 0)) {
      setIcons([])
    }
  }, [props.betResult])

  const betAreaClickEvent = (event, value) => {
    if (value === 0) return
    if (props.currentCoin === -1 || (props.currentCoin === 0 && !props.CoinAmount)) {
      props.onBetAreaClick(value) // 還是得送到上層 不然不會提示
      return
    }
    const _coins = coins.slice()
    const parentRect = parentRef.current?.getBoundingClientRect()
    const middle = parentRect.height * 0.5
    const newCoin = {
      value: props.currentCoin,
      amount: props.currentCoin === 0 ? props.CoinAmount : props.bets[props.currentCoin - 1] + "",
      transform: `translate(-50%, -50%) rotate(${Math.floor(Math.random() * 360)}deg)`,
      x: event.clientX - parentRect.left,
      y: event.clientY - parentRect.top,
    }

    if ((value === 1 || value === 2) && newCoin.y > middle - 25) {
      newCoin.y -= 25
    } else if ((value === 3 || value === 4) && newCoin.y < middle + 25) {
      newCoin.y += 25
    }

    setIcons(_coins.concat(newCoin))

    props.onBetAreaClick(value)
  }

  return props.betResult.length === 0 ? (
    <div />
  ) : (
    <div className="bet_table" ref={parentRef}>
      {coins.map((icon, iconIdx) => (
        <div
          key={"icon" + iconIdx}
          className={`coin type${icon.value}${icon.amount.length === 5 ? " max" : icon.amount.length >= 6 ? " max2" : ""}`}
          style={{ left: icon.x, top: icon.y, transform: icon.transform }}
        >
          {icon.amount.split("").map((num, idx) => (
            <div key={idx + "-" + num} className={`num${num}`}></div>
          ))}
        </div>
      ))}
      {betOfObject.map((betItems, areaIdx) => (
        <div key={"area" + areaIdx}>
          {betItems.map((item, itemIdx) => {
            const _num = item.value > 0 ? item.value : ""
            const _active = props.betResult && props.betResult[item.value] && Object.keys(props.betResult[item.value]).length > 0
            // const _amount = Object.entries(props.betResult[item.value]).reduce((acc, [bet, num]) => acc + parseInt(bet) * num, 0);
            return (
              <div
                key={"item" + itemIdx}
                className={`${item.text === "闲" ? "xian" : "zhuang"}${_num} ${_active ? "sel" : ""}`}
                onClick={(event) => {
                  betAreaClickEvent(event, item.value)
                }}
              >
                <div className="ttl">{item.text + _num}</div>
                <div className="odds">{item.odds}</div>
                {/* { _active && <div className="sel_amt">{ _amount }</div> } */}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
