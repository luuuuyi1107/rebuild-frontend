import React, { useState, useEffect, useRef } from "react"
import "./style.scss"
import util from "@/magic/util"
// import * as qrcode from "@/magic/qrcodegenerator"
// import { useQrCode } from '@/magic/qrcode'
import OrderDetail from "./order"
import SellerOrderDetail from "./sellerOrder"
import { Modal } from "react-onsenui"
import { applyService } from "@/action/apis"
import _ from "lodash"
import { MOBILE_PAYMENT, ORDER_PAYMENT } from "@/config/payment"
import { generateQRCode } from "@/magic/qrcode"
import { notificationAsync } from "@/magic/notification"

export default (props) => {
  const [cards, setCards] = useState([])
  const [argueModal, setArgueModal] = useState(false)
  const argueData = useRef({ question: "", content: "" })
  const selectRef = useRef(null)
  const textareaRef = useRef(null)
  const questionData = {
    order: ["付款了不给我上分!", "付款金额错误了!", "收款方式异常,付款失败！", "付款了上传不了截图！"],
    sell: ["我没有收到款!", "图片是错误的!", "收款金额错误!", "收款人姓名不对!", "收到款了，无法确认订单！"],
  }

  function copyEvent(value) {
    util.copyToClipBoard(value)
    notificationAsync.toast("已复制", { timeout: 1200, class: "custom-toast" })
  }

  function generateCards() {
    const res = _(props.orderData.Payment)
      .filter((x) => x.Enable)
      .map((x) => {
        const currentPaymentConfig = ORDER_PAYMENT.findPaymenByType(x.Type) || MOBILE_PAYMENT.toJSON()
        const showQrcode =
          currentPaymentConfig?.QRCODE && (currentPaymentConfig.C_TYPE !== 1 || x.Account.replace(currentPaymentConfig.PREFIX[0], "").length !== 11)

        return {
          ...x,
          userName: x.Name || null,
          bank: x.Bank,
          name: currentPaymentConfig?.NAME2 || "银行卡",
          account: x.Account || null,
          qrcode: showQrcode // currentPaymentConfig.QRCODE
            ? generateQRCode(x.Account, {
                cellSize: isSeller ? 4 : 6,
                margin: isSeller ? 2 : 4,
              })
            : null,
          type: x.Type,
          Config: currentPaymentConfig,
        }
      })
      .value()
    return res
  }

  function noticeForUnreleaseCard() {
    notificationAsync.toast("未开放的收款方式", { timeout: 1000, class: "orderpost-toast", animation: "fade" })
  }

  useEffect(() => {
    if (!props.orderData) return
    setCards(generateCards())
  }, [props.orderData])

  useEffect(() => {
    if (!argueModal) {
      if (selectRef.current) selectRef.current.value = 0
      if (textareaRef.current) textareaRef.current.value = ""
    }
  }, [argueModal])

  function changeQuestion(evt) {
    argueData.current.question = evt.target.value
  }

  function changeContent(evt) {
    argueData.current.content = evt.target.value
  }

  function sendingArgueData() {
    if (!argueData.current.question) {
      notificationAsync.toast("需要选择问题", { timeout: 1000, class: "orderpost-toast", animation: "fade" })
      return
    }

    applyService(props.orderData.ID, "【" + argueData.current.question + ", " + argueData.current.content + "】").then((res) => {
      notificationAsync.toast(res.Message, { timeout: 2000, class: "orderpost-toast", animation: "fade" })
      setArgueModal(false)
      if (res.Code == 1) props.refresh()
    })
  }
  const isSeller = !!util.getUrlParam("pid")

  return (
    <div className="pendpay-inner">
      {props.orderData && cards.length && (
        <>
          {isSeller ? (
            <SellerOrderDetail
              showArgue={() => setArgueModal(true)}
              orderData={props.orderData}
              demoImages={props.demoImages}
              refresh={props.refresh}
              confirm={props.confirm}
              cards={cards}
              notice={noticeForUnreleaseCard}
            />
          ) : (
            <OrderDetail
              showArgue={() => setArgueModal(true)}
              orderData={props.orderData}
              demoImages={props.demoImages}
              buttonEvent={props.buttonEvent}
              copyEvent={copyEvent}
              cards={cards}
              notice={noticeForUnreleaseCard}
            />
          )}
        </>
      )}

      <Modal isOpen={argueModal} className="argue-modal">
        <div className="argue-frame">
          <div className="ag-title">反馈与投诉</div>
          <div className="ag-content">
            <select ref={selectRef} onChange={changeQuestion}>
              <option value="0">请选择问题</option>
              {questionData[isSeller ? "sell" : "order"].map((text, idx) => (
                <option key={text} value={text}>
                  {text}
                </option>
              ))}
            </select>
            <div className="ag-subtitle">问题描述(限50字)</div>
            <textarea ref={textareaRef} placeholder="可不填" onChange={changeContent} maxLength={50} />
            <div className="ag-btns">
              <div
                className="btn"
                onClick={() => {
                  setArgueModal(false)
                }}
              >
                取消
              </div>
              <div style={{ width: "10px" }} />
              <div className="btn confirm" onClick={sendingArgueData}>
                确认
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
