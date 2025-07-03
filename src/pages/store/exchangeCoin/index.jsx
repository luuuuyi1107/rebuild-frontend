import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import * as action from "@/action"

import "./style.scss"
import { Button, Icon } from "react-onsenui"
import RecordPage from "@/components/RecordPage"
import * as apiNotification from "@/magic/ApiNotification"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        money: null,
        apiLoading: false,
        loading: true,
        storeLink: null,
        showExchangeRecord: false,
        showIconExchange: false,
        coinStoreToken: false,
        coinStoreAllowUID: [],
      }
    }
    componentDidMount() {
      this.loadData()
    }

    close() {
      this.setState({
        showExchangeRecord: false,
        showIconExchange: false,
      })
    }

    show(prop) {
      this.setState({
        [prop]: true,
      })
    }

    async loadData() {
      this.setState({ loading: false })
      let res = await getPush({ keys: ["payset", "userset"] })
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }

      let coinStoreToken = res.Data.PaySet.Token
      let coinStoreAllowUID = null
      if (res.Data.PaySet.AllowUID) {
        coinStoreAllowUID = res.Data.PaySet.AllowUID.split(",")
      }

      if (!coinStoreToken) {
        notificationAsync.alert("您尚未开通此功能，如需开通请联系客服！").then(() => {
          this.props.router.push("/site/home")
        })
        return
      }
      if (coinStoreAllowUID) {
        let allow = false
        coinStoreAllowUID.map((AllowUID) => {
          if (AllowUID == res.Data.UserData.ID) {
            allow = true
          }
        })
        if (!allow) {
          notificationAsync.alert("您尚未开通此功能，如需开通请联系客服！").then(() => {
            this.props.router.push("/site/home")
          })
          return
        }
      }

      this.setState({ coinStoreToken: coinStoreToken, coinStoreAllowUID: coinStoreAllowUID })
    }

    async openStorePlatform() {
      let storeLink = await action.post("Pay/LoginTokens")

      if (storeLink.Code != 1) {
        apiNotification.alert(storeLink, {}, this.props)
        return
      }

      util.open(
        storeLink.Data.URL +
          "?cid=" +
          storeLink.Data.MemberAuthorization +
          "&backUrl=" +
          window.location.href.replace("store/exchangeCoi", "site/home"),
        "_self"
      )
    }

    changeIcon() {
      this.setState({ apiLoading: true })
      action.post(
        "Pay/TokenConvert",
        {
          money: this.state.money,
          type: 1,
        },
        (res) => {
          this.setState({ apiLoading: false })
          if (res.Code == 1) {
            notificationAsync.alert(res.Message, { title: "成功" })
          } else {
            notificationAsync.alert(res.Message, { title: "操作提示" })
          }
        }
      )
    }

    creditChangeRecordConfig = {
      tabs: [
        {
          name: "兑换记录",
          listApi: "Pay/TokensLogs",
          listApiMethod: "get",
          renderRow: (row, data) => {
            return (
              <div className="month-record-item">
                <p className="tl">兑换ID: {row.OrderID}</p>
                <p className="dd">
                  <span className="point-balance">
                    兑换彩金：<b style={{ color: "#c30202" }}>{row.Money}</b>
                  </span>
                  <span>
                    日期：<b>{util.date.format(util.date.toDate(row.Time), "YYYY-MM-DD hh:mm:ss")}</b>
                  </span>
                  {/*<span style={{width: "100%"}}>说明：{row.Content}</span>*/}
                </p>
              </div>
            )
          },
        },
      ],
    }

    render() {
      return (
        <LayoutPage
          className="icon-exchange"
          center="代币商城"
          right={<Button onClick={() => this.show("showExchangeRecord")}>兑换记录</Button>}
          loading={this.state.loading}
          apiLoading={this.state.apiLoading}
        >
          <div className="content">
            {/*<div className="title">代币平台入口</div>*/}
            {/*<div className="btn-group">*/}
            {/*<div className=" item" onClick={()=>{this.openStorePlatform()}}>*/}
            {/*<div className="icon" style={{color: "#ff3914"}}><Icon icon="ion-android-playstore"/></div>*/}
            {/*<div className="inline">代币平台</div>*/}
            {/*</div>*/}
            {/*</div>*/}
            <div
              className="storeLink"
              onClick={() => {
                this.openStorePlatform()
              }}
            ></div>
            {/*<div className="storeLink"><Icon icon="ion-ios-pricetags"/><a href={this.state.storeLink}>代币平台</a></div>*/}
            <div className="title">彩金兑换</div>
            <div className="iconTop">
              <span className="left">
                <Icon icon="ion-help-buoy" /> 代币金额
              </span>
              <span className="center">
                <Icon icon="ion-arrow-right-c" />
              </span>
              <span className="right">
                <Icon icon="ion-social-usd" /> 站点彩金
              </span>
            </div>
            <div className="moneyInput">
              <InputBox
                placeholder="请输入代币金额"
                type="number"
                name="phone"
                onChange={(value) => {
                  this.setState({ money: value })
                }}
                value={this.state.money}
              />
            </div>
            <div className="submit">
              <Button
                onClick={() => {
                  this.changeIcon()
                }}
              >
                兑换
              </Button>
            </div>
          </div>
          {/* 积分兑换记录 */}
          <ModalPage
            className="record-model exchange-record-modal"
            isOpen={!!this.state.showExchangeRecord}
            animation="lift"
            onClose={() => {
              this.setState({ showExchangeRecord: false })
            }}
          >
            {this.state.showExchangeRecord && <RecordPage config={this.creditChangeRecordConfig} center="彩金兑换记录" />}
          </ModalPage>
          {/* 积分兑换记录 */}
          {/*<Modal className="record-model exchange-record-modal" isOpen={!!this.state.showIconExchange} animation="lift">*/}
          {/*{this.state.showIconExchange&&<LayoutPage className="icon-exchange" center="彩金兑换" right={null}>*/}
          {/*<div className="content">*/}
          {/*<div className="iconTop">*/}
          {/*<span className="left"><Icon icon="ion-help-buoy"/> 代币金额</span>*/}
          {/*<span className="center"><Icon icon="ion-arrow-right-c"/></span>*/}
          {/*<span className="right"><Icon icon="ion-social-usd"/> 站点彩金</span>*/}
          {/*</div>*/}
          {/*<div className="moneyInput">*/}
          {/*<InputBox placeholder="请输入代币金额" type="number" name="phone" onChange={ value => {this.setState({money: value})}} value={this.state.money}/>*/}
          {/*</div>*/}
          {/*<div className="submit">*/}
          {/*<Button onClick={()=>{this.changeIcon()}}>兑换</Button>*/}
          {/*</div>*/}
          {/*</div>*/}
          {/*</LayoutPage>}*/}
          {/*</Modal>*/}
        </LayoutPage>
      )
    }
  }
)
