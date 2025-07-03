import React, { useState, useEffect, useRef, useMemo } from "react"
import LayoutPage from "@/components/LayoutPage"
import PendPay from "@/components/PendPay"
import { getSelfOrderList, getOrderDataById, userCancelOrderById, submitOrderPostPay, getBank, userConfirmOrder } from "@/action/apis"
import { Icon } from "react-onsenui"
import SliderCarousel from "@/components/Sliders"
import EmptyView from "@/components/EmptyView"
import util from "@/magic/util"
import "./style.scss"
import { useRouter } from "@/magic/withRouter"
import ModalPage, { CloseBtn } from "@/components/ModalPage"
import classNames from "classnames"
import Money from "@/components/Money"
import { OrderPostFetcher } from "@/action/fetcher"
import { apiHandler } from "@/action"
import { notificationAsync } from "@/magic/notification"
import { toast } from "@/magic/toast"

export default () => {
  const { route, router } = useRouter()
  const [loading, setLoading] = useState(true)
  const [apiLoading, setApiLoading] = useState(false)
  const [selfOrderList, setSelfOrderList] = useState([])
  const [orderData, setOrderData] = useState(null)
  const [banks, setBanks] = useState([])
  const [showDetail, setShowDetail] = useState(false)
  const [showSlider, setShowSlider] = useState(false)
  const [sliders, setSliders] = useState([])
  const sliderIdx = useRef(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [imgSrc, setImgSrc] = useState([])
  const [curPage, setCurPage] = useState(1)
  const [isEnd, setIsEnd] = useState(false)
  const [isScrollEnd, setIsScrollEnd] = useState(false)
  const [searchData, setSearchData] = useState(null)
  const pageSize = 15
  const pid = useRef(util.getUrlParam("pid"))
  const isSeller = !!util.getUrlParam("pid")
  const shortCutId = useRef(util.getUrlParam("id"))
  // const accessId = useRef(util.getUrlParam("aid"))
  // const orderPostData = util.cache.get('orderPostData')
  const [isActiveCardBank, setIsActiveCardBank] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showAlipayReceiptRutorial, setShowAlipayReceiptRutorial] = useState(false)

  const statusData = {
    "-1": "撤销",
    0: "待付款",
    1: "已付款",
    2: "已确认",
    3: "订单已完结",
  }
  const filterKeywords = [
    "通知代付",
    "操作 禁止撤销",
    "操作 解除禁止撤销",
    "回调关闭",
    "操作 止付订单",
    "操作 解除止付",
    "买家通知失败",
    "买方回调关闭",
  ]

  let myTimer = null

  useEffect(() => {
    getBank().then((res) => {
      if (res.Code !== 1) return
      setBanks(res.Data)
    })
    setTimeout(() => {
      if (route.query.gid) {
        const { gid, ...query } = route.query
        router.replace(route.pathname, query)
      }
    }, 4000)
  }, [])

  useEffect(() => {
    if (isSeller) {
      // 下单详情 避免orderpost token 过期
      fetchData()
      return
    }

    if (!util.hasOrderPostToken()) {
      const _msg = util.getOrderPostMessage()
      if (!!_msg) {
        notificationAsync.alert(_msg).then(() => {
          if (_msg === "提款挂单功能已关闭。") return router.back()
          if (_msg === "您累计充值少于100无法使用挂单充值。") return router.back()
          fetchData()
        })
        return
      } else {
        fetchData()
        return
      }
    }
    fetchData()
  }, [searchData, curPage])

  useEffect(() => {
    if (!showDetail && !!orderData) setOrderData(null)
  }, [showDetail])

  function fetchData(page, size) {
    return new Promise((resolve, reject) => {
      if (!!shortCutId.current) setLoading(true)
      const PageIndex = page || curPage
      const PageSize = size || pageSize

      const data = Object.assign(
        {
          PageIndex,
          PageSize,
          ...(isSeller ? { pid: pid.current, type: 1 } : {}),
        },
        searchData
      )

      getSelfOrderList(data)
        .then((res) => {
          if (res.Code !== 1) {
            notificationAsync.alert(res.Message)
            return
          }
          setSelfOrderList((prevItem) => {
            const _items = prevItem.concat(res.Data)
            resolve(_items)
            return _items
          })
          setIsEnd(res.Data.length < pageSize)
          if (res.Data.length === 0) {
            setIsScrollEnd(true)
          }
          if (!!shortCutId.current) {
            const _item = res.Data.find((_item) => _item.PID === shortCutId.current)
            if (!_item) {
              setLoading(false)
              return
            }
            setShowDetail(true)
            continuePaymentEvent(_item).then((res) => {
              setLoading(false)
            })
            shortCutId.current = null
          }
        })
        .catch(() => {
          reject()
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
        setLoading(true)
        setCurPage((prevPage) => prevPage + 1)
      }
    }, 300)
  }

  async function continuePaymentEvent(item) {
    setApiLoading(true)
    const res = await apiHandler(() => getOrderDataById(item.ID), {
      errorHandler: (error) => {
        notificationAsync.alert(error.Message)
        setApiLoading(false)
      },
    })
    setApiLoading(false)

    const contentList = !res.Data.Content
      ? []
      : res.Data.Content.split("<br/>").filter((text) => {
          return !filterKeywords.some((keys) => {
            return keys.split(" ").every((key) => text.includes(key))
          })
        })

    setOrderData(
      Object.assign(res.Data, {
        OrderTime: util.date.format(util.date.toDate(res.Data.OrderTime), "YYYY-MM-DD HH:mm:ss"),
        PayTime: util.date.format(util.date.toDate(res.Data.PayTime), "YYYY-MM-DD HH:mm:ss"),
        StatusText: statusData[res.Data.Status],
        ImageFile: await Promise.all(res.Data.refImageFile.map(async (src) => await OrderPostFetcher.urlBuilder("." + src))),
        Content: contentList.join("<br />"),
      })
    )

    setShowDetail(true)
  }

  function PendPayButtonEvent(key, params = {}) {
    if (key === "cancel") {
      notificationAsync
        .confirm(
          `<div>
            <font style="color: red">已支付成功，请勿取消订单！</font><br />
            <font style="color: red">取消订单后，请勿再次付款！</font><br />
            操作失误引起的损失，由您自行承担！
          </div>`,
          { title: "确认提示", buttonLabels: ["取消", "确定"] }
        )
        .then(() => {
          cancelOrder()
        })
    } else if (key === "refresh") {
      continuePaymentEvent(orderData)
    } else if (key === "confirm") {
      setShowConfirm(true)
      const { isActiveCardBank } = params
      setIsActiveCardBank(isActiveCardBank)
    } else if (key == "showAlipayReceiptRutorial") {
      setShowAlipayReceiptRutorial(true)
    } else if (key === "confirmGetMoney") {
      notificationAsync
        .confirm(
          `<div>
            <font style="color: red">⓵确认到帐后即不可取消</font><br />
            <font style="color: red">⓶请确认提款是否已到帐</font><br />
            <font style="color: red">⓷如果付款姓名跟系统显示不一致，请马上联系客服处理!</font>
          </div>`,
          { title: "确认提示", buttonLabels: ["取消", "确认"] }
        )
        .then(() => {
          sellerConfirmOrder()
        })
    }
  }

  function sellerConfirmOrder() {
    const id = orderData.ID
    userConfirmOrder({ id }).then((res) => {
      if (res.Code !== 1) {
        notificationAsync.alert(res.Message)
        return
      }

      const pid = util.getUrlParam("pid")
      if (!!pid) {
        setShowDetail(false)
        setShowConfirm(false)
        setSelfOrderList([])
        fetchData(1, curPage * pageSize).then((_items) => {
          if (res.Code === 1) {
            _items.forEach((_item) => {
              if (_item.ID === id && _item.Status == 2) {
                _item.Status = 3
              }
            })
            setSelfOrderList(_items)
          }
        })
      } else {
        router.push("/site/depositWithdrawRecord")
      }
    })
  }

  function cancelOrder() {
    userCancelOrderById({ id: orderData.ID }).then((res) => {
      if (res.Code !== 1) {
        notificationAsync.alert(res.Message)
        return
      }
      notificationAsync.alert(res.Message).then(() => {
        router.push("/orderPost/home")
      })
    })
  }

  function convertAndResizeToBase64(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)

      fileReader.onload = () => {
        const img = new Image()
        img.src = fileReader.result

        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          if (width > 600) {
            height *= 600 / width
            width = 600
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, width, height)

          const resizedBase64 = canvas.toDataURL(file.type)
          resolve(resizedBase64)
        }

        img.onerror = (error) => {
          reject(error)
        }
      }

      fileReader.onerror = (error) => {
        reject(error)
      }
    })
  }

  async function imageUploadChange(event) {
    const file = event.target.files[0]
    const img = await convertAndResizeToBase64(file)
    document.getElementById("uploadBtn").value = null

    setImgSrc((prev) => prev.concat(img).slice(-2))
    // this.setState({ Base64 })
  }
  useEffect(() => {
    imgSrc.length && imgConfirmEvent()
  }, [imgSrc])

  const imgConfirmEvent = async () => {
    const [bank] = banks

    try {
      setIsUploading(true)
      await apiHandler(() =>
        submitOrderPostPay({
          id: orderData.ID,
          name: bank.Name,
          bank: bank.Bank,
          account: bank.Account,
          imageContent: imgSrc.join("|"),
        })
      )
      setIsUploading(false)
    } catch (e) {
      setIsUploading(false)
      throw e
    }

    toast("上传图片成功，请耐心等待卖家确认交易。", { duration: 1500 })

    // setImgSrc([])
    if (document.getElementById("uploadBtn")) {
      // notwork slow will get nothing
      document.getElementById("uploadBtn").value = null
    }
    PendPayButtonEvent("refresh")
    fetchData(1, curPage * pageSize)
  }

  function imgCancelEvent() {
    setShowConfirm(false)

    setImgSrc([])
    document.getElementById("uploadBtn").value = null
  }

  function removeImgSrc(img) {
    setImgSrc((prevImgs) => prevImgs.filter((_img) => _img !== img))
  }

  function setSliderEvent(idx) {
    sliderIdx.current = idx
    setSliders(imgSrc)
    setShowSlider(true)
  }

  function demoImagesEvent(idx) {
    sliderIdx.current = idx
    setSliders(orderData.ImageFile)
    setShowSlider(true)
  }

  function sliderClickEvent() {
    setShowSlider(false)
    setSliders([])
  }

  return (
    <>
      <LayoutPage
        loading={loading}
        apiLoading={apiLoading}
        onBack={() => {
          if (showDetail) {
            setShowDetail(false)
          } else {
            router.back()
          }
        }}
        center={showDetail ? (!isSeller ? "下单详情" : "订单详情") : !isSeller ? "我的购买" : "我的挂单提款"}
        className="orderpost-self"
        right={null}
      >
        <div className={`items ${showDetail ? "hidden" : ""}`} onScroll={scrollEvent}>
          {selfOrderList.map((_item) => (
            <div key={"item_" + _item.ID} className="item relative">
              <div>
                <img src={util.buildAssetsPath("assets/icons/ic_dollor.png")} />
                <div className="title">{!isSeller ? "充值金额" : "提现金额"}</div>
                <Money value={_item.Money} />
              </div>
              <div>
                <img src={util.buildAssetsPath("assets/icons/ic_text.png")} />
                <div className="title">{!isSeller ? "充值状态" : "提款状态"}</div>
                <div
                  className={classNames(`content`, {
                    "text-green-500": _item.Status == 0,
                    "text-red-500": _item.Status == 1,
                    "text-gray-500": ![0, 1].includes(_item.Status),
                  })}
                >
                  {statusData[_item.Status]}
                </div>
              </div>
              <div>
                <img src={util.buildAssetsPath("assets/icons/ic_time.png")} />
                <div className="title">下单时间</div>
                <div className={classNames(`content`, "text-gray-500")}>
                  {util.date.format(util.date.toDate(_item.OrderTime), "YYYY-MM-DD HH:mm:ss")}
                </div>
              </div>
              {!isSeller ? (
                _item.Status !== 0 ? (
                  <button
                    className="absolute right-1 bottom-1 rounded-[10px] py-0.5 px-1.5 bg-theme border-0 text-white text-1.25"
                    onClick={async () => {
                      continuePaymentEvent(_item)
                    }}
                  >
                    查看
                  </button>
                ) : _item.Status === 0 ? (
                  <button
                    className="w-full bg-[#FFF2E1] text-theme text-center py-1 text-1.25 border-0 rounded-[10px]"
                    onClick={async () => {
                      continuePaymentEvent(_item)
                    }}
                  >
                    继续付款
                  </button>
                ) : null
              ) : (
                <button
                  className="w-full bg-[#FFF2E1] text-theme text-center py-1 text-1.25 border-0 rounded-[10px]"
                  onClick={async () => {
                    continuePaymentEvent(_item)
                  }}
                >
                  查看详情
                </button>
              )}
            </div>
          ))}
          {selfOrderList.length === 0 && (
            <div className="no-data">
              <EmptyView imgId={2} desc={"暂无资料"} />
            </div>
          )}
          {isScrollEnd && <div className="is-end">我是有底线的</div>}
        </div>
        {showDetail && (
          <PendPay
            demoImages={demoImagesEvent}
            orderData={orderData}
            confirm={() => {
              PendPayButtonEvent("confirmGetMoney")
            }}
            refresh={() => {
              PendPayButtonEvent("refresh")
            }}
            buttonEvent={PendPayButtonEvent}
          />
        )}

        <ModalPage isOpen={showConfirm} className="image-modal" loading={isUploading}>
          <div className={`upload-frame ${showSlider ? "hidden" : ""}`}>
            <div className="title">提示</div>
            <div className="content">
              <div className=" text-red-500 flex justify-center items-center font-medium text-[16px]">
                <Icon className="text-[17px] mr-[5px]" icon="ion-android-alert" />
                注意
              </div>

              {isActiveCardBank ? (
                <>
                  <p className="m-0 mt-[6px] text-red-500 text-[16px] font-normal">1.请上传带有公章的付款回执单</p>
                  <p className="m-0 mt-[6px] p-0 text-[16px] font-normal">
                    <span
                      className="text-[#108DE9] border-0 border-solid border-b border-[#108DE9]"
                      onClick={() => setShowAlipayReceiptRutorial(true)}
                    >
                      2.申请支付宝回单快速到帐👈👈
                    </span>
                  </p>
                </>
              ) : (
                <div className="text-red-500">请上传带有公章的付款回执单</div>
              )}

              <div className="previews">
                {imgSrc.map((_img, idx) => (
                  <div key={idx} className="w-[45%]">
                    <div
                      onClick={() => {
                        removeImgSrc(_img)
                      }}
                      className="remove-icon"
                    >
                      <Icon icon="ion-close" />
                    </div>
                    <img
                      onClick={() => {
                        setSliderEvent(idx)
                      }}
                      src={_img}
                    />
                  </div>
                ))}
                {imgSrc.length < 2 && (
                  <div className="w-[45%]">
                    <label className="uploadLabel" htmlFor="uploadBtn">
                      <img style={{ width: 28 }} src={util.buildAssetsPath("assets/icons/ic_camera.png")} />
                    </label>
                  </div>
                )}
              </div>

              <input
                id="uploadBtn"
                className="hidden"
                type="file"
                accept="image/png, image/gif, image/jpeg"
                name="uploadImg"
                onChange={imageUploadChange}
              />

              <div className="desc">如无法上传图片，请第一时间联系 在线客服，否则造成损失自行负责</div>
            </div>
            <div className="btns">
              <div onClick={imgCancelEvent}>取消</div>
              <div onClick={imgCancelEvent}>确定</div>
            </div>
          </div>
        </ModalPage>

        <ModalPage
          isOpen={showSlider}
          className="image-modal"
          onClose={() => {
            setShowSlider(false)
          }}
        >
          {/* { showSlider &&  } */}
          <SliderCarousel index={sliderIdx.current} sliders={sliders.map((Name, ID) => ({ Name, ID }))} clickEvent={sliderClickEvent} />
        </ModalPage>

        <ModalPage isOpen={showAlipayReceiptRutorial} className="image-modal relative" scrollable={false}>
          <div className={`bg-white relative max-w-[90%] rounded-sm mx-auto my-0`}>
            <div className="bg-theme p-0.75 rounded-t-sm text-1.25">
              申请支付宝回单教程
              <CloseBtn onClick={() => setShowAlipayReceiptRutorial(false)} />
            </div>
            <div className="p-0.75 pb-[0.14rem]">
              <img className="w-full" src={util.buildAssetsPath("assets/alipay_get_receipt_tutorial.gif")} />
            </div>
          </div>
        </ModalPage>
      </LayoutPage>
    </>
  )
}
