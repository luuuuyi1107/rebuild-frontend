import React from "react"
import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import { Button } from "react-onsenui"
import util from "@/magic/util"
import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import ClipboardJS from "clipboard"
import config from "@/config/config"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
        apiLoading: false,
        OrderDetail: null,
        user: null,
      }
    }

    componentDidMount() {
      this.loadData().then(() => {
        this.loadServiceLink()
        this.setState({ loading: false })
      })
    }

    async loadServiceLink() {
      let serviceLink = util.cache.get("serviceLink")
      if (!serviceLink) {
        let res = await getPush({ keys: ["servicelink"] })
        serviceLink = res.Data.ServiceLink
      }
      this.setState({ serviceLink: serviceLink })
    }

    async loadData() {
      let user = await getPush()

      let OrderDetail = await action.post("Shop/GetOrderData", { id: this.props.orderID })
      if (OrderDetail.Code != 1) {
        apiNotification.alert(OrderDetail, {}, this.props)
        return
      }

      this.setState({ user: user.Data.UserData, OrderDetail: OrderDetail.Data })
    }

    onCopy(text) {
      return new Promise((resolve, reject) => {
        let fakeElement = document.createElement("button")

        let clipboard = new ClipboardJS(fakeElement, {
          text: function () {
            return text
          },
          action: function () {
            return "copy"
          },
          container: typeof container === "object" ? container : document.body,
        })
        clipboard.on("success", function (e) {
          clipboard.destroy()

          notificationAsync.alert("已成功复制到剪贴板", {
            title: "复制成功",
          })
          resolve(e)
        })
        clipboard.on("error", function (e) {
          clipboard.destroy()
          //alert(JSON.stringify(e));
          notificationAsync.alert({
            title: "浏览器不支持，请手动复制",
            messageHTML: `<div class="manual-copy-input-wrap"><input value="${text}" οnfοcus="this.select()"/></div>`,
          })
          reject(e)
        })
        document.body.appendChild(fakeElement)
        fakeElement.click()
        document.body.removeChild(fakeElement)
      })
    }

    paymentCancel(id) {
      this.setState({ apiLoading: true })
      notificationAsync
        .confirm("是否撤销订单", { title: "撤销订单", class: "storeOrderCancel" })
        .then(() => {
          this.setState({ apiLoading: true })
          action.post(
            "Shop/CancelOrder",
            {
              id: id,
            },
            (res) => {
              this.setState({ apiLoading: false })
              if (res.Code != 1) {
                apiNotification.alert(res, {}, this.props)
                return
              }

              notificationAsync.alert(res.Message, { title: "成功" }).then(() => {
                this.props.router.back()
                return
              })
            }
          )
        })
        .finally(() => {
          this.setState({ apiLoading: false })
        })
    }

    render() {
      let OrderDetail = this.state.OrderDetail

      let status = ""
      if (OrderDetail) {
        switch (OrderDetail.Status) {
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
      }

      return (
        <LayoutPage className="store-item-record" title={"订单详情"} right={null} loading={this.state.loading} apiLoading={this.state.apiLoading}>
          {OrderDetail && (
            <div className="commodityInfo">
              <div className="mailInfo">
                <div className="item name order-detail-item">
                  <div className="inline">卖家姓名 : </div>
                  <span>{OrderDetail.Bank.Name}</span>
                  <span className="copy-btn" onClick={this.onCopy.bind(this, OrderDetail.Bank.Name)}>
                    复制
                  </span>
                </div>
                <div className="item name order-detail-item">
                  <div className="inline">卖家银行账号 : </div>
                  <span>{OrderDetail.Bank.Account}</span>
                  <span className="copy-btn" onClick={this.onCopy.bind(this, OrderDetail.Bank.Account)}>
                    复制
                  </span>
                </div>
                <div className="item name order-detail-item">
                  <div className="inline">卖家银行 : </div>
                  <span>{OrderDetail.Bank.Bank}</span>
                  <span className="copy-btn" onClick={this.onCopy.bind(this, OrderDetail.Bank.City)}>
                    复制
                  </span>
                </div>
                <div className="item name order-detail-item">
                  <div className="inline">商品金额 : </div>
                  <span>{OrderDetail.Amount}</span>
                  <span className="copy-btn" onClick={this.onCopy.bind(this, OrderDetail.Amount)}>
                    复制
                  </span>
                </div>
                <div className="item name order-detail-item">
                  <div className="inline">订单ID : </div>
                  <span>{OrderDetail.ID}</span>
                </div>
                <div className="item name order-detail-item">
                  <div className="inline">买家ID : </div>
                  <span>{OrderDetail.BuyUID}</span>
                </div>
                <div className="item name order-detail-item">
                  <div className="inline">订单操作信息 : </div>
                  <span>{OrderDetail.MsgLog}</span>
                </div>
                <div className="item name order-detail-item">
                  <div className="inline">买家付款信息 : </div>
                  <span>{OrderDetail.PayInfo}</span>
                </div>
                <div className="item name order-detail-item">
                  <div className="inline">付款日期 : </div>
                  <span>{OrderDetail.PayTime && util.date.format(util.date.toDate(OrderDetail.PayTime), "YYYY-MM-DD hh:mm:ss")}</span>
                </div>
                <div className="item name order-detail-item">
                  <div className="inline">订单状态 : </div>
                  <span>{status}</span>
                </div>
              </div>
              {OrderDetail.SellUID == 219233 ? (
                <div className="clickBtn">
                  <Button
                    onClick={() => {
                      const serviceLink = config.serviceLink || this.state.serviceLink
                      const prev = serviceLink.startsWith("http") ? "" : "/"
                      util.open(prev + serviceLink, "_self")
                    }}
                  >
                    联系客服
                  </Button>
                  {(OrderDetail.Status == 0 || OrderDetail.Status == 1) && (
                    <Button
                      class="payment-btn cancel-btn"
                      onClick={() => {
                        this.paymentCancel(OrderDetail.ID)
                      }}
                    >
                      取消订单
                    </Button>
                  )}
                </div>
              ) : (
                <div className="clickBtn">
                  <Button
                    onClick={() => {
                      if (this.state.user.ID == OrderDetail.BuyUID) {
                        this.props.router.isLoginToOrRedirect(`/interaction/friendChat`, { id: OrderDetail.SellUID, name: OrderDetail.SellNick })
                      } else {
                        this.props.router.isLoginToOrRedirect(`/interaction/friendChat`, { id: OrderDetail.BuyUID, name: OrderDetail.BuyNick })
                      }
                    }}
                  >
                    {this.state.user.ID == OrderDetail.BuyUID ? "联系卖家" : "联系买家"}
                  </Button>
                  {(OrderDetail.Status == 0 || OrderDetail.Status == 1) && (
                    <Button
                      class="payment-btn cancel-btn"
                      onClick={() => {
                        this.paymentCancel(OrderDetail.ID)
                      }}
                    >
                      取消订单
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </LayoutPage>
      )
    }
  }
)
