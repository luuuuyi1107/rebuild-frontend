import React, { useState, useEffect, useRef, useMemo } from "react"
import LayoutPage from "@/components/LayoutPage"
import styles from "./style.module.scss"
import { Icon } from "react-onsenui"
import util from "@/magic/util"
import OrderConfirm from "@/components/OrderConfirmInput"
import { getOrderPostList, userPlacesOrder, getBank } from "@/action/apis"
import EmptyView from "@/components/EmptyView"
import _ from "lodash"
import { useRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { withLogin } from "@/magic/withLogin"
import { findPaymentIconByType, MOBILE_PAYMENT, ORDER_PAYMENT } from "@/config/payment"
import DropMenu from "@/components/DropMenu"
import { notificationAsync } from "@/magic/notification"
import Money from "@/components/Money"
import classNames from "classnames"
import { apiHandler } from "@/action"

export default withLogin(() => {
  const { route, router } = useRouter()
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [orderList, seteOrderList] = useState([])
  const [orderData, setOrderData] = useState(null)
  const banks = useRef([])
  const [typeKeys, setTypeKeys] = useState([])
  const [moneyRangeKeys, setMoneyRangeKeys] = useState([])
  const [curPage, setCurPage] = useState(1)
  const [isEnd, setIsEnd] = useState(false)
  const [isScrollEnd, setIsScrollEnd] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const pageSize = 15
  const innerRef = useRef(null)

  const bankTypes = [
    { key: "0", name: "不限" },
    ...ORDER_PAYMENT.ALL.map((x) => ({ key: x.TYPE.toString(), name: x.NAME2 })),
    { key: MOBILE_PAYMENT.TYPE + "", name: MOBILE_PAYMENT.NAME },
  ]
  const moneyRnage = [
    { key: "-1", name: "不限" },
    { key: "0", name: "10~500", min: 10, max: 500 },
    { key: "1", name: "500~2000", min: 500, max: 2000 },
    { key: "2", name: "2000~5000", min: 2000, max: 5000 },
    { key: "3", name: "5000以上", min: 5000 },
  ]

  const typeKeyValue = bankTypes.reduce((sum, type) => {
    const name = type.name === "不限" ? "全部" : type.name
    return { ...sum, [type.key]: name, [parseInt(type.key)]: name, [name]: type.key }
  }, {})

  function refresh() {
    seteOrderList([])
    setOrderData(null)
    // setCurPage(1)
    setIsEnd(false)
    setIsScrollEnd(false)
    setShowModal(false)
    fetchData(1, curPage * pageSize)
  }
  useEffect(() => {
    handlePageShow()
  }, [])

  useEffect(refresh, [typeKeys, moneyRangeKeys])

  const min = useMemo(() => {
    if (!moneyRangeKeys.length) return null
    return Math.min(...moneyRangeKeys.map((key) => moneyRnage.find((x) => x.key === key).min))
  }, [moneyRangeKeys])
  const max = useMemo(() => {
    if (!moneyRangeKeys.length) return null
    const res = Math.max(...moneyRangeKeys.map((key) => moneyRnage.find((x) => x.key === key).max))
    return isNaN(res) ? null : res
  }, [moneyRangeKeys])

  async function fetchData(page, size) {
    if (loading) return
    setLoading(true)
    try {
      const res = await apiHandler(() =>
        getOrderPostList(_.pickBy({ PageIndex: page || curPage, PageSize: size || pageSize, type: typeKeys.join(","), min, max }))
      )
      const _newItems = res.Data.map((data) => ({
        ...data,
        OriginMoney: data.Money,
        Money: data.Money - data.LockMoney - data.DealMoney,
        Type: _.uniq(data.Type.split(",")),
      }))
      seteOrderList((prevItems) => {
        // 过滤出新数据中不存在于旧数据中的项
        const uniqueNewItems = _newItems.filter((newItem) => !prevItems.some((item) => item.ID === newItem.ID))

        // 返回原数组加上不重复的新数据
        return [...prevItems, ...uniqueNewItems]
      })
      setIsEnd(res.Data.length < pageSize)
      if (res.Data.length === 0) {
        setIsScrollEnd(true)
      }
    } catch (error) {
      console.error({ error })
    } finally {
      setLoading(false)
      if (!loaded) setLoaded(true)
    }
  }

  function scrollEvent(e) {
    if (isEnd && !isScrollEnd) {
      setIsScrollEnd(true)
    }
    if (isEnd || loading) return
    const _target = e.target
    const { scrollTop, scrollHeight, offsetHeight } = _target
    if (scrollTop / (scrollHeight - offsetHeight) > 0.98) {
      setCurPage((prevPage) => prevPage + 1)
      fetchData()
    }
  }

  function buyingEvent(orderData) {
    setOrderData(orderData)
    setShowModal(true)
  }

  function confirmOrderEvent(data) {
    const catchMessage = util.getOrderPostMessage()
    if (!!catchMessage) {
      return notificationAsync.toast(catchMessage, { timeout: 1200, class: "orderpost-toast", animation: "fade" })
    }

    if (banks.current.length === 0) {
      notificationAsync.alert("请您绑定银行卡").then(() => {
        router.push("/site/setBankCard")
      })
      return
    }

    return userPlacesOrder(data).then(async (res) => {
      if (res.Code !== 1) {
        notificationAsync.alert(res.Message).then(() => {
          if (res.Message === "您还有未完成的交易。") {
            router.push("/orderPost/self")
          } else if (res.Message === "用户未登录或身份失效。") {
            util.cache.remove("orderPostData")
            util.cache.removeStartsWith("Pay/OrderPostUserAuth", "session")
            router.push("/site/login", { redirect: route.pathname + route.search })
          }
        })
        return
      }

      await notificationAsync.alert("下单后请10分钟内完成付款,无法付款请主动取消订单!")
      router.push(`/orderPost/self?id=${data.id}`)
    })
  }

  useEffect(() => {
    if (!loading || curPage === 1) return
    util.scrollToBottom(innerRef.current)
  }, [loading])

  function handlePageShow(event) {
    util.cache.remove("orderPostData") // 清掉 orderpost的资料强制进来此页都要取新的token
    getBank().then((res) => {
      if (res.Code !== 1) return
      banks.current = res.Data
    })

    if ((!!event && event.persisted) || (window.performance && window.performance.navigation.type === 2)) {
      seteOrderList([])
      fetchData()
    }
  }

  return (
    <LayoutPage
      onBack={() => {
        router.push("/site/depositCenter")
      }}
      center="挂单充值"
      className={styles["orderpost-list"]}
      right={null}
    >
      <div className="header w-full bg-theme-half">
        <div className="bg-white rounded flex text-center mx-1 p-1">
          <div className="item flex-1 text-1.25 border-r-2" onClick={() => router.push("/orderPost/self")}>
            我的购买
          </div>
          <div className="bg-theme w-[1px]"></div>
          <div className="item flex-1 text-1.25" onClick={() => router.push("/site/depositWithdrawRecord?tab=挂单提现")}>
            我的出售
          </div>
          <div className="bg-theme w-[1px]"></div>
          <div className="item flex-1 text-1.25" onClick={() => router.push("/orderPost/userData")}>
            个人中心
          </div>
        </div>
      </div>
      <div className="option my-0.5 mx-1 flex items-center text-1.25 ">
        <DropMenu
          className="bg-white rounded px-1 mr-0.5"
          title="收款方式"
          option={bankTypes}
          selected={typeKeys}
          onChange={({ key }) => {
            if (key == "0") setTypeKeys([])
            else typeKeys.includes(key) ? setTypeKeys([..._.pull(typeKeys, key)]) : setTypeKeys(typeKeys.concat(key))
          }}
        />
        <DropMenu
          className="bg-white rounded px-1"
          title="金额"
          option={moneyRnage}
          selected={moneyRangeKeys}
          onChange={({ key }) => {
            if (key == "-1") setMoneyRangeKeys([])
            else moneyRangeKeys.includes(key) ? setMoneyRangeKeys([..._.pull(moneyRangeKeys, key)]) : setMoneyRangeKeys(moneyRangeKeys.concat(key))
          }}
        />
        <div className="flex-1 flex justify-end">
          <div onClick={refresh} className="bg-white rounded py-0.5 flex items-center px-1 text-theme">
            <Icon icon="ion-android-refresh" className="mr-0.5 text-1.5" />
            刷新
          </div>
        </div>
      </div>

      <div className="order-items">
        <div onScroll={_.throttle(scrollEvent, 100)} ref={innerRef} className={classNames("inner mx-1", { "no-data": orderList.length == 0 })}>
          {orderList.map((order, index) => (
            <div className="bg-white p-1 pl-2 rounded item-bg text-1.125 mb-0.5" key={order.ID}>
              <div className="flex justify-between mb-1">
                <div className="flex items-center ">
                  {order.Money2 && order.Money > order.Money2 ? (
                    <>
                      <div className="text-1.75 text-theme">
                        ¥<Money value={order.Money2.toFixed(2)} baseSize="text-1.75" />
                      </div>
                      <div className="bg-[#E14138] text-white rounded-[2px] px-0.5 py-0.25 leading-none ml-1 whitespace-nowrap flex items-center text-[12px]">
                        加赠 ¥<Money textColor="text-white" value={(order.Money - order.Money2).toFixed(2)} baseSize="text-1" floatSize="text-0.75" />
                      </div>
                    </>
                  ) : (
                    <div className="text-1.75 text-theme">
                      ¥<Money value={order.Money.toFixed(2)} baseSize="text-1.75" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <div
                    className="bg-[#FFF2E1] border-0 text-theme p-1.5 py-0.5 rounded-sm  text-center"
                    onClick={() => {
                      buyingEvent(order)
                    }}
                  >
                    我要买
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  {order.OrderSplit == 0 ? (
                    <>
                      <span className={classNames("text-1.25 text-red-600")}>不可拆分</span>
                    </>
                  ) : (
                    <>
                      <span className={classNames("text-1.25 text-green-500")}>可拆分</span>
                    </>
                  )}
                </div>

                <div className="flex items-center" style={{ width: 210 }}>
                  <div className="whitespace-nowrap mr-.05">收款方式</div>
                  <div className="flex">
                    {order.Type.map((type, idx) => (
                      <span style={{ marginLeft: "5px", maxHeight: 21, maxWidth: 20 }} key={type + "_" + idx} className="flex items-center">
                        <img style={{ maxHeight: 21, maxWidth: 20 }} src={util.buildAssetsPath(findPaymentIconByType(type))} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && orderList.length > 0 && (
            <div className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )}
          {isScrollEnd && orderList.length > 0 && <div className="is-end">我是有底线的</div>}
          {orderList.length === 0 && (
            <div className="no-data">
              <EmptyView imgId={2} desc={loaded ? "暂无订单" : "加载中"} />
            </div>
          )}
        </div>
      </div>

      <ModalPage
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
        }}
        className="align_left"
      >
        {!!orderData && showModal && (
          <OrderConfirm
            backEvent={() => {
              setShowModal(false)
            }}
            confirmEvent={confirmOrderEvent}
            typeObj={typeKeyValue}
            orderData={orderData}
          />
        )}
      </ModalPage>
    </LayoutPage>
  )
})
