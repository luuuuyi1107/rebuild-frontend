import React, { useEffect, useState } from "react"
import LayoutPage from "@/components/LayoutPage"

import { getShopItemDetail, postBuyingItem } from "@/action/apis"
import "./style.scss"
import util from "@/magic/util"
import OrderComp from "@/components/OrderComp"
import { Modal, BackButton } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter((props) => {
  const [product, setProduct] = useState(null)
  const [showModal, setshowModal] = useState(false)
  const [orderNo, setOrderNo] = useState("")
  const [loading, setLoading] = useState(false)
  const id = util.getUrlParam("id")
  const itemId = util.getUrlParam("itemId")
  useEffect(() => {
    if (!itemId) {
      noItemEvent()
      return
    }
    setLoading(true)
    getShopItemDetail(itemId)
      .then((res) => {
        if (res.Code !== 1) {
          noItemEvent()
          return
        }
        setProduct(res.Data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  function noItemEvent() {
    notificationAsync
      .alert("无此商品", {
        title: "提示",
        buttonLabels: ["返回"],
      })
      .then(() => {
        const _path = !!id ? "/pointsShop/list?id=" + id : "/pointsShop/home"
        props.router.replace(_path)
      })
  }

  function orderItemEvent(data) {
    postBuyingItem(Object.assign(data, { id: itemId })).then((res) => {
      if (res.Code !== 1) {
        notificationAsync.alert("订购失败-" + res.Message)
      } else {
        setOrderNo(res.Data.OrderID)
        setshowModal(true)
      }
    })
  }

  function getBack() {
    props.router.push(`/pointsShop/${!!id && id !== "0" ? "list" : "home"}`, id ? { id } : {})
  }

  function copyOrderToClipBoard() {
    util.copyToClipBoard(orderNo)
  }

  function contactEvent() {}

  const mainTitle = !!product && !!product.Title ? product.Title : ""

  return (
    <LayoutPage onBack={getBack} loading={loading} center={mainTitle} className="shop-item-layout" right={null}>
      {!!product && (
        <div className="inner">
          {/* <img className="item-image" src={product.Logo} /> */}
          <div className="shop-item-detail">
            <div>
              <div className="order-title">商品介绍</div>
              <div className="desc" dangerouslySetInnerHTML={{ __html: product.Text }} />
              {/* <span dangerouslySetInnerHTML={{__html: broadcast.Text}}></span> */}
              <div style={{ height: "15px" }} />
              <div className="buying-status">
                <div>
                  商品价格: <span style={{ color: "rgb(195, 2, 2)" }}>{product.Price}</span>分
                </div>
                <div>
                  订购数量: <span style={{ color: "rgb(195, 2, 2)" }}>1</span>
                </div>
              </div>
              {/* <div className="buying-status">
              <div>已购: { product.Sold }</div>
              <div>库存: { product.Total }</div>
            </div> */}
            </div>
            <OrderComp needAddress={product.Mailing} title={mainTitle} confirmEvent={orderItemEvent} />
          </div>
        </div>
      )}
      <Modal isOpen={showModal} animation="fade">
        <div className="result-frame">
          <div className="result-header">
            <div className="result-back">
              <BackButton onClick={getBack}>&nbsp;&nbsp;</BackButton>
            </div>
            <div className="title">订单结果</div>
            <div />
          </div>

          <img className="result-gift" src={util.buildAssetsPath("assets/gift.jpg")} />

          <div className="statement">恭喜，您已成功订购该商品！</div>

          <div className="order-info" onClick={copyOrderToClipBoard}>
            订单号： {orderNo}
            <img style={{ marginLeft: "8px" }} src={util.buildAssetsPath("assets/icons/copyicon.svg")} />
          </div>
          <div className="notice-btn" onClick={contactEvent}>
            通知金沙娱乐城客服
            <div className="deco">
              <img className="result-deco-img" src={util.buildAssetsPath("assets/order-result-btn-deco.png")} />
            </div>
          </div>
        </div>
      </Modal>
    </LayoutPage>
  )
})
