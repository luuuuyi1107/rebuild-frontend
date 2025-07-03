import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import * as action from "@/action"

import "./style.scss"
import DetailRecord from "./detailRecord"
import QA from "./qa"
import Buy from "./buy"
import Bus from "@/magic/EventBus"
import { Icon } from "react-onsenui"
import RecordPage from "@/components/RecordPage"
import HomeNavigatorBar from "@/components/HomeNavigatorBar"
import ClipboardJS from "clipboard"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"
import { get } from "lodash"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        user: null,
        topImgLink: null,
        shopArea: [],
        creditChange: [],
        showDetailRecord: false,
        showCreditChange: false,
        showShopQA: false,
        showShopArea: false,
        showBuy: false,
        areaId: null,
        areaImgLink: null,
        commodity: null,
        shopName: null,
        apiLoading: false,
      }
    }
    componentDidMount() {
      this.loadData()
    }

    async loadData() {
      let user = await getPush({ keys: "shopset" })
      if (user.Code != 1) {
        apiNotification.alert(user, {}, this.props)
        return
      }
      if (user.Data.UserData.ID == 0) {
        apiNotification.alert({ Message: "未登录" }, {}, this.props)
        return
      }

      if (!user.Data.ShopSet.Status) {
        this.props.router.push("/site/home")
      }

      // let topImgLink = await action.post("Config/Shop");
      let shopArea = await action.post("Shop/GetClass")
      let creditChange = await action.post("Shop/GetList", { id: 0, PageIndex: 1, PageSize: 20 })
      this.setState({
        user: user.Data.UserData,
        topImgLink: user.Data.ShopSet.Logos,
        shopArea: shopArea.Data || [],
        creditChange: creditChange.Data,
      })

      window.copy = (element) => {
        let text = element.getAttribute("data")
        this.onCopy(text)
      }

      Bus.on("getPush.trigger", (data) => {
        this.setState({ user: { ...this.state.user, Credit: get(data, "UserData.Credit", 0) } })
      })
    }

    async onUpdateUserData() {
      let user = await getPush({ keys: "shopset" })
      if (user.Code != 1) return
      this.setState({
        user: user.Data.UserData,
      })
    }

    close() {
      this.setState({
        showBuy: false,
        showShopArea: false,
        showShopQA: false,
        showExchange: false,
        showCreditChange: false,
      })
    }

    show(prop) {
      this.setState({
        [prop]: true,
      })
    }

    onCopy(text) {
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
      })
      clipboard.on("error", function (e) {
        clipboard.destroy()
        //alert(JSON.stringify(e));
        notificationAsync.alert({
          title: "浏览器不支持，请手动复制",
          messageHTML: `<div class="manual-copy-input-wrap"><input value="${text}" οnfοcus="this.select()"/></div>`,
        })
      })
      document.body.appendChild(fakeElement)
      fakeElement.click()
      document.body.removeChild(fakeElement)
    }

    onBack() {
      this.setState({ showExchange: false, showCreditChange: false, showShopQA: false, showShopArea: false, showBuy: false })
    }

    openAreaModal(id, logoLink, name) {
      if (name == "新专场") {
        notificationAsync.alert("即将开放，敬请期待!")
        return
      }
      this.setState({ areaId: id, areaImgLink: logoLink[1], shopName: name })
      this.show("showShopArea")
    }

    openCommodity(commodity) {
      this.setState({ commodity: commodity })
    }

    creditChangeRecordConfig = {
      tabs: [
        {
          name: "积分兑换记录",
          listApi: "Shop/GetLogs",
          listApiMethod: "get",
          renderRow: (row, data) => {
            return (
              <div className="month-record-item">
                <p className="tl">日期: {util.date.format(util.date.toDate(row.AddTime), "YYYY-MM-DD hh:mm:ss")}</p>
                <p className="dd">
                  <span>
                    积分变动：<b style={{ color: "green" }}>{row.Credit}</b>
                  </span>
                  <span className="point-balance">
                    积分余额：<b style={{ color: "#c30202" }}>{row.Consume}</b>
                  </span>
                  <span style={{ width: "100%" }}>说明：{row.Content}</span>
                </p>
              </div>
            )
          },
        },
      ],
    }

    exchangeRecordConfig = {
      tabs: [
        {
          name: "礼品记录",
          filter: [{ key: "Status", type: "hidden", defaultValue: 0 }],
          listApi: "Shop/GetOrderList",
          listApiMethod: "get",
          renderRow: (row, data) => {
            return (
              <div className="recordItem" key={"exchange2" + row.ID}>
                <div className="item date">日期：{util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}</div>
                <div className="item name">名称：{row.ShopName}</div>
                <div className="item num">订单：{row.ID}</div>
                <div className="item price">价格：{row.Price}</div>
                {row.Mailing && (
                  <div className="item receive-msg">
                    <label>收件信息：</label>
                    <p>{row.Mailing}</p>
                  </div>
                )}
                {row.Logistics && (
                  <div className="item logistics-msg">
                    <label>物流信息：</label>
                    <p dangerouslySetInnerHTML={{ __html: util.formatUbb(row.Logistics) }}></p>
                  </div>
                )}
                <div className="item state" id={"exchangeStatus" + row.ID}>
                  状态：
                  {row.Status == 0 && <span style={{ color: "#c30202" }}>申请中</span>}
                  {row.Status == 1 && <span style={{ color: "green" }}>已兑换</span>}
                  {row.Status == 2 && <span>已确认</span>}
                </div>
                {row.Status == 1 && (
                  <div
                    className="clickBtn"
                    onClick={(e) => {
                      this.conform(e.currentTarget, row.ID)
                    }}
                  >
                    确认收货
                  </div>
                )}
              </div>
            )
          },
        },
      ],
    }

    async conform(event, id) {
      this.setState({ apiLoading: true })
      await action.post("Shop/ConfirmOrder", { id: id }, (res) => {
        this.setState({ apiLoading: false })
        if (res.Code != 1) {
          notificationAsync.alert(res.Message, { title: "操作提示" })
          return
        }
        event.classList.add("none")
        document.getElementById("exchangeStatus" + id).innerHTML = "状态：已确认"
        notificationAsync.alert(res.Message, { title: "成功" })
      })
    }

    componentWillUnmount() {
      Bus.off("getPush.trigger")
    }

    render() {
      return (
        <LayoutPage className="shop-home" center="商城" renderFixed={() => <HomeNavigatorBar active="shop" />}>
          <div className="shop-top-img">{this.state.topImgLink && <img src={this.state.topImgLink} alt="" />}</div>
          <div className="bg-theme text-white p-[0.13rem] pr-[0.26rem] rounded-r-full inline-flex leading-none text-14px items-center mb-1">
            <svg class="-translate-y-[1px] mr-[0.05rem]" width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12.2973 14.9296C12.1734 14.9301 12.0511 14.9015 11.9408 14.8463L7.98837 12.8237L4.03592 14.8463C3.90758 14.9122 3.76288 14.9417 3.61826 14.9313C3.47365 14.9209 3.33493 14.871 3.21787 14.7873C3.10081 14.7037 3.0101 14.5896 2.95607 14.4581C2.90203 14.3266 2.88683 14.1828 2.91219 14.0433L3.68718 9.77837L0.494223 6.74823C0.394604 6.65105 0.323935 6.5292 0.289802 6.39574C0.255668 6.26228 0.259358 6.12226 0.300475 5.99069C0.345394 5.85606 0.42802 5.73643 0.538978 5.64538C0.649937 5.55432 0.784784 5.4955 0.928217 5.47557L5.34566 4.84681L7.29088 0.960658C7.35434 0.832581 7.45342 0.724567 7.57678 0.648989C7.70014 0.57341 7.84278 0.533325 7.98837 0.533325C8.13396 0.533325 8.2766 0.57341 8.39996 0.648989C8.52332 0.724567 8.6224 0.832581 8.68586 0.960658L10.6543 4.83924L15.0718 5.46799C15.2152 5.48792 15.3501 5.54675 15.461 5.6378C15.572 5.72885 15.6546 5.84848 15.6995 5.98312C15.7406 6.11468 15.7443 6.25471 15.7102 6.38817C15.6761 6.52163 15.6054 6.64348 15.5058 6.74065L12.3128 9.77079L13.0878 14.0357C13.1155 14.1777 13.101 14.3245 13.0461 14.4588C12.9911 14.593 12.898 14.7091 12.7778 14.7933C12.6375 14.8894 12.4685 14.9373 12.2973 14.9296Z"
                fill="#FFD035"
              />
            </svg>
            <span className="leading-none">当前积分: {(this.state.user && this.state.user.Credit) || 0}</span>
          </div>
          <div className="menuBox">
            <div
              className="menu"
              onClick={() => {
                this.show("showCreditChange")
              }}
            >
              <span style={{ color: "#3797a4" }}>
                <Icon icon="ion-document-text" />
              </span>
              <p>积分记录</p>
            </div>
            <div
              className="menu"
              onClick={() => {
                this.props.router.isLoginToOrRedirect("/thirdGame/report")
              }}
            >
              <span style={{ color: "#d32626" }}>
                <Icon icon="ion-heart" />
              </span>
              <p>增加积分</p>
            </div>
            <div
              className="menu"
              onClick={() => {
                this.show("showExchange")
              }}
            >
              <span style={{ color: "#6a097d" }}>
                <Icon icon="ion-ribbon-b" />
              </span>
              <p>礼品记录</p>
            </div>
            <div
              className="menu"
              onClick={() => {
                this.show("showShopQA")
              }}
            >
              <span style={{ color: "#fc8210" }}>
                <Icon icon="ion-speakerphone" />
              </span>
              <p>商城公告</p>
            </div>
          </div>
          <div className="shop-area">
            {this.state.shopArea &&
              this.state.shopArea.map((item, index) => {
                let link = item.Logo && item.Logo.split("|")
                return (
                  <div
                    key={"shapAreaItem" + index}
                    className="shop-area-item"
                    onClick={() => {
                      this.openAreaModal(item.ID, link, item.Name)
                    }}
                  >
                    <div className="img">
                      <img src={link[0] || link[1]} alt="" />
                    </div>
                    <div className="name">
                      <span>{item.Name}</span>
                    </div>
                  </div>
                )
              })}
          </div>
          <div className="shop-credit-area">
            <div className="title">
              <span>
                <Icon icon="ion-heart" />
              </span>
              猜你喜欢
              <span>
                <Icon icon="ion-heart" />
              </span>
            </div>
            <div className="credit-list">
              {this.state.creditChange &&
                this.state.creditChange.map((item, index) => {
                  let link = (item.Logo && item.Logo.split("|")) || []
                  return (
                    <div
                      key={"creditItem" + index}
                      className="credit-item"
                      onClick={() => {
                        util.trialCheck()
                        this.openCommodity(item)
                        this.props.router.replace(this.props.route.pathname, { areaID: 0, index })
                        this.show("showBuy")
                      }}
                    >
                      <div className="credit-item-inner">
                        <div className="img">
                          <img src={link[0] || link[1]} alt="" />
                        </div>
                        <div className="info">
                          <p className="p1">{item.Title}</p>
                          <p className="p2">
                            积分：<b style={{ color: "#c30202" }}>{item.Price}</b>
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* 积分兑换记录 */}
          <ModalPage
            className="record-model exchange-record-modal"
            isOpen={!!this.state.showCreditChange}
            animation="lift"
            onClose={() => {
              this.setState({ showCreditChange: false })
            }}
          >
            {this.state.showCreditChange && <RecordPage config={this.creditChangeRecordConfig} center="积分兑换记录" />}
          </ModalPage>

          {/* 礼品兑换记录 */}
          <ModalPage
            className="record-model gift-record-modal align_left"
            isOpen={!!this.state.showExchange}
            animation="lift"
            onClose={() => {
              this.setState({ showExchange: false })
            }}
          >
            {this.state.showExchange && <RecordPage apiLoading={this.state.apiLoading} config={this.exchangeRecordConfig} center="礼品记录" />}
          </ModalPage>

          {/* 商城公告QA */}
          <ModalPage
            isOpen={!!this.state.showShopQA}
            animation="lift"
            onClose={() => {
              this.setState({ showShopQA: false })
            }}
          >
            {this.state.showShopQA && <QA />}
          </ModalPage>

          {/* 礼品专区列表 */}
          <ModalPage
            isOpen={!!this.state.showShopArea}
            animation="lift"
            className="gift-record-modal"
            onClose={() => {
              this.setState({ showShopArea: false })
            }}
          >
            {this.state.showShopArea && (
              <DetailRecord
                type="shopArea"
                areaId={this.state.areaId}
                topImg={this.state.areaImgLink}
                name={this.state.shopName}
                title={this.state.shopName}
                noData="image"
                show={(prop) => this.show(prop)}
              />
            )}
          </ModalPage>

          {/* 礼品兑换 */}
          <ModalPage
            isOpen={!!this.state.showBuy}
            animation="lift"
            onClose={() => {
              this.setState({ showBuy: false })
            }}
          >
            {this.state.showBuy && (
              <Buy
                commodity={this.state.commodity}
                userCredit={this.state.user.Credit}
                onUpdate={() => {
                  this.onUpdateUserData()
                }}
              />
            )}
          </ModalPage>
        </LayoutPage>
      )
    }
  }
)
