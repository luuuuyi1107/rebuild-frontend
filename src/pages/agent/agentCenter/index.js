import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"

import "./style.scss"
import { Icon } from "react-onsenui"
import ClipboardJS from "clipboard"
import util from "@/magic/util"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        agent: null,
        loading: true,
      }
    }
    componentDidMount() {
      this.listenClipboard()
      this.loadData()
    }

    loadData() {
      action.post("Pyramid/MyRecommender").then((res) => {
        if (res.Code != 1) {
          this.setState({ loading: false })
          apiNotification.alert(res, {}, this.props)
          return
        }
        this.setState({ agent: res.Data, loading: false })
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

    listenClipboard() {}

    closeIncome(money) {
      action.post("Pyramid/Settlement").then((res) => {
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        }
        notificationAsync.alert("结算 ￥" + money + "元", { title: "成功", buttonLabels: ["确定"], cancelable: true })

        action.post("Pyramid/MyRecommender").then((Pres) => {
          this.setState({ agent: Pres.Data })
        })
      })
    }

    render() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login")
        return null
      }
      return (
        <LayoutPage loading={this.state.loading} className="site-agent-center" center="代理中心">
          {this.state.agent && (
            <div className="agentInfo">
              <div className="info">
                <div className="top">
                  <div className="item recommend">
                    <span className="label">我的推荐人:</span>&nbsp;<span>{this.state.agent.NickName}</span>
                  </div>
                  <div className=" item my">
                    <span className="inline label">推广ID:&nbsp;{util.cache.get("user").ID}</span>
                    <span
                      className="inline money copy-btn"
                      onClick={this.onCopy.bind(
                        this,
                        `https://${location.host}/web/#/site/login?mode=register&referrer=${util.cache.get("user").ID}`
                      )}
                    >
                      复制推广链接
                    </span>
                    {/*<span className="inline money"><b>{this.state.agent.Devote}</b>元</span>*/}
                  </div>
                </div>
                <div className="bottom">
                  <div className=" item data">
                    <span className="inline label">我的贡献</span>
                    <span className="inline money">
                      <b>{this.state.agent.Devote}</b>
                    </span>
                  </div>
                  <div className=" item data" onClick={() => this.closeIncome(this.state.agent.Money)}>
                    <span className="inline label">未结收益</span>
                    <span className="inline money">
                      <b>{this.state.agent.Money}</b>
                    </span>
                  </div>
                  <div
                    className=" item data"
                    onClick={() => {
                      this.props.router.push("/agent/agentIncome")
                    }}
                  >
                    <span className="inline label">已结收益</span>
                    <span className="inline money">
                      <b>{this.state.agent.Closed}</b>
                    </span>
                  </div>
                </div>
                {/*<div className=" recommend-btn">*/}
                {/*    <div className="inline">*/}
                {/*        <span className="label">推广ID:&nbsp;</span>*/}
                {/*        <span>{util.cache.get("user").ID}</span>*/}
                {/*    </div>*/}
                {/*    <div className="inline money copy-btn" onClick={this.onCopy.bind(this, `https://${location.host}/web/site/login?mode=register&referrer=${util.cache.get("user").ID}`)} >复制推广链接</div>*/}
                {/*</div>*/}
              </div>
            </div>
          )}

          <div className="content">
            {this.state.agent && (
              <div
                className="peopleNumber"
                onClick={() => {
                  this.props.router.push("/agent/downLine")
                }}
              >
                <div className=" item data">
                  <span className="inline label">推荐注册</span>
                  <span className="inline money">
                    <b>{this.state.agent.RegNum}</b>
                  </span>
                </div>
                <div className=" item data">
                  <span className="inline label">达标人数</span>
                  <span className="inline money">
                    <b>{this.state.agent.VipNum}</b>
                  </span>
                </div>
                <div className=" item data">
                  <span className="inline label">充值人数</span>
                  <span className="inline money">
                    <b>{this.state.agent.RecNum}</b>
                  </span>
                </div>
                <div className=" item data">
                  <span className="inline label">下注人数</span>
                  <span className="inline money">
                    <b>{this.state.agent.BetNum}</b>
                  </span>
                </div>
              </div>
            )}

            <div className="title">代理功能</div>
            <div className="btn-group">
              <div
                className=" item"
                onClick={() => {
                  this.props.router.push("/agent/downLine")
                }}
              >
                <div className="icon" style={{ color: "#f132a5" }}>
                  <Icon icon="ion-person-add" />
                </div>
                <div className="inline">我的下线</div>
              </div>
              <div
                className=" item"
                onClick={() => {
                  this.props.router.push("/agent/agentIncome")
                }}
              >
                <div className="icon" style={{ color: "#8ed317" }}>
                  <Icon icon="ion-ios-list" />
                </div>
                <div className="inline">收益记录</div>
              </div>
            </div>

            {this.state.agent && (
              <div className="infoBox">
                <div className="infoList">
                  <div className="infoItem">
                    <span className="text">推荐充值</span>
                    <span className="number">{this.state.agent.RecMoney}</span>
                  </div>
                  <div className="infoItem">
                    <span className="text">提款总额</span>
                    <span className="number">{this.state.agent.WrawMoney}</span>
                  </div>
                  <div className="infoItem">
                    <span className="text">实际盈亏</span>
                    <span className={this.state.agent.WrawMoney - this.state.agent > 0 ? "number red" : "number green"}>
                      {(this.state.agent.WrawMoney - this.state.agent.RecMoney).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="infoList">
                  <div className="infoItem">
                    <span className="text">彩票打码</span>
                    <span className="number">{this.state.agent.LotteryBet}</span>
                  </div>
                  <div className="infoItem">
                    <span className="text">彩票派奖</span>
                    <span className="number">{this.state.agent.LotteryWin}</span>
                  </div>
                  <div className="infoItem">
                    <span className="text">彩票盈亏</span>
                    <span className={this.state.agent.LotteryWin - this.state.agent.LotteryBet > 0 ? "number red" : "number green"}>
                      {(this.state.agent.LotteryWin - this.state.agent.LotteryBet).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="infoList">
                  <div className="infoItem">
                    <span className="text">棋牌下注</span>
                    <span className="number">{this.state.agent.PokerBet}</span>
                  </div>
                  <div className="infoItem">
                    <span className="text">棋牌派奖</span>
                    <span className="number">{this.state.agent.PokerWin}</span>
                  </div>
                  <div className="infoItem">
                    <span className="text">棋牌盈亏</span>
                    <span className={this.state.agent.PokerWin - this.state.agent.PokerBet > 0 ? "number red" : "number green"}>
                      {(this.state.agent.PokerWin - this.state.agent.PokerBet).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="infoList">
                  <div className="infoItem">
                    <span className="text">对战打码</span>
                    <span className="number">{this.state.agent.PVPBet}</span>
                  </div>
                  <div className="infoItem">
                    <span className="text">对战派奖</span>
                    <span className="number">{this.state.agent.PVPWin}</span>
                  </div>
                  <div className="infoItem">
                    <span className="text">对战盈亏</span>
                    <span className={this.state.agent.PVPWin - this.state.agent.PVPBet > 0 ? "number red" : "number green"}>
                      {(this.state.agent.PVPWin - this.state.agent.PVPBet).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </LayoutPage>
      )
    }
  }
)
