import React, { useState } from "react"
import RedPacketButton from "./redPacketButton"
import YidunVerifyCode from "@/components/YidunVerifyCodeMultip"
import { getUserRecRedsByJson } from "@/action/apis"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter((props) => {
  const replaceText = (target, search, replacement) => target
  const colorStyle = { color: "#c30202" }
  const { row } = props
  const validates = props.validates || {}
  // const rowText = row.Title.replaceAll('(', '<').replaceAll(')', '>');
  const rowText = !!row.Text ? row.Text.replace(/\(/g, "<").replace(/\)/g, ">") : ""
  const isCurrent = props.isCurrent // 是否为进行中的tab
  const [hasPuzzle, setPuzzle] = useState(false)
  let dom = null
  // useEffect(() => {
  //     console.log(row.ID)
  // }, [!validates.hasOwnProperty(row.ID)])
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        setPuzzle(true)
      }

      if (mutation.type === "attributes" && mutation.attributeName === "style") {
        setPuzzle(dom.style.display === "block")
      }
    }
  })

  const onLoadEvent = () => {
    if (props.index !== 0) return
    props.onLoad()
    dom = document.getElementById(`verify-${row.ID}`).getElementsByClassName("yidun_classic-wrapper")[0]
    const config = { childList: true, attributes: true, attributeFilter: ["style"] }
    observer.observe(dom, config)
  }

  const onVerifySuccess = (data) => {
    props.onVerifySuccess({ id: row.ID, code: data.validate })
    setPuzzle(false)
  }

  const getRedPacket = async (id) => {
    const _data = { id }
    if (row.Captcha === 1) _data["NECaptchaValidate"] = validates[id]
    if (row.Pass) _data["pass"] = await notificationAsync.prompt("请输入密码")
    try {
      const _response = await getUserRecRedsByJson(_data)
      const title = _response.Code === 1 ? "成功" : "操作提示"
      const callback =
        _response.Code === 1 || _response.Message.indexOf("银行卡") < 0
          ? null
          : () => {
              props.router.push("/site/setBankCard")
            }
      notificationAsync.alert(_response.Message, { title, buttonLabels: ["确定"], callback })
    } catch (error) {
      console.log(error)
      props.onRemoveValidate()
    }
  }

  return (
    <div className={`red-packet-record-item ${hasPuzzle ? "puzzle" : ""}`} key={row.ID}>
      <div>
        <div className="item title">
          <span className="bd" dangerouslySetInnerHTML={{ __html: row.Title }} />
          {row.RedsRecord && (
            <span className="clickBtn" onClick={() => this.openRedDetail(row.ID, row.Title)}>
              领取详情
            </span>
          )}
        </div>
        <div className="item money">
          红包余额：
          <span>
            <b style={colorStyle}>{row.PotMoney}</b>元
          </span>
        </div>
        <div className="item money">最高金额：{row.Mend ? <b style={colorStyle}>{row.Mend}元</b> : <b style={colorStyle}>随机红包</b>}</div>
        <div className="item time">发放周期：{row.UpCycle ? `${row.UpCycle}小时` : "每人仅限1次"}</div>
        <div className="item time">限量周期：{row.Collar}个</div>
        {row.Text && (
          <div className="item text">
            红包说明： <span className="bd" dangerouslySetInnerHTML={{ __html: rowText }} />
          </div>
        )}
      </div>
      {isCurrent && row.Captcha === 1 && !validates.hasOwnProperty(row.ID) ? (
        !!props.captchaId ? (
          <YidunVerifyCode id={"verify-" + row.ID} CaptchaId={props.captchaId} onLoad={onLoadEvent} onSuccess={onVerifySuccess} /> //  onSuccess={ data => { this.onVerifySuccess(data, row); }} onLoad={ () => { if (index===0) this.onLoadEvent(); }}
        ) : (
          <div></div>
        )
      ) : (
        <RedPacketButton row={row} onGetRedPacket={getRedPacket} />
      )}
    </div>
  )
})
