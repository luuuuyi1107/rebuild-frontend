import React from "react"

import HomeNavigatorBar from "@/components/HomeNavigatorBar"
import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"

import * as action from "@/action"
import { getBank, getPush, userLogout } from "@/action/apis"
import AvatarImg from "@/components/AvatarImg"
import CustomIcon from "@/components/CustomIcon"
import InfoManager from "@/components/InfoManager"
import * as apiNotification from "@/magic/ApiNotification"
import Bus from "@/magic/EventBus"
import { withRouter } from "@/magic/withRouter"
import { Button, Col, Icon, Row } from "react-onsenui"
import AvatarModal from "./AvatarModal"
import "./style.scss"
import { notificationAsync } from "@/magic/notification"

@withRouter
export default class Page extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      bankCard: null,
      user: util.cache.get("user"),
      bankCardLoading: true,
      userSet: {},
      coinStoreToken: false,
      coinStoreAllowUID: [],
    }
  }

  componentDidMount() {
    if (!util.isLogin()) {
      setTimeout(() => {
        this.props.router.push("/site/login")
      }, 0)
      return
    }
    this.loadData()
  }

  async loadData() {
    const bankCardRes = await getBank() // 取得银行卡资料
    if (bankCardRes.Code != 1) {
      apiNotification.alert("银行卡错误", {}, this.props)
      return
    }

    const user = await getPush({ keys: ["userset", "payset"] }) // 取得个人资料
    if (user.Code != 1) {
      apiNotification.alert(user, {}, this.props)
      return
    }
    if (user.Data.UserData.ID == 0) {
      apiNotification.alert({ Message: "未登录" }, {}, this.props)
      return
    }

    const coinStoreAllowUID = !!user.Data.PaySet.AllowUID ? user.Data.PaySet.AllowUID.split(",") : null

    this.setState({
      bankCard: bankCardRes.Data[0],
      bankCardLoading: false,
      user: user.Data.UserData,
      userSet: user.Data.UserSet,
      coinStoreToken: user.Data.PaySet.Token,
      coinStoreAllowUID,
    })
  }

  cardNameDeal(name) {
    const splitItem = ["(", "[", "{", "（", "【"]
    splitItem.map((item) => {
      const nameFlash = name.split(item)
      if (nameFlash.length > 1) {
        name = nameFlash[0]
      }
    })
    return name
  }

  render() {
    const { user, bankCard, userSet } = this.state
    return (
      <LayoutPage className="site-my" center={"个人中心"} right={null} renderFixed={() => <HomeNavigatorBar active="my" />}>
        {this.state.user && (
          <div className="userInfo">
            <div className="top">
              <div className="redpacket-cuts">
                <div className="flex items-center">
                  <img className="w-[28px] mr-0.5" src={util.buildAssetsPath("images/my/present.png")} />
                  优惠中心 尽享优惠
                </div>
                <div
                  className="redpacket-btn ml-auto"
                  onClick={() => {
                    util.trialCheck()
                    this.props.router.isLoginToOrRedirect("/interaction/rewardsCenter")
                  }}
                >
                  领取优惠
                  <Icon className="ml-0.5 text-[15px]" icon="ion-ios-arrow-right" />
                </div>

                {/* <div
                  className="coupon-btn ml-1"
                  onClick={() => {
                    util.trialCheck()
                    this.props.router.isLoginToOrRedirect("/interaction/coupon")
                  }}
                >
                  优惠码兑换
                  <Icon className="ml-0.5 text-[15px]" icon="ion-ios-arrow-right" />
                </div> */}
              </div>
              <div className="flex justify-center mb-0.75">
                <div className="relative" style={{ height: 50, width: 50 }} onClick={() => Bus.emit("show.avatarModal")}>
                  <AvatarImg avatarLink={this.state.user.Avatar.FilePath} UID={user.ID} width={50} height={50} />
                  <i className="ion-edit text-0.75 rounded-full bg-[#00000066] absolute right-0 -bottom-[3px] w-1 h-1 flex justify-center items-center" />
                </div>
              </div>
              <p className="userName">
                {user.NickName && user.NickName !== "undefined" ? <span>{`${user.NickName} [ ID:${user.ID} ]`}</span> : <span>ID:{user.ID}</span>}
              </p>
              <p className="balance">
                <span>
                  余额:&nbsp;<b>{user.Money.toFixed(2)}元</b>
                </span>
              </p>
            </div>
            <div className="total">
              <span>存款总额：{user.UserType === 1 ? 0 : user.RecTotal}元</span>
              <span>提款总额：{user.UserType === 1 ? 0 : user.ApplyTotal}元</span>
            </div>
            <div className="time">
              {user.AddTime && <span>注册时间:&nbsp;{util.date.format(util.date.toDate(user.AddTime), "yyyy-MM-dd")}</span>}
              {user.UpTime && <span>上次登录:&nbsp;{util.date.format(util.date.toDate(user.UpTime), "MM-dd hh:mm")}</span>}
            </div>
          </div>
        )}
        <div className="bankCard">
          {!this.state.bankCardLoading && bankCard && (
            <div className="bank-item bankCardInfo">
              <div className="info bankName">
                <CustomIcon style={{ height: 16, width: 16 }} type={require("./icons/bank.svg")} />
                {this.state.bankCard.Bank}
                {userSet.AllowEditBank && (
                  <Button className="edit-bank-btn" onClick={() => this.props.router.isLoginToOrRedirect("/site/setBankCard")}>
                    修改银行卡
                  </Button>
                )}
              </div>
              <div className="info cardNum">{this.state.bankCard.Account}</div>
              <div className="info infoGroup">
                <div className="name">
                  <span>开户姓名：</span>
                  {this.cardNameDeal(this.state.bankCard.Name)}
                </div>
                <div className="address">
                  <span>开户地址：</span>
                  {this.state.bankCard.City}
                </div>
              </div>
            </div>
          )}
          {!this.state.bankCardLoading && !bankCard && (
            <div
              className="bank-item addBankCard"
              onClick={() => {
                util.trialCheck()
                this.props.router.isLoginToOrRedirect("/site/setBankCard")
              }}
            >
              <p>
                <span>
                  <Icon icon="ion-information-circled" />
                </span>
                &nbsp;您未绑定银行卡，<span>点击前往绑定</span>
              </p>
            </div>
          )}
          {this.state.bankCardLoading && (
            <div className="bank-item addBankCard">
              <p>
                <span style={{ marginRight: "5px" }}>
                  <Icon icon="ion-information-circled" />
                </span>
                正在检测银行卡...
              </p>
            </div>
          )}
        </div>
        <div className="memberContent">
          <Row>
            <Col
              width="25%"
              className="item"
              onClick={() => {
                util.trialCheck()
                this.props.router.isLoginToOrRedirect("/thirdGame/wallet")
              }}
            >
              <div className="listIcon" style={{ color: "#f49818" }}>
                <Icon icon="ion-social-usd" />
              </div>
              <p>我的钱包</p>
            </Col>
            <Col
              width="25%"
              className="item"
              onClick={() => {
                this.props.router.isLoginToOrRedirect("/site/balance")
              }}
            >
              <div className="listIcon" style={{ color: "#2093e9" }}>
                <Icon icon="ion-clipboard" />
              </div>
              <p>余额明细</p>
            </Col>
            <Col
              width="25%"
              className="item"
              onClick={() => {
                util.trialCheck()
                this.props.router.isLoginToOrRedirect("/site/depositCenter")
              }}
            >
              <div className="listIcon" style={{ color: "#f35517" }}>
                <Icon icon="ion-android-exit" />
              </div>
              <p>在线充值</p>
            </Col>
            <Col
              width="25%"
              className="item"
              onClick={() => {
                util.trialCheck()

                if (!this.state.bankCard) {
                  notificationAsync.alert("请先设置银行卡", { title: "操作提示" }).then(() => {
                    this.props.router.isLoginToOrRedirect("/site/setBankCard")
                  })
                } else {
                  this.props.router.isLoginToOrRedirect("/site/withdraw")
                }
              }}
            >
              <div className="listIcon" style={{ color: "#56c30b" }}>
                <Icon icon="ion-android-checkbox-outline" />
              </div>
              <p>在线提款</p>
            </Col>
            <Col
              width="25%"
              className="item"
              onClick={() => {
                this.props.router.isLoginToOrRedirect("/thirdGame/report")
              }}
            >
              <div className="listIcon" style={{ color: "#cd49da" }}>
                <Icon icon="ion-pie-graph" />
              </div>
              <p>打码明细</p>
            </Col>
            <Col
              width="25%"
              className="item"
              onClick={() => {
                this.props.router.isLoginToOrRedirect("/site/gameNav")
              }}
            >
              <div className="listIcon" style={{ color: "#8ed317" }}>
                <Icon icon="ion-ios-list" />
              </div>
              <p>下注记录</p>
            </Col>

            <Col
              width="25%"
              className="item"
              onClick={() => {
                this.props.router.isLoginToOrRedirect("/lottery/nav", { to: "drawHistory" })
              }}
            >
              <div className="listIcon" style={{ color: "#ff3914" }}>
                <Icon icon="ion-arrow-graph-up-right" />
              </div>
              <p>开奖记录</p>
            </Col>
            <Col
              width="25%"
              className="item"
              onClick={() => {
                util.trialCheck()
                this.props.router.isLoginToOrRedirect("/site/depositWithdrawRecord")
              }}
            >
              <div className="listIcon" style={{ color: "#14d3c8" }}>
                <Icon icon="ion-stats-bars" />
              </div>
              <p>充值/提现记录</p>
            </Col>
            <Col
              width="25%"
              className="item"
              onClick={() => {
                util.trialCheck()
                this.props.router.isLoginToOrRedirect(`/site/securityCenter`)
              }}
            >
              <div className="listIcon" style={{ color: "#2093e9" }}>
                <CustomIcon style={{ height: 22, width: 22, transform: "translateY(5px)" }} type={require("./icons/shield.svg")} />
              </div>
              <p>安全中心</p>
            </Col>
            {/* <ion-icon name="shield-half-outline"></ion-icon> */}

            <Col
              width="25%"
              className="item"
              onClick={() => {
                util.trialCheck()
                this.props.router.isLoginToOrRedirect("/site/mySet")
              }}
            >
              <div className="listIcon" style={{ color: "#f3cd16" }}>
                <Icon icon="ion-email" />
              </div>
              <p>信息设置</p>
            </Col>

            <Col
              width="25%"
              className="item"
              onClick={() => {
                util.trialCheck()
                this.props.router.isLoginToOrRedirect("/agent/agentCenter")
              }}
            >
              <div className="listIcon" style={{ color: "#f132a5" }}>
                <Icon icon="ion-person-add" />
              </div>
              <p>代理中心</p>
            </Col>

            <Col
              width="25%"
              className="item"
              onClick={() => {
                action.apiHandler(() => userLogout()).then(() => this.props.router.push("/site/login"))
              }}
            >
              <div className="listIcon" style={{ color: "#5C79D8" }}>
                <CustomIcon style={{ height: 22, width: 22, transform: "translateY(5px)" }} type={require("./icons/power.svg")} />
              </div>
              <p>安全退出</p>
            </Col>
          </Row>
        </div>
        <InfoManager />
        <AvatarModal id={this.state.user.Avatar.ID} afterSubmit={this.loadData.bind(this)} />
      </LayoutPage>
    )
  }
}
