import React from "react"
import classNames from "classnames"

export default ({ value, baseSize = "text-1.5", floatSize = "text-1.25", textColor = "text-theme" }) => {
  const moneyData = value.toString().split(".")
  return (
    <span className={classNames("font-bold", baseSize, textColor)}>
      {moneyData.map((currentMoney, i) => {
        if (i == 0) {
          return <span key={"money" + i}>{currentMoney}</span>
        } else {
          return (
            <span className={floatSize} key={"money" + i}>
              .{currentMoney}
            </span>
          )
        }
      })}
    </span>
  )
}
