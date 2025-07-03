import React, { useState, useCallback } from "react"
import "./style.scss"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
dayjs.extend(duration)
// import { BackButton } from "react-onsenui";
import LayoutPage from "@/components/LayoutPage"
import Decimal from "decimal.js"
import { findPaymentIconByType, MOBILE_PAYMENT, ORDER_PAYMENT } from "@/config/payment"
import { notificationAsync } from "@/magic/notification"

export default (props) => {
  const DECIMAL_LENGTH = 2
  const MONEY_LIMIT = 100
  const getFixed = (money) => +new Decimal(money).toFixed(DECIMAL_LENGTH)
  const maxMoney = getFixed(props.orderData.Money)
  const isMaxMoneyBelowLimit = props.orderData.Money < MONEY_LIMIT
  const canSplit = props.orderData.OrderSplit === 1
  const splitText = `${!canSplit ? "不" : ""}可拆分`
  const [money, setMoney] = useState(canSplit && !isMaxMoneyBelowLimit ? "" : maxMoney)
  const [isSending, setIsSending] = useState(false)

  async function confirmEvent() {
    await props.confirmEvent({
      money, // : Math.min(money, props.orderData.Money)
      id: props.orderData.ID,
    })
    setIsSending(false)
  }

  function formatTimeFromSeconds(seconds) {
    const duration = dayjs.duration(seconds, "seconds")
    const formattedTime = duration.format("HH:mm:ss")
    return formattedTime
  }

  const checkIsLessThenHundred = useCallback(() => {
    if (isMaxMoneyBelowLimit && canSplit) {
      notificationAsync.alert(`挂单金额低于${MONEY_LIMIT}不允许拆分购买`)
    }
  }, [isMaxMoneyBelowLimit, canSplit])

  return (
    <LayoutPage
      center="下单"
      onBack={() => {
        props.backEvent()
      }}
      className="orderconfirm-inner"
    >
      <div className="orderconfirm-content">
        <div>
          商品金额
          <span style={{ color: "#F77E04 " }}>
            {props.orderData.Money2 && props.orderData.Money > props.orderData.Money2 ? getFixed(props.orderData.Money2) : maxMoney}
          </span>
        </div>
        <div>
          是否拆开<span style={{ color: "rgb(89, 192, 76)" }}>{splitText}</span>
        </div>

        <div className="receive-method">
          收款方式
          {!!props.orderData.Type &&
            props.orderData.Type.map((type, idx) => (
              <span style={{ marginLeft: "5px", maxHeight: 21, maxWidth: 20 }} key={type + "_" + idx}>
                <img style={{ maxHeight: 21, maxWidth: 20 }} src={util.buildAssetsPath(findPaymentIconByType(type))} />
              </span>
            ))}
        </div>
        {!!props.orderData.Merchant &&
          props.orderData.Merchant.hasOwnProperty("SellCount") &&
          props.orderData.Merchant.hasOwnProperty("ConfirmAvg") && (
            <div className="merchant">
              <img src={util.buildAssetsPath("/assets/icons/ic-merchant.svg")} />
              成交量:&nbsp;&nbsp;{props.orderData.Merchant.SellCount} <div className="lgap" /> 交易速度:&nbsp;&nbsp;
              {formatTimeFromSeconds(props.orderData.Merchant.ConfirmAvg + 0)}
            </div>
          )}

        <div className="gap-line" />

        <div style={{ fontSize: "18px", textAlign: "center", marginBottom: "20px", marginTop: "18px" }}>购买金额（元）</div>
        <div className="money-input" onClick={checkIsLessThenHundred}>
          <input
            type="number"
            disabled={!canSplit || isMaxMoneyBelowLimit}
            max={maxMoney}
            onChange={(e) => setMoney(e.target.value ? getFixed(e.target.value) : "")}
            value={money}
          />
          <button disabled={money >= props.orderData.Money || isMaxMoneyBelowLimit} onClick={() => setMoney(maxMoney)}>
            全部
          </button>
        </div>

        <div className="money-status">
          <div>应收余额</div>
          <div style={{ color: "#AEAEAE" }}>
            {props.orderData.Money2 && props.orderData.Money > props.orderData.Money2 ? getFixed(props.orderData.Money2) : maxMoney} CNY
          </div>
        </div>

        <button
          disabled={isSending}
          onClick={() => {
            setIsSending(true)
            confirmEvent()
          }}
          className="confirm-button"
        >
          下单
        </button>
      </div>
    </LayoutPage>
  )
}
