import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import util from "@/magic/util"
import * as action from "@/action"

import "./style.scss"
import { Button, Icon, Switch } from "react-onsenui"
import GameNavigatorBar from "@/components/GameNavigatorBar"
import * as apiNotification from "@/magic/ApiNotification"
import platforms from "@/config/platforms"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import _ from "lodash"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.platformId = util.getUrlParam("platform")

      this.platforms = Object.keys(platforms).reduce((sum, key) => {
        let item = _.cloneDeep(platforms[key])
        if (item.altTitle) item.title = item.altTitle
        sum[key] = item

        if (item.games && item.games.some((game) => game.params?.lotteryId && game.params?.lotteryId !== item.lotteryId)) {
          item.games
            .filter((game) => game.params?.lotteryId && game.params?.lotteryId !== item.lotteryId) // 子游戏有lotteryId的才显示
            .forEach((game, idx) => {
              const _platform = _.cloneDeep(item)
              _platform.title = game.name
              Object.values(_platform).forEach((param) => {
                _.has(param, "params.lotteryId") && (param.params.lotteryId = game.params.lotteryId)
              })
              sum[key + "_" + game.params.lotteryId] = _platform
            })
        }

        return sum
      }, {})

      let platform = this.platforms[this.platformId] || platforms["ag"]

      if (util.getUrlParam("params")) {
        const lotterId = JSON.parse(util.getUrlParam("params")).lotteryId
        if (lotterId) {
          const key = this.platformId + "_" + lotterId
          this.platforms[key] && (platform = this.platforms[key])
        }
      }

      this.state = {
        platform,
        user: {},
        balance: 0,
        money: "",
        transferType: 0,
        apiLoading: true,
        platformOpen: false,
      }
    }

    componentDidMount() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login")
        return null
      }
      this.reflesh()
    }

    async reflesh() {
      // this.setState({apiLoading: true});
      let platform = this.state.platform
      let userRes = await getPush()

      let res = await action[platform.balanceApi.method](platform.balanceApi.url, platform.balanceApi.params || {})
      if (res.Code != 1) {
        apiNotification.alert(res, { title: "获取平台余额错误" }, this.props)
      }
      let balance = this.state.balance
      if (res.Code == 1) {
        if (typeof res.Data === "number") {
          balance = res.Data || 0
        } else {
          balance = res.Data?.balance || res.Data?.Balance || 0
        }
      }
      this.setState({
        balance: balance,
        user: userRes.Data.UserData,
        apiLoading: false,
      })
    }

    async changePlatform(platform) {
      if (platform.title != this.state.platform.title) {
        this.setState({ platform, apiLoading: true })
        await util.sleep(1)
        await this.reflesh()
        this.setState({ platformOpen: false })
      }
    }

    async transferMoney() {
      if (!this.state.money || isNaN(this.state.money)) {
        notificationAsync.alert("金额错误!")
        return
      }
      let platform = this.state.platform
      let transferApi = platform.transferApi
      let transferType = this.state.transferType
      let money = this.state.money
      let params = Object.assign({}, transferApi.params || {}, { type: transferType, money: money })
      this.setState({ apiLoading: true })
      let res = await action[transferApi.method](transferApi.url, params)
      this.setState({ apiLoading: false })
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      } else {
        let user = Object.assign({}, this.state.user)
        user.Money = res.Data.Money
        this.setState({ user: user, balance: res.Data.Credit })
        notificationAsync.alert(res.Message, { title: "成功" })
      }
    }

    render() {
      const user = this.state.user
      return (
        <LayoutPage
          className="site-wallet"
          apiLoading={this.state.apiLoading}
          center="我的钱包"
          renderFixed={() => {
            return this.platformId ? <GameNavigatorBar platform={this.platformId} active="transfer" /> : null
          }}
        >
          <div className="top">
            {this.state.user && (
              <div className="userInfo">
                <div className="money">
                  <span>余额:</span>&nbsp;
                  <span>
                    <b>{user.Money}</b>元
                  </span>
                </div>
              </div>
            )}
            <div className="item chose-tip">
              <div className="title">
                游戏平台：<span className="id">{this.state.platform.title}</span>
              </div>
              <div className="txt">
                <span className="platforms-balance">
                  平台余额：&nbsp;<b>{this.state.balance}&nbsp;元</b>
                </span>
                <span className="refresh" onClick={this.reflesh.bind(this)}>
                  <Icon icon="ion-android-refresh" />
                </span>
              </div>
            </div>
          </div>
          <div className="content">
            <div className="item select-item platform">
              <div className="title">游戏平台：</div>
              <div className="btn">
                <Button
                  modifier="quiet"
                  onClick={(e) => {
                    this.setState({ platformOpen: !this.state.platformOpen })
                  }}
                >
                  {this.state.platform.title}&nbsp;&nbsp;
                  <Icon icon="ion-android-arrow-dropdown" />
                </Button>
              </div>
            </div>
            <div className={`platforms-select ${this.state.platformOpen ? "open" : "close"}`}>
              <div className="inner">
                {Object.entries(this.platforms).map(([key, platform]) => (
                  <div
                    className={`platform-item ${platform.title == this.state.platform.title ? "active" : ""}`}
                    key={key}
                    onClick={this.changePlatform.bind(this, platform)}
                  >
                    {platform.title}
                  </div>
                ))}
              </div>
            </div>
            <div className="item  switch-item platform">
              <div className="title">转换类型：</div>
              <div className="btn">
                <Switch
                  checked={!!this.state.transferType}
                  onClick={() => {
                    this.setState({ transferType: this.state.transferType ? 0 : 1 })
                  }}
                />
              </div>
            </div>
            <div className="item">
              <div className="title">转账金额：</div>
              <InputBox
                placeholder="请输入转账金额"
                prefix="ion-android-person"
                type="number"
                name="amount"
                onChange={(value) => {
                  this.setState({ money: value })
                }}
                value={this.state.money + ""}
              />
            </div>

            <div className="submit">
              <Button
                disabled={this.state.apiLoading}
                onClick={() => {
                  this.transferMoney()
                }}
              >
                确认
              </Button>
            </div>
          </div>
        </LayoutPage>
      )
    }
  }
)
