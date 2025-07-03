import React, { useEffect, useState, useRef } from "react"
import { Modal } from "react-onsenui"
import dayjs from "dayjs"
import "./style.scss"
import { orderBy } from "lodash"
import { getServiceMessages, setServiceMessageAsRead } from "@/action/apis"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"

export default withRouter((props) => {
  const tick = useRef(false)
  const [messages, setMessages] = useState([])
  const itemsInner = useRef(null)
  const newMessageEvent = useRef(async () => {
    if (messages.length > 0) return
    const res = await getServiceMessages()
    if (res.Code !== 1) return

    const _items = orderBy(
      res.Data.filter((item) => !item.IsRead).map((item) => ({
        SID: item.SID,
        ID: item.ID,
        Content: item.Content,
        Time: (item.Time.length <= 10 ? dayjs(new Date()).format("YYYY-MM-DD ") : "") + item.Time,
        Nick: item.Nick || "Jas客服",
      })),
      [(item) => item.Time],
      ["desc"]
    )
    setMessages(_items)
  })

  useEffect(() => {
    tick.current = false
    window.addEventListener("fetchServiceMessage", newMessageEvent.current)

    return () => {
      window.removeEventListener("fetchServiceMessage", newMessageEvent.current)
    }
  }, [])

  function setHeight() {
    // window.innerHeight
    // console.log(itemsInner.current.scrollHeight)
    const maxHeight = window.innerHeight - itemsInner.current.children[0].clientHeight - itemsInner.current.children[2].clientHeight - 100
    itemsInner.current.children[1].style.maxHeight = maxHeight + "px"
    console.log({ maxHeight })
  }

  function handleTick() {
    tick.current = !tick.current
  }

  useEffect(() => {
    if (messages.length > 0) {
      document.body.classList.add("frieeze")
      setTimeout(() => {
        setHeight()
      }, 0)
    } else {
      document.body.classList.remove("frieeze")
    }
    return () => {
      document.body.classList.remove("frieeze")
    }
  }, [messages])

  function closeEvent() {
    window.removeEventListener("fetchServiceMessage", newMessageEvent.current)
    setMessages([])
    if (tick.current) setServiceMessageAsRead()
  }

  const noticeTitle = (
    <div className="notice-title">
      客服消息 <img onClick={closeEvent} style={{ width: 30 }} src={util.buildAssetsPath("assets/icons/ic_close.svg")} />
    </div>
  )

  const controlPanel = (
    <div className="control-panel">
      <label className="check-box">
        <input type="checkbox" onChange={handleTick} defaultValue={tick.current} />
        全部标记为已读消息
      </label>

      <div className="btns">
        <div
          className="btn"
          onClick={() => {
            document.body.classList.remove("frieeze")
            setMessages([])
            if (tick.current) setServiceMessageAsRead()
            setTimeout(
              () => {
                props.router.push("/interaction/serviceMessage")
              },
              tick.current ? 100 : 0
            )
          }}
        >
          前往查看
        </div>
        <div style={{ width: "12px" }} />
        <div className="btn" onClick={closeEvent}>
          我知道了
        </div>
      </div>
    </div>
  )

  return (
    <Modal isOpen={messages.length > 0} className="msg-notice-modal" animation="fade">
      <div id="modalInner" className="modal-inner">
        <div className="items">
          <div className="inner" ref={itemsInner}>
            {noticeTitle}
            <div className="overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  className="msg-item mb-1"
                  key={msg.ID + "_" + index}
                  onClick={() => {
                    document.body.classList.remove("frieeze")
                    setMessages([])
                    window.removeEventListener("fetchServiceMessage", newMessageEvent.current)
                    props.router.push("/interaction/serviceChat", { id: msg.SID, name: msg.Nick })
                    // if (tick.current) setServiceMessageAsRead()
                  }}
                >
                  <div className="msg-name">
                    <img src={util.buildAssetsPath("assets/icons/icService.svg")} />
                    {msg.Nick}
                  </div>

                  <div className="msg-content" dangerouslySetInnerHTML={{ __html: msg.Content }} />
                  <div className="msg-time">{msg.Time}</div>
                </div>
              ))}
            </div>
            {controlPanel}
          </div>
        </div>
      </div>
    </Modal>
  )
})
