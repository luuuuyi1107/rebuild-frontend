import React, { useEffect, useState, useCallback } from "react"
import "./style.scss"
import { Modal } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"
import { setNotifyMessageAsRead, getNotifyList } from "@/action/apis"
import dayjs from "dayjs"
import _ from "lodash"

export default withRouter((props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState([])
  const [hasAsyncData, setHasAsyncData] = useState(false)

  useEffect(() => {
    window.addEventListener("popupMessage", popupEvent)
    return () => {
      window.removeEventListener("popupMessage", popupEvent)
    }
  }, [hasAsyncData])

  function routerTo(item) {
    if (item?.orderId) {
      setNotifyMessageAsRead(item.msgID)
      setIsOpen(false)
      setItems([])
      setHasAsyncData(!hasAsyncData)
      props.router.push(`/orderPost/self?pid=${item.orderId}`) // &aid=${item.id}
    }
  }

  function getHiddenMessages(saving = true) {
    const _hiddingMsgs = util.cache.get("msgs") || []
    const _filterMsgs = _hiddingMsgs.filter((msg) => dayjs().diff(msg.time, "hour") < 24)
    if (saving && _filterMsgs.length !== _hiddingMsgs.length) {
      util.cache.set("msgs", _filterMsgs)
    }
    return _filterMsgs
  }

  function hidenMessage(_item) {
    const _hiddingMsgs = getHiddenMessages(false)
    _hiddingMsgs.push({ ..._item, time: new Date().getTime() })
    util.cache.set("msgs", _hiddingMsgs)
    setItems(items.filter((item) => !(item.orderId === _item.orderId && item.id === _item.id)))
  }

  useEffect(() => {
    setIsOpen(items.length > 0)
  }, [items])

  function popupEvent(data) {
    if (["site/thirdLogin", "orderPost/self"].some((path) => location.hash.includes(path)) || !data.detail.Text) return
    const [text, ids] = data.detail.Text.split("||")
    const [orderId, id] = ids.split("|")
    const _hiddingMsgs = getHiddenMessages()
    if (_hiddingMsgs.length > 0 && _hiddingMsgs.some((msg) => msg.orderId === orderId)) return

    const _item = {
      msgID: data.detail.ID,
      text,
      orderId,
      id,
    }
    if (items.some((it) => it.msgID === _item.msgID)) return
    setItems([_item])
    setHasAsyncData(!hasAsyncData)
    // if (items.some((item) => item.id === id && item.orderId === orderId)) return
    // fetchData()
  }

  const fetchData = () => {
    getNotifyList().then((res) => {
      const _items = res.Data.map((_msg) => {
        const [text, ids] = _msg.Content.split("||")
        const pattern = /([\d_]+\.\d+)|([\d_]+)/g
        const [orderId, id] = ids.match(pattern)
        return {
          msgID: _msg.ID,
          text,
          orderId,
          id,
        }
      })

      const _hiddingMsgs = getHiddenMessages()
      const _filteredItems = _items.filter((_item) => !_hiddingMsgs.some((msg) => msg.orderId === _item.orderId))
      setItems(_.map(_.groupBy(_filteredItems, "orderId"), (group) => _.maxBy(group, "id")).slice(0, 1))
      setHasAsyncData(!hasAsyncData)
    })
  }

  return (
    <Modal isOpen={isOpen} className="msg-popup-modal" animation="fade">
      <div className="inner">
        {items.map((item, idx) => (
          <div key={item.orderId + "_" + idx} className="item">
            <div className="image" />
            <div
              className="content"
              onClick={() => {
                routerTo(item)
              }}
            >
              {item.text}
              <span className="text-red-500 cursor-pointer font-bold break-keep"> 立即前往 &gt;&gt;</span>
            </div>
            <div
              className="close"
              onClick={() => {
                hidenMessage(item)
              }}
            />
          </div>
        ))}
      </div>
    </Modal>
  )
})
