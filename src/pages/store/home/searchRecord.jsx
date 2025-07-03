import React from "react"
import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import { Button } from "react-onsenui"
import "./style.scss"
import InputBox from "@/components/InputBox"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"
import util from "@/magic/util"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
        list: [],
        PageIndex: 1,
        PageSize: 20,
        amount: null,
        // storeClose:props.storeDetail.Closed
      }
    }
    componentDidMount() {
      // await this.loadMore(1);
      this.setState({ loading: false })
      if (window.innerHeight / this.rowHeight > this.state.PageSize) {
        this.loadMore()
      }
    }
    async loadMore(pageIndex) {
      if (pageIndex) {
        this.setState({ pageIndex: pageIndex, list: [] })
      } else {
        pageIndex = this.state.pageIndex + 1
        this.setState({ pageIndex: pageIndex })
      }

      let res = await action.post("Shop/Search", { amount: this.state.amount, PageIndex: pageIndex, PageSize: this.state.PageSize })

      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      let list = Object.assign([], this.state.list)
      this.setState({ list: list.concat(res.Data), pageEnd: res.Count < this.state.PageSize ? true : false })
    }
    async onInfiniteScroll(done) {
      await this.loadMore()
      setTimeout(() => {
        done()
      }, 500)
    }

    buyStore(item) {
      if (this.props.user.ID == item.UID) {
        notificationAsync.alert("无法购买自己的商品", {
          title: "无法购买",
        })
      } else {
        let text = "<span class='orderInfo'>商品价格: " + item.Amount + "元<br/>订购数量: 1件</span>"
        if (item.UID == 219233) {
          text +=
            "<span class='orderTip'><br/>※ 禁止【小数点】入款<br/>※ 禁止【修改金额】入款<br/>※ 禁止【重复入款】重复入款无法退回<br/>※ 禁止【超时付款】请在15分钟内转账完成，超时损失自行承担<br/>※ 充值成功后请提供截图，我们这边为您确认入款哦，谢谢配合！</span>"
        }
        notificationAsync.confirm(text, { title: "下单", class: "storeOrder", buttonLabels: ["取消", "确认下单"] }).then(() => {
          action.post("Shop/Order", { id: item.ID }, (res) => {
            this.setState({ apiLoading: false })
            if (res.Code != 1) {
              notificationAsync.alert(res.Message, { title: "操作提示" })
              return
            }
            notificationAsync.alert(res.Message, { title: "成功" }).then(async () => {
              this.props.router.push(this.props.route.pathname, { orderID: res.Data.OrderID })
              this.props.show("showPayment")
            })
          })
        })
      }
    }

    renderList() {
      if (this.state.list.length > 0) {
        let ret = []
        let commodityNumber = 0
        ret.push(
          <div className="store-credit-area" key="shop-list">
            <div className="credit-list">
              {this.state.list.map((item, index) => {
                if (item.Count == 0) {
                  return
                }
                commodityNumber++
                return (
                  <div className="credit-item" key={"shopArea2" + index}>
                    <div className="credit-item-inner">
                      <div className="info">
                        <p className="p1">商品金额：{item.Amount}元</p>
                        <p>商品库存：{item.Count}件</p>
                      </div>
                      <div className="buyBtn">
                        <Button
                          onClick={() => {
                            util.trialCheck()
                            this.buyStore(item)
                          }}
                        >
                          立即购买
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

        if (commodityNumber == 0) {
          ret.push(<div style={{ textAlign: "center" }}>目前没有商品</div>)
        }

        return ret
      }
      return (
        <div className="no-data">
          {this.props.noData == "image" ? <div className="no-data-img"></div> : <div>{this.props.noData || "尚无明细"}</div>}
        </div>
      )
    }

    render() {
      return (
        <LayoutPage
          className={"store-area-modal " + this.props.type}
          title={this.props.title}
          onBack={this.props.onBack}
          loading={this.state.loading}
          onInfiniteScroll={this.onInfiniteScroll.bind(this)}
          right={null}
        >
          <div>
            <div className="store-top" key="storeAvatar">
              <InputBox
                placeholder="请输入商品金额"
                type="number"
                name="amount"
                onChange={(value) => {
                  this.setState({ amount: value })
                }}
                value={this.state.amount}
              />
              <Button
                class="searchBtn"
                onClick={() => {
                  this.loadMore(1)
                }}
              >
                确认
              </Button>
              {/*<input  placeholder="请输入提现金额" autoComplete="withdraw-amount" autoCapitalize="off" autoCorrect="off" name="amount" type="tel" onChange={ e => {this.setState({amount: e.target.value.replace(/[^\d]/g,'')})}} value={this.state.amount}/>*/}
            </div>
            {this.renderList()}
          </div>
        </LayoutPage>
      )
    }
  }
)
