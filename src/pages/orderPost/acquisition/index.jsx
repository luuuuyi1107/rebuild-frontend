import React, { useState, useEffect } from "react"

import LayoutPage from "@/components/LayoutPage"
import { getDrawMoneyList } from "@/action/apis"
import EmptyView from "@/components/EmptyView"

import util from "@/magic/util"
import "@/components/RecordPage/style.scss"
import "@/pages/site/depositWithdrawRecord/style.scss"
import "../common.scss"
import Row from "./row"
import { useRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default () => {
  const { route, router } = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [isEnd, setIsEnd] = useState(false)
  const [isScrollEnd, setIsScrollEnd] = useState(false)
  const [curPage, setCurPage] = useState(1)
  let myTimer = null
  const pageSize = 10

  useEffect(() => {
    if (!util.isLoginOrNoti({ route, router })) return
  }, [])

  useEffect(() => {
    fetchData()
  }, [curPage])

  function fetchData(page, size) {
    return new Promise((resolve, reject) => {
      const _page = page || curPage
      const _size = size || pageSize

      getDrawMoneyList(_page, _size)
        .then((res) => {
          if (res.Code !== 1) return
          setItems((prevItems) => {
            const filterItems = prevItems.filter((pItem) => !res.Data.some((_newitem) => _newitem.ID === pItem.ID))
            return filterItems.concat(res.Data)
          })

          setIsEnd(res.Data.length < pageSize)
          if (res.Data.length === 0) {
            setIsScrollEnd(true)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }

  function scrollEvent(e) {
    if (isEnd && !isScrollEnd) {
      setIsScrollEnd(true)
    }
    if (isEnd || loading) return
    if (!!myTimer) clearTimeout(myTimer)
    const _target = e.target
    myTimer = setTimeout(() => {
      const { scrollTop, scrollHeight, offsetHeight } = _target
      if (scrollTop / (scrollHeight - offsetHeight) > 0.98) {
        // setLoading(true)
        setCurPage((prevPage) => prevPage + 1)
      }
    }, 300)
  }

  async function withdrawSubmit(event, Status, id, pid) {
    if (Status == 0 || Status == 2) this.setState({ apiLoading: true })
    event.classList.add("none")
    if (Status == 0) {
      let res = await action.post("User/RevokeokDrawMoney", { id, reply: 0 })
      this.setState({ apiLoading: false })
      if (res.Code != 1) {
        notificationAsync.alert(res.Message || "您好, 当前结算高峰期，为避免出错, 暂时不允许撤销提款!", { title: "操作提示" })
        return
      }
      document.getElementById("withdrawStatus" + id).innerHTML = "提款状态：已撤销"
      notificationAsync.alert(res.Message, { title: "成功" })
    } else if (Status == 1) {
      if (!!pid) {
        router.push(`/orderPost/self?pid=${pid}`)
        return
      }

      let res = await action.post("User/ConfirmDrawMoney", { id, reply: 1 })
      this.setState({ apiLoading: false })
      if (res.Code != 1) {
        notificationAsync.alert(res.Message, { title: "操作提示" })
        return
      }

      notificationAsync.alert(res.Message, { title: "成功" })
    } else if (Status == 2) {
      let res = await action.post("User/ConfirmDrawMoney", { id: id, reply: 1 })
      this.setState({ apiLoading: false })
      if (res.Code != 1) {
        notificationAsync.alert(res.Message, { title: "操作提示" })
        return
      }
      document.getElementById("withdrawStatus" + id).innerHTML = "提款状态：已确认"
      notificationAsync.alert(res.Message, { title: "成功" })
    }
  }

  function refreshData() {
    setItems([])
    fetchData(1, curPage * pageSize)
  }

  return (
    <LayoutPage
      loading={loading}
      center="我的收购"
      className="orderpost-acquisition record-page"
      right={
        <div onClick={refreshData} className="refresh-btn">
          <img style={{ width: 16 }} src={util.buildAssetsPath("assets/icons/ic_recheck.png")} />
          刷新
        </div>
      }
      onScroll={scrollEvent}
    >
      <div className="scroll-list-content">
        {items.map((item) => (
          <div className="record-list-item" key={item.ID}>
            <Row row={item} withdrawSubmit={withdrawSubmit} />
          </div>
        ))}
        {items.length === 0 && (
          <div className="no-data">
            <EmptyView imgId={2} desc={"暂无资料"} />
          </div>
        )}
        {isScrollEnd && <div className="is-end">我是有底线的</div>}
      </div>
    </LayoutPage>
  )
}
