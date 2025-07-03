import React from "react"
import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import { Button } from "react-onsenui"
import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import ClipboardJS from "clipboard"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
        apiLoading: false,
        bankCard: [],
        paymentData: null,
      }
    }

    componentDidMount() {
      this.loadData().then(() => {
        this.setState({ loading: false })
      })
    }

    async loadData() {
      let bankCardRes = await action.post("User/GetBank")
      if (bankCardRes.Code != 1) {
        notificationAsync.alert(bankCardRes.Message, { title: "操作提示" })
        return
      }
      if (bankCardRes.Data.length == 0) {
        notificationAsync
          .confirm("请先设置银行卡", { title: "操作提示", buttonLabels: ["返回", "确定"] })
          .then((index) => {
            this.props.router.isLoginToOrRedirect("/site/setBankCard")
          })
          .catch(() => {
            this.props.router.back()
          })
      }

      let paymentData = await action.post("Shop/GetOrderData", { id: this.props.route.query.orderID })
      if (paymentData.Code != 1) {
        apiNotification.alert(paymentData, {}, this.props)
        return
      }

      this.setState({ bankCard: bankCardRes.Data, paymentData: paymentData.Data })
    }

    cardNameDeal(name) {
      let splitItem = ["(", "[", "{", "（", "【"]

      splitItem.map((item) => {
        let nameFlash = name.split(item)
        if (nameFlash.length > 1) {
          name = nameFlash[0]
        }
      })

      return name
    }

    paymentConform(bankCard, paymentData) {
      if (!bankCard.Name || !bankCard.Bank || !bankCard.Account) {
        notificationAsync.alert(res.Message, { title: "失败" })
        return
      }
      this.setState({ apiLoading: true })
      action.post(
        "Shop/Payment",
        {
          id: paymentData.ID,
          name: this.cardNameDeal(bankCard.Name),
          bank: bankCard.Bank,
          account: bankCard.Account,
        },
        (res) => {
          this.setState({ apiLoading: false })
          if (res.Code != 1) {
            apiNotification.alert(res, {}, this.props)
            return
          }

          notificationAsync.alert(res.Message, { title: "成功" }).then((res) => {
            this.props.router.back()
            return
          })
        }
      )
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

    render() {
      let bankCard = this.state.bankCard
      let paymentData = this.state.paymentData

      return (
        <LayoutPage className="store-item-record" title={"确认付款"} right={null} loading={this.state.loading} apiLoading={this.state.apiLoading}>
          {bankCard.length > 0 && paymentData && (
            <div className="commodityInfo">
              {/*<div className="pic">*/}
              {/*<img src={commodity.Logo} alt=""/>*/}
              {/*</div>*/}
              <div className="mailInfo">
                <div className="item name">
                  <div className="inline">收款姓名 : </div>
                  <span>{paymentData.Bank.Name}</span>
                  <span className="copy-btn" onClick={this.onCopy.bind(this, paymentData.Bank.Name)}>
                    复制
                  </span>
                </div>
                <div className="item name">
                  <div className="inline">银行卡号 : </div>
                  <span>{paymentData.Bank.Account}</span>
                  <span className="copy-btn" onClick={this.onCopy.bind(this, paymentData.Bank.Account)}>
                    复制
                  </span>
                </div>
                <div className="item name">
                  <div className="inline">开户银行 : </div>
                  <span>{paymentData.Bank.Bank}</span>
                  <span className="copy-btn" onClick={this.onCopy.bind(this, paymentData.Bank.Bank)}>
                    复制
                  </span>
                </div>
                <div className="item name">
                  <div className="inline">付款金额 : </div>
                  <span>{paymentData.Amount}</span>
                  <span className="copy-btn" onClick={this.onCopy.bind(this, paymentData.Amount)}>
                    复制
                  </span>
                </div>
                <div className="item name">
                  <div className="inline">订单ID : </div>
                  <span>{paymentData.ID}</span>
                </div>
                <div className="item name">
                  <div className="inline">会员ID : </div>
                  <span>{paymentData.BuyUID}</span>
                </div>
                <div className="item name">
                  <div className="inline">汇款人姓名 : </div>
                  <span>{this.cardNameDeal(bankCard[0].Name)}</span>
                </div>
              </div>
              <div className="clickBtn">
                <Button
                  onClick={() => {
                    this.paymentConform(bankCard[0], paymentData)
                  }}
                >
                  已付款，提交订单
                </Button>
              </div>
              <div className="clickBtn cancel">
                <Button
                  onClick={() => {
                    this.paymentCancel(paymentData.ID)
                  }}
                >
                  取消订单
                </Button>
              </div>
            </div>
          )}
        </LayoutPage>
      )
    }
  }
)
