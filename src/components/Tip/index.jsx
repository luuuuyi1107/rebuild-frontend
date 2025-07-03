import React, { useState, useEffect } from "react"
import "./style.scss"
import util from "@/magic/util"

export default (props) => {
  useEffect(() => {
    document.body.classList.add("frieeze")
    // document.getElementById('opTip').addEventListener('touchmove',bodyScroll,{passive: false});
    setTimeout(() => {
      // document.getElementById('opTip').scrollTo(0, 0);
      checkOpTipScrollMode()
    }, 100)
    return () => {
      document.body.classList.remove("frieeze")
      // document.body.removeEventListener('touchmove',bodyScroll,{passive: false});
    }
  }, [])

  function checkOpTipScrollMode() {
    const opTip = document.getElementById("opTip")
    if (opTip.scrollHeight > opTip.clientHeight || opTip.scrollWidth > opTip.clientWidth) {
      opTip.classList.add("scroll")
    } else {
      opTip.classList.remove("scroll")
    }
  }

  const title = props.mode === "sell" ? "" : "挂单充值下单成功！"
  const subtitle = props.mode === "sell" ? "" : ""
  const thridtitle = props.mode === "sell" ? "" : "温馨提醒"

  const items =
    props.mode === "sell"
      ? [
          "收款后进入“<font>我的出售</font>”",
          "点击“查看详情”找到<font>已付款</font>订单",
          "确认收款金额无误，点击<font>确认到帐</font>",
          "收到汇款请及时确认到账,如超时未确认系统将自行判定,损失自行承担!",
        ]
      : [
          "下单后请在10分钟内完成付款<br />并<font>主动上传付款凭证</font>",
          "无法付款请主动取消订单,<br />避免影响后续充值权益",
          "请按照下单金额进行付款,<br />修改金额造成的损失由您承担",
          "超过10分钟订单将自动撤销<br />造成损害自行承担！",
        ]

  const [tick, setTick] = useState(false)

  function handleTick(e) {
    const { checked } = e.target
    setTick(checked)
  }

  return (
    <div id="opTip" className={`op-tip ${props.mode}`}>
      <div className="inner">
        {/* {props.mode === "order" && <div style={{ height: "0.8rem" }} />} */}

        {!!title && <div className="title">{title}</div>}

        {!!subtitle && <div className="subtitle">{subtitle}</div>}

        {props.mode === "order" && <div style={{ height: "1rem" }} />}

        <div className="content">
          {!!thridtitle && <div className="thridtitle">{thridtitle}</div>}
          {!!thridtitle && <div style={{ height: "8px" }} />}

          {props.mode === "sell" ? (
            <img onLoad={checkOpTipScrollMode} className="inteInfo" src={util.buildAssetsPath("assets/withdraw_tip.png")} />
          ) : (
            items.map((item, index) => (
              <div className="titem" key={index}>
                <div className="tlist">
                  <span className={`num${index === 3 || props.mode === "order" ? " active" : ""}`}>{index + 1}</span>
                  <span style={{ flex: 1, textAlign: "left" }} dangerouslySetInnerHTML={{ __html: item }}></span>
                </div>
                {props.mode === "sell" && index < 3 && (
                  <div className={`imgdec-${index}`}>
                    <img src={util.buildAssetsPath(`assets/orderposttips/1_${index + 1}.png`)} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* {props.mode === 'order' && } */}
        {/* <div style={{ height: "0.25rem" }} /> */}

        <label className="check-box">
          <input type="checkbox" onChange={handleTick} />
          我已了解,今日不再提示
        </label>

        <button
          className="confirm-button"
          onClick={() => {
            props.closeTip(props.mode, tick)
          }}
          type="button"
        >
          确认
        </button>
        {/* <div style={{ height: "45px" }} /> */}
      </div>
    </div>
  )
}
