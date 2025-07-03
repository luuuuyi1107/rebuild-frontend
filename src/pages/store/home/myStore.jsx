import React from "react"
import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import { Button, Icon } from "react-onsenui"
import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import StoreNotice from "@/components/StoreNotice"
import util from "@/magic/util"
import AvatarImg from "@/components/AvatarImg"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
        list: [],
        PageIndex: 1,
        PageSize: 99,
        storeClose: props.storeDetail.Closed,
        storeDetail: props.storeDetail,
        storeSet: false,
        storeSort: "start",
        bankCard: null,
      }
    }
    componentDidMount() {
      this.loadData()
    }

    async loadData() {
      await this.loadMore(1)
      this.loadServiceLink()
      let bankCardRes = await action.post("User/GetBank")
      this.setState({ bankCard: bankCardRes.Data[0], loading: false })
      if (window.innerHeight / this.rowHeight > this.state.PageSize) {
        await this.loadMore()
      }
    }

    async loadServiceLink() {
      let serviceLink = util.cache.get("serviceLink")
      if (!serviceLink) {
        let res = await getPush({ keys: ["servicelink"] })

        serviceLink = res.Data.ServiceLink
      }
      this.setState({ serviceLink: serviceLink })
    }

    async loadMore(pageIndex) {
      if (pageIndex) {
        this.setState({ pageIndex: pageIndex })
      } else {
        pageIndex = this.state.pageIndex + 1
        this.setState({ pageIndex: pageIndex })
      }

      let res = await action.post("Shop/GetStoreShops", { id: this.props.storeDetail.ID, PageIndex: pageIndex, PageSize: this.state.PageSize })

      let storeSet = await getPush({ keys: "storeset" })

      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      let list = Object.assign([], this.state.list)
      list = list.concat(res.Data)

      // let listSort = list.sort(function(a, b){return a.Amount - b.Amount;});
      if (this.state.storeSort == "small") {
        list = list.sort(function (a, b) {
          return a.Amount - b.Amount
        })
        // listSort = list.sort(function(a, b){return b.Amount - a.Amount;});
      } else if (this.state.storeSort == "big") {
        list = list.sort(function (a, b) {
          return b.Amount - a.Amount
        })
      }

      this.setState({ list: list, pageEnd: res.Count < this.state.PageSize ? true : false, storeSet: storeSet.Data.StoreSet })
    }
    async onInfiniteScroll(done) {
      await this.loadMore()
      setTimeout(() => {
        done()
      }, 500)
    }

    sortType(list, storeSort) {
      let listSort = list || this.state.list

      if (storeSort == "start") {
        let listSort = listSort.sort(function (a, b) {
          return parseInt(b.AddTime.substr(6)) - parseInt(a.AddTime.substr(6))
        })
      } else if (storeSort == "small") {
        listSort = listSort.sort(function (a, b) {
          return a.Amount - b.Amount
        })
      } else if (storeSort == "big") {
        listSort = listSort.sort(function (a, b) {
          return b.Amount - a.Amount
        })
      }

      this.setState({ list: listSort, storeSort: storeSort })
    }

    buyStore(item) {
      if (this.props.user.ID == this.props.storeDetail.ID) {
        notificationAsync.alert("无法购买自己的商品", {
          title: "无法购买",
        })
      } else {
        let text = "<span class='orderInfo'>商品价格: " + item.Amount + "元<br/>订购数量: 1件</span>"

        text +=
          "<span class='orderTip'><br/>※ 禁止【修改金额】入款<br/>※ 禁止【重复入款】重复入款无法退回<br/>※ 禁止【超时付款】请在10分钟内转账完成，超时损失自行承担<br/>※ 充值成功后请提供截图，我们这边为您确认入款哦，谢谢配合！</span>"
        // if(this.props.storeDetail.ID==219233){
        //     text += "<span class='orderTip'><br/>※ 禁止【修改金额】入款<br/>※ 禁止【重复入款】重复入款无法退回<br/>※ 禁止【超时付款】请在15分钟内转账完成，超时损失自行承担<br/>※ 充值成功后请提供截图，我们这边为您确认入款哦，谢谢配合！</span>"
        // }
        notificationAsync.confirm(text, { title: "下单", class: "storeOrder", buttonLabels: ["取消", "确认下单"] }).then(() => {
          action.post("Shop/Order", { id: item.ID }, (res) => {
            this.setState({ apiLoading: false })
            if (res.Code != 1) {
              notificationAsync.alert(res.Message, { title: "操作提示", buttonLabels: ["确定"] }).then(() => {
                if (res.Code == -5) {
                  this.props.show("showMyOrder")
                }
              })
              return
            }
            notificationAsync.alert(res.Message, { title: "成功", buttonLabels: ["确定"] }).then(async () => {
              this.props.router.push(this.props.route.pathname, { orderID: res.Data.OrderID })
              this.props.show("showPayment")
            })
          })
        })
      }
    }

    async openCloseStore() {
      let res = await action.post("Shop/OpenShop", {})
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      apiNotification.alert(res, {}, this.props)
      this.setState({ storeClose: !this.state.storeClose })
    }

    async clearIncome() {
      let res = await action.post("Shop/Settlement", { id: this.props.storeDetail.ID })
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      apiNotification.alert(res, {}, this.props)
      let storeDetail = await action.post("Shop/GetStoreData", { id: this.props.storeDetail.ID })

      this.setState({
        storeDetail: storeDetail.Data,
      })
      // this.setState({storeClose:!this.state.storeClose})
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
                        <p className="p1">商品金额：{item.Amount} 元</p>
                        <p>商品库存：{item.Count} 件</p>
                      </div>
                      <div className="buyBtn">
                        <Button
                          onClick={() => {
                            util.trialCheck()
                            this.buyStore(item)
                          }}
                        >
                          购买
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
          right={this.props.user.ID == this.props.storeDetail.ID ? <Button onClick={() => this.props.show("showUpLoad")}>上传商品</Button> : null}
        >
          <div>
            <div className="store-top" key="storeAvatar">
              {this.props.storeDetail.ID == 219233 ? (
                <span className="storeAvatar"></span>
              ) : (
                <AvatarImg avatarLink={this.props.storeDetail.Avatar} UID={this.props.storeDetail.ID} width={50} height={50} />
              )}
              {/*<AvatarImg avatarLink={this.props.storeDetail.Avatar} UID={this.props.storeDetail.ID} width={50} height={50}/>*/}
              {/*<img src={this.props.storeDetail.Avatar} alt=""/>*/}
              {/*<span className="storeAvatar"></span>*/}
              <div className="middle">
                <p>
                  <span>{this.props.storeDetail.NickName} 的店铺</span>
                </p>
                {this.props.user.ID == this.props.storeDetail.ID && this.state.storeSet.Grade && (
                  <p>
                    <span>店铺收益结算:￥{this.state.storeDetail.SetMoney}</span>
                  </p>
                )}
                {this.props.storeDetail.ID == 219233 && (
                  <p>
                    <span>
                      <a
                        onClick={() => {
                          const prev = this.state.serviceLink.startsWith("http") ? "" : "/"
                          util.open(prev + this.state.serviceLink, "_self")
                        }}
                        target="_self"
                      >
                        付款成功后，请联系我为您充值。
                        <Icon icon="ion-ios-chatboxes-outline" style={{ fontSize: ".4rem" }} />
                      </a>
                    </span>
                  </p>
                )}
              </div>
              {this.props.user.ID == this.props.storeDetail.ID && (
                <div className="right">
                  <Button
                    class="openStoreBtn"
                    onClick={() => {
                      this.openCloseStore()
                    }}
                  >
                    {this.state.storeClose ? "营业" : "打烊"}
                  </Button>
                  {this.state.storeSet.Grade && (
                    <Button
                      class="openStoreBtn"
                      onClick={() => {
                        this.clearIncome()
                      }}
                    >
                      结算
                    </Button>
                  )}
                </div>
              )}
            </div>
            {this.props.user.ID == this.props.storeDetail.ID && (
              <StoreNotice setNoticeData={(flag) => this.props.setNoticeData(flag)} noticeData={this.props.noticeData} />
            )}
            <div className="storeSort">
              <span>排序： </span>
              {this.state.storeSort == "start" ? (
                <span
                  className="priceSort"
                  onClick={() => {
                    this.sortType(this.state.list, "small")
                  }}
                >
                  价格{" "}
                </span>
              ) : this.state.storeSort == "big" ? (
                <span
                  className="priceSort on"
                  onClick={() => {
                    this.sortType(this.state.list, "small")
                  }}
                >
                  价格 <Icon icon="ion-ios-arrow-thin-up" />
                </span>
              ) : (
                <span
                  className="priceSort on"
                  onClick={() => {
                    this.sortType(this.state.list, "big")
                  }}
                >
                  价格 <Icon icon="ion-ios-arrow-thin-down" />
                </span>
              )}
            </div>
            <div className="marquee">
              <span>自营店自助撤销订单功能已开启，请各位老板注意撤销订单【禁止】再进行汇款，否则损失将自行承担~</span>
            </div>
            {this.renderList()}
          </div>
        </LayoutPage>
      )
    }
  }
)
