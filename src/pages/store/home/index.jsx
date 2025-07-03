import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import { getStoreDataById, getPush, getBank, getShopStore, getOpenStore, getCancelOrderById, setPayPass, setShopConfirm } from "@/action/apis"

import "./style.scss"
import MyStore from "./myStore"
import SearchRecord from "./searchRecord"
import StoreUpLoad from "./storeUpLoad"
import QA from "./qa"
import Notice from "./notice"
import Payment from "./payment"
import OrderDetail from "./orderDetail"
import { Icon, Button } from "react-onsenui"
import RecordPage from "@/components/RecordPage"
import * as apiNotification from "@/magic/ApiNotification"
import AvatarImg from "@/components/AvatarImg"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        user: null,
        storeArea: [],
        PageIndex: 1,
        PageSize: 20,
        showMyOrder: false,
        showStoreQA: false,
        showStoreDetail: false,
        showSearch: false,
        showUpLoad: false,
        showPayment: false,
        showOrderDetail: false,
        showStoreNotice: false,
        storeDetail: null,
        apiLoading: false,
        myStore: null,
        loading: true,
        orderDetailID: null,
        noticeData: null,
      }
    }
    componentDidMount() {
      this.loadData()
      this.setState({ loading: false })
    }

    async loadData() {
      const user = await getPush()
      if (user.Code != 1) {
        apiNotification.alert(user, {}, this.props)
        return
      }
      if (user.Data.UserData.ID == 0) {
        apiNotification.alert({ Message: "未登录" }, {}, this.props)
        return
      }
      const myStore = await getStoreDataById(user.Data.UserData.I)
      await this.loadMore(1)
      this.setState({
        user: user.Data.UserData,
        myStore: myStore,
      })

      if (window.innerHeight / this.rowHeight > this.state.PageSize) {
        await this.loadMore()
      }
    }

    close() {
      this.setState({
        showStoreDetail: false,
        showSearch: false,
        showUpLoad: false,
        showPayment: false,
        showOrderDetail: false,
        showStoreQA: false,
        showMyOrder: false,
        showStoreNotice: false,
      })
    }

    show(prop) {
      this.close()
      this.setState({
        [prop]: true,
      })
    }

    async myStoreReload() {
      let myStore = await getStoreDataById(this.state.user.ID)
      this.setState({ myStore: myStore })
    }

    async loadMore(pageIndex) {
      if (pageIndex) {
        this.setState({ pageIndex: pageIndex })
      } else {
        pageIndex = this.state.pageIndex + 1
        this.setState({ pageIndex: pageIndex })
      }

      const res = await getShopStore(0, pageIndex, this.state.PageSize)

      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }

      let storeArea = Object.assign([], this.state.storeArea)

      this.setState({ storeArea: storeArea.concat(res.Data), pageEnd: res.Count < this.state.PageSize ? true : false })
    }
    async onInfiniteScroll(done) {
      await this.loadMore()
      setTimeout(() => {
        done()
      }, 500)
    }

    onBack() {
      this.setState({
        showMyOrder: false,
        showStoreQA: false,
        showStoreDetail: false,
        showSearch: false,
        showOrderDetail: false,
        showPayment: false,
        showUpLoad: false,
      })
    }

    paymentCancel(id) {
      this.setState({ apiLoading: true })
      notificationAsync
        .confirm("是否撤销订单", { title: "撤销订单", class: "storeOrderCancel" })
        .then(() => {
          this.setState({ apiLoading: true })
          getCancelOrderById(id).then((res) => {
            this.setState({ apiLoading: false })
            if (res.Code != 1) {
              apiNotification.alert(res, {}, this.props)
              return
            }

            notificationAsync.alert(res.Message, { title: "成功" }).then((res) => {
              this.props.router.back()
              return
            })
          })
        })
        .finally(() => {
          this.setState({ apiLoading: false })
        })
    }

    async openStoreModal(store) {
      const res = await getShopStore(store.ID, 1, 10)
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      this.setState({ storeDetail: store })
      this.show("showStoreDetail")
    }

    myOrderConfig = {
      tabs: [
        {
          name: "我的订单",
          listApi: "Shop/GetOrders",
          listApiMethod: "get",
          renderRow: (row, data) => {
            let status = ""
            switch (row.Status) {
              case 0:
                status = "交易中"
                break
              case 1:
                status = "申请客服介入"
                break
              case 2:
                status = "交易取消"
                break
              case 3:
                status = "交易完成"
                break
            }
            return (
              <div className="order-record-item" onClick={() => this.orderDetail(row.ID)}>
                <p className="tl">订单: {row.ID}</p>
                <p className="tl">日期: {util.date.format(util.date.toDate(row.AddTime), "YYYY-MM-DD hh:mm:ss")}</p>
                <p className="dd">
                  <span>
                    状态：<b style={{ color: "green" }}>{status}</b>
                  </span>
                  <span className="point-balance">
                    价格：<b style={{ color: "#c30202" }}>{row.Amount}</b>
                  </span>
                  <span style={{ width: "100%" }}>付款信息：{row.PayInfo && row.PayInfo}</span>
                  <span style={{ width: "100%" }}>
                    付款时间：{row.PayTime && util.date.format(util.date.toDate(row.PayTime), "YYYY-MM-DD hh:mm:ss")}
                  </span>
                  <span style={{ width: "100%" }}>买家ID：{row.UID}</span>
                  <span style={{ width: "100%" }}>交易类型：{this.state.user.ID == row.UID ? "买入" : "卖出"}</span>
                  {row.Status == 0 && this.state.user.ID == row.UID && !row.PayTime && (
                    <Button
                      class="payment-btn order-btn"
                      onClick={(event) => {
                        this.payment(row)
                        event.stopPropagation()
                      }}
                    >
                      去付款
                    </Button>
                  )}
                  {row.Status == 0 && this.state.user.ID == row.UID && (
                    <Button
                      class="payment-btn cancel-btn"
                      onClick={(event) => {
                        this.paymentCancel(row.ID)
                        event.stopPropagation()
                      }}
                    >
                      取消订单
                    </Button>
                  )}
                  {row.Status == 0 && this.state.user.ID != row.UID && row.PayTime && (
                    <Button
                      class="conform-receive-btn order-btn"
                      onClick={(event) => {
                        this.conformPay(event.currentTarget, row.ID)
                        event.stopPropagation()
                      }}
                    >
                      确认收款
                    </Button>
                  )}
                </p>
              </div>
            )
          },
        },
      ],
    }

    async payment(row) {
      let bankCardRes = await getBank()
      if (bankCardRes.Code != 1) {
        notificationAsync.alert(bankCardRes.Message, { title: "操作提示" })
        return
      }
      if (bankCardRes.Data.length == 0) {
        notificationAsync.confirm("请先设置银行卡", { title: "操作提示", buttonLabels: ["返回", "确定"] }).then(() => {
          this.props.router.isLoginToOrRedirect("/site/setBankCard")
          return
        })
      } else {
        this.props.router.push(this.props.route.pathname, { orderID: row.ID })
        this.show("showPayment")
      }
    }

    orderDetail(orderID) {
      this.setState({ orderDetailID: orderID })
      this.show("showOrderDetail")
    }

    async conformPay(event, id) {
      let store = this.state.myStore.Data

      if (!store.PayPass) {
        notificationAsync.prompt("输入4位数支付密码", { title: "请设置支付密码" }).then((pass) => {
          this.setState({ apiLoading: true })
          setPayPass(pass).then((res) => {
            this.setState({ apiLoading: false })
            if (res.Code != 1) {
              notificationAsync.alert(res.Message, { title: "操作提示" })
              return
            }
            notificationAsync.alert(res.Message, { title: "成功" })
            this.myStoreReload()
          })
        })
      } else {
        notificationAsync.prompt("请输入4位数支付密码", { title: "确认收款" }).then((pass) => {
          this.setState({ apiLoading: true })
          setShopConfirm(id, pass).then((res) => {
            this.setState({ apiLoading: false })
            if (res.Code != 1) {
              notificationAsync.alert(res.Message, { title: "操作提示" })
              return
            }
            notificationAsync.alert(res.Message, { title: "成功" })
            event.classList.add("none")
            this.myStoreReload()
          })
        })
      }
    }

    openStore() {
      this.setState({ apiLoading: true })
      getBank().then((res) => {
        this.setState({ apiLoading: false })
        if (res.Code != 1) {
          notificationAsync.alert(res.Message, { title: "操作提示" })
          return
        }
        if (res.Data.length == 0) {
          notificationAsync.alert("请先设置银行卡", { title: "操作提示" }).then((res) => {
            this.props.router.isLoginToOrRedirect("/site/setBankCard")
            return
          })
          return
        }

        notificationAsync
          .confirm("<div>店铺首次开张则默认售卖以下商品：<br/>默认商品100 15件<br/>默认商品200 10件<br/>默认商品500 3件</div>", {
            title: "开店提示",
            buttonLabels: ["取消", "确认开通店铺"],
          })
          .then(() => {
            this.setState({ apiLoading: true })
            getBank().then((res) => {
              this.setState({ apiLoading: false })
              if (res.Code != 1) {
                notificationAsync.alert(res.Message, { title: "操作提示" })
                return
              }
              if (res.Data.length == 0) {
                notificationAsync.alert("请先设置银行卡", { title: "操作提示" }).then((res) => {
                  this.props.router.isLoginToOrRedirect("/site/setBankCard")
                  return
                })
              }
              getOpenStore().then((res) => {
                this.setState({ apiLoading: false })
                if (res.Code != 1) {
                  notificationAsync.alert(res.Message, { title: "操作提示" })
                  return
                }
                notificationAsync.alert(res.Message, { title: "成功" })
                this.myStoreReload()
              })
            })
          })
      })
    }

    setNoticeData = (flag) => {
      this.setState({ noticeData: flag })
    }

    render() {
      return (
        <LayoutPage
          className="store-home"
          center="货币店铺"
          loading={this.state.loading}
          onInfiniteScroll={this.onInfiniteScroll.bind(this)}
          right={<Button onClick={() => this.show("showSearch")}>搜寻商品</Button>}
        >
          <div className="menuBox">
            <div className="menu">
              <span style={{ color: "#d32626" }}>
                <Icon icon="ion-social-usd" />
              </span>
              <p>余额({(this.state.user && this.state.user.Money) || 0})</p>
            </div>
            <div
              className="menu"
              onClick={() => {
                this.show("showMyOrder")
              }}
            >
              <span style={{ color: "#3797a4" }}>
                <Icon icon="ion-document-text" />
              </span>
              <p>我的订单</p>
            </div>
            <div
              className="menu"
              onClick={() => {
                if (this.state.myStore.Code == 1) {
                  this.openStoreModal(this.state.myStore.Data)
                } else {
                  this.openStore()
                }
              }}
            >
              <span style={{ color: "#6a097d" }}>
                <Icon icon="ion-ribbon-b" />
              </span>
              <p>{this.state.myStore && this.state.myStore.Code == 1 ? "我的店铺" : "申请开店"}</p>
            </div>
            <div
              className="menu"
              onClick={() => {
                this.show("showStoreQA")
              }}
            >
              <span style={{ color: "#fc8210" }}>
                <Icon icon="ion-speakerphone" />
              </span>
              <p>商店说明</p>
            </div>
          </div>
          <div className="store-area">
            {this.state.storeArea &&
              this.state.storeArea.map((item, index) => {
                if (item.Closed) {
                  return
                }
                if (item.ID != 219233) {
                  return (
                    <div
                      key={"shapAreaItem" + index}
                      className="store-area-item"
                      onClick={() => {
                        this.openStoreModal(item)
                      }}
                    >
                      <div className="avatar">
                        <AvatarImg avatarLink={item.Avatar} UID={item.ID} width={50} height={50} />
                        {/*<img src={item.Avatar} alt=""/>*/}
                      </div>
                      <div className="name">
                        <p>店主 : {item.NickName}</p>
                        <p>ID : {item.ID}</p>
                        <p>
                          <span>店铺等级: {item.Grade.Name} </span> <span>成交单数 : {item.SumOrder}</span>
                        </p>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div
                      key={"shapAreaItem" + index}
                      className="store-area-item"
                      onClick={() => {
                        this.openStoreModal(item)
                      }}
                    >
                      <div className="avatar">
                        <span className="storeAvatar"></span>
                      </div>
                      <div className="name">
                        <p>店主 : {item.NickName}</p>
                        <p>
                          <span>自营店存款加赠2%</span> <span>成交单数 : {item.SumOrder}</span>
                        </p>
                      </div>
                    </div>
                  )
                }
              })}
          </div>

          {/* 我的订单记录 */}
          <ModalPage
            className="record-model my-order-modal"
            isOpen={!!this.state.showMyOrder}
            animation="lift"
            onClose={() => {
              this.setState({
                showMyOrder: false,
              })
            }}
          >
            {this.state.showMyOrder && <RecordPage config={this.myOrderConfig} center="我的订单" />}
          </ModalPage>

          {/* 商城公告QA */}
          <ModalPage
            isOpen={!!this.state.showStoreQA}
            animation="lift"
            onClose={() => {
              this.setState({
                showStoreQA: false,
              })
            }}
          >
            {this.state.showStoreQA && <QA />}
          </ModalPage>

          {/*店长公告*/}
          <ModalPage
            isOpen={!!this.state.showStoreNotice}
            animation="lift"
            onClose={() => {
              this.setState({
                showStoreNotice: false,
              })
            }}
          >
            {this.state.showStoreNotice && <Notice noticeData={this.state.noticeData} />}
          </ModalPage>

          {/* 店铺详情 */}
          <ModalPage
            isOpen={!!this.state.showStoreDetail}
            animation="lift"
            className="gift-record-modal"
            onClose={() => {
              this.setState({
                showStoreDetail: false,
              })
            }}
          >
            {this.state.showStoreDetail && (
              <MyStore
                setNoticeData={(flag) => this.setNoticeData(flag)}
                user={this.state.user}
                type="shopArea"
                storeDetail={this.state.storeDetail}
                storeID={this.state.storeDetail.ID}
                title={this.state.user.ID == this.state.storeDetail.ID ? "我的店铺" : "店铺详情"}
                noData="image"
                show={(prod) => this.show(prod)}
              />
            )}
          </ModalPage>

          {/* 搜寻商品 */}
          <ModalPage
            isOpen={!!this.state.showSearch}
            animation="lift"
            className="gift-record-modal"
            onClose={() => {
              this.setState({
                showSearch: false,
              })
            }}
          >
            {this.state.showSearch && (
              <SearchRecord
                user={this.state.user}
                type="shopArea"
                storeDetail={this.state.storeDetail}
                title={"搜寻商品"}
                noData="image"
                show={(prop) => this.show(prop)}
              />
            )}
          </ModalPage>

          {/* 上传商品 */}
          <ModalPage
            isOpen={!!this.state.showUpLoad}
            animation="lift"
            className="gift-record-modal"
            onClose={() => {
              this.setState({
                showUpLoad: false,
              })
            }}
          >
            {this.state.showUpLoad && <StoreUpLoad user={this.state.user} type="shopArea" title={"上传商品"} />}
          </ModalPage>

          {/*/!* 付款确认 *!/*/}
          <ModalPage
            isOpen={!!this.state.showPayment}
            animation="lift"
            onClose={() => {
              this.setState({
                showPayment: false,
              })
            }}
          >
            {this.state.showPayment && <Payment />}
          </ModalPage>

          {/*/!* 付款确认 *!/*/}
          <ModalPage
            isOpen={!!this.state.showOrderDetail}
            animation="lift"
            onClose={() => {
              this.setState({
                showOrderDetail: false,
              })
            }}
          >
            {this.state.showOrderDetail && <OrderDetail orderID={this.state.orderDetailID} />}
          </ModalPage>
        </LayoutPage>
      )
    }
  }
)
