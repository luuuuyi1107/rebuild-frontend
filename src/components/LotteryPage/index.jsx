import React, { createRef } from "react"
import LayoutPage from "@/components/LayoutPage"
import LotteryHead from "@/components/LotteryHead"
import LotteryTab from "@/components/LotteryTab"
import Broadcast from "@/components/Broadcast"
import util from "@/magic/util"
import * as action from "@/action"
import "./style.scss"
import LotteryFoot from "@/components/LotteryFoot"
import ChaseBet from "@/components/ChaseBet"
import * as apiNotification from "@/magic/ApiNotification"
import BetDisplay from "./display"
import $ from "@/components/jQuery"
import config from "@/config/config"
import "@/components/jQuery/jquery.signalR.js"
import forumGames from "@/config/forum"
import _ from "lodash"
import { withRouter } from "@/magic/withRouter"
import { getPush, shareBroadcast } from "@/action/apis"
import { gamesById } from "@/config/game"
import { notificationAsync } from "@/magic/notification"

const playRuleConfig = {
  ssc: require("@/config/ssc"),
  syxw: require("@/config/syxw"),
  lhc: require("@/config/lhc"),
  pcdd: require("@/config/pcdd"),
  pks: require("@/config/pks"),
  klsf: require("@/config/klsf"),
  klb: require("@/config/klb"),
  ks: require("@/config/ks"),
  qxc: require("@/config/qxc"),
  fc3: require("@/config/fc3"),
}

let playRuleConfigLxMap = {}
for (let key in playRuleConfig) {
  for (let i = 0; i < playRuleConfig[key].length; i++) {
    let lott = playRuleConfig[key][i]
    for (let k = 0; k < lott.list.length; k++) {
      let mapKey = key + "#" + lott.list[k].lx
      if (lott.list[k].type) {
        mapKey += "#" + lott.list[k].type
      }

      playRuleConfigLxMap[mapKey] = lott.list[k]
    }
  }
}

export default withRouter(
  class LotteryPage extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        id: util.getUrlParam("id"),
        lx: util.getUrlParam("lx"),
        data: null,
        rate: null,
        betCount: "",
        maxRate: "",
        temaTrustCount: 0,
        temaTrustTopWin: 0,
        loading: true,
        apiLoading: false,
        connectionDone: false,
        footerMode: "bet",
        unit: "",
        OpenLottery: {},
        RefundMsg: "",
      }
      this.user = util.cache.get("user")
      this.betDisplayRef = createRef()
      this.lotteryFooterRef = createRef()
      this.lotteryHeadRef = createRef()
      // this.connectionDone = false;
    }

    get gameData() {
      if (!this.state.id) return ""
      return util.findGames(this.state.id)
    }

    get betText() {
      return this.betDisplayRef.current?.getBetText()
      // this.betDisplayRef.current?.getBetText()
    }

    getBetCount() {}

    componentDidMount() {
      this.load()
    }

    handleBeforeUnload = (event) => {
      // util.cache.set('proves', event);
      // 在这里加入您要执行的程式码
      // 例如显示一个确认对话框或者做一些清理工作
    }

    connection(res) {
      if (this.user) {
        let _this = this
        let token = this.user.Token
        let connection = $.hubConnection(`${config.wsUrl}signalr`, { useDefaultPath: false })
        this.chatHub = connection.createHubProxy("chathub")

        this.listenMessage()
        connection
          .start()
          .done(function () {
            console.log("Now connected, connection ID=" + connection.id)
            _this.chatHub.invoke("Connect", token).done(function () {
              console.log("Invocation of Connect succeeded")
              _this.setState({ connectionDone: true })
              if (res.Data.ShareFee) {
                notificationAsync
                  .prompt({
                    title: "收费金额",
                    placeholder: "请填入金额",
                    messageHTML: `<span></span>`,
                    class: "invite-code-dialog",
                    buttonLabels: ["免费", "确定"],
                  })
                  .then(async (value) => {
                    if (value != null && value !== "") {
                      _this.chatHub.invoke("Speak", 1, res.Data.ShareKey, value).done(function () {
                        return notificationAsync.alert("分享成功")
                      })
                    } else if (!value) {
                      _this.chatHub.invoke("Speak", 1, res.Data.ShareKey, 0).done(function () {
                        return notificationAsync.alert("分享成功")
                      })
                    }
                  })
              } else {
                _this.chatHub.invoke("Speak", 1, res.Data.ShareKey, 0).done(function () {
                  return notificationAsync.alert("分享成功")
                })
              }
            })
          })
          .fail(function () {
            console.log("Could not connect")
          })
      }
    }

    listenMessage() {
      let _this = this
      this.chatHub.on("onMessageList", function (list) {
        // console.log('onMessageList', list);
        // _this.setState({isLoadingHistory: false});
        // _this.appendMessageList(list, "head");
      })
      this.chatHub.on("onUpdateMsg", function (list) {
        // _this.updateMessageList(list);
        // console.log("updateMessage" , list);
      })
      this.chatHub.on("onMessage", function (list) {
        // console.log("onMessage", list);
        // _this.appendMessageList(list, "tail");
        // _this.setState({isLoadingHistory: false});
      })
      this.chatHub.on("onUserList", function () {
        // console.log("onUserList", arguments);
      })
      this.chatHub.on("onMsg", function (msg) {
        notificationAsync.alert(msg, { title: "错误" })
        // console.log('onMsg',msg);
      })
      this.chatHub.on("onLog", function (error) {
        // console.log('onLog', arguments);
      })
    }

    async load() {
      const res = await getPush({ lotteryid: this.state.id, keys: ["lotteryrate", "sixset"] }, null, 10 * 60 * 1000) //请求缓存10分钟
      this.props.callback && this.props.callback(res.Data.ServerTime)
      if (res.Code == 1) {
        this.props.onData && this.props.onData(res.Data)

        let LotteryRate = (res.Data && res.Data.LotteryRate) || {}
        const RateData = LotteryRate.hasOwnProperty("Rate") ? LotteryRate.Rate : LotteryRate
        if (!!this.props.config.generateList) {
          this.props.config.list = this.props.config.generateList(util.date.toDate(res.Data.OpenLottery.NewKai.EndTime))
        }
        // refund logic
        if (this.props.config.refundCode) {
          let showRefund = false
          if (this.props.config.refundCode == "Pt1x_Refunds") {
            this.props.config.list[0].list = this.props.config.list[0].list.map((x, i) => ({ ...x, refund: RateData["Pt1x_Refunds"][i] }))
            showRefund = this.props.config.list[0].list.some((x) => x.refund)
          }
          if (this.props.config.refundCode == "Tm_Refunds") {
            showRefund = RateData["Tm_Refunds"].some((x) => x)
          }

          if (this.props.config.refundCode == "Sx_Refunds") {
            this.props.config.list[0].list = this.props.config.list[0].list.map((x, i) => ({ ...x, refund: RateData["Sx_Refunds"][i] }))
            showRefund = RateData["Sx_Refunds"].some((x) => x)
          }
          this.setState({
            RefundMsg: showRefund ? res.Data.SixSet.RefundMsg : "",
          })
        }

        const rate = this.props.config.list.map((configItem) => {
          return configItem.list.reduce((sum, cur) => {
            const value =
              this.gameData.type === "ssc" && this.state.lx === "2"
                ? this.props.config.maxRate([], RateData, { betCount: () => 1, baseUnit: 1 }, 1)
                : !!cur.odds
                ? RateData[cur.odds]
                : RateData.hasOwnProperty(this.props.config.odds)
                ? RateData[this.props.config.odds]
                : RateData[this.props.config.odds + "_" + cur.text] || null

            return {
              ...sum,
              [cur.text]: value,
              ...(cur.value ? { [cur.value]: value } : {}),
            }
          }, {})
        })

        this.setState({ data: res.Data, rate, loading: false })
      } else {
        await notificationAsync.alert("资料取得错误", { title: "错误" })
        this.props.router.back()
      }
    }

    checkSupportForumShare(res, lotteryId) {
      const _enable = import.meta.env.VITE_FORUM_ENABLE === "true"
      var checkPostPermission = true
      var forumGame = Object.values(forumGames)
      var formInfoStr = util.cache.get("default_forum_info")
      if (_enable && formInfoStr != null) {
        var formInfo = JSON.parse(formInfoStr)
        var supportArray = formInfo.PostSet.PostLotteryID.split(",")
        forumGame = forumGame.filter((item, key) => {
          return supportArray.indexOf(item.id) !== -1 && item.id == lotteryId
        })

        //代表发帖需要校验
        if (formInfo.PostSet != null && formInfo.PostSet.PostDepositLimit) {
          //充值最低限制 》 当前充值
          if (formInfo.PostSet.PostDepositMoney > formInfo.RecTotal) {
            //无发帖权限
            checkPostPermission = false
          }
        }
      }

      var isSupportShare =
        _enable &&
        forumGame.length > 0 && //是否支持
        res.Data.Bet != null && //后端是否支持发帖
        checkPostPermission //该用户发帖达标

      //Data.Bet为空，代表 后端不支持该彩种进行分享
      if (isSupportShare) {
        util.cache.set("share_game_to_forum", JSON.stringify(res.Data.Bet))
        notificationAsync
          .confirm("<div>下注成功<br>是否分享注单到论坛？</div>", { title: " 恭喜您!", buttonLabels: ["确认分享", "取消"] })
          .catch(() => {
            this.props.router.push(`/site/ticketNew`, {
              tid: res.Data.Bet.ID,
              id: lotteryId,
              from: 1,
            })
          })
          .finally(() => {
            this.onClear()
          })
      } else {
        notificationAsync.alert(res.Message, { title: " 恭喜您!" }).then(() => {
          this.onClear()
        })
      }
    }

    onChase() {
      const betText = this.betDisplayRef.current?.getBetText()
      if (!betText || !betText.split("|").some((v) => !!v)) {
        return notificationAsync.alert("请选择投注内容", { title: " 操作提示!" })
      }

      let betRate = -1

      const checkBetRate = (index, text) => {
        if (!text) return false
        if (betRate > 0 && betRate !== this.state.rate[index][text]) return true
        if (betRate < 0) betRate = this.state.rate[index][text]
        return false
      }

      let validateFlag = true

      if (betText.indexOf("=") >= 0) {
        const _units = _.uniq(betText.split("|").map((_bet) => _bet.split("=")[0]))
        validateFlag = !(_units.length > 1)
        if (validateFlag && !_units.includes(this.state.unit + "")) {
          this.setState({ unit: parseInt(_units[0]) }) // 强制将目前的金额 改成目前的下注金额
        }
      }

      if (validateFlag) {
        validateFlag = !betText.split("|").some((texts, index) => {
          // const isUnitEqual = texts.includes(`${this.state.unit}=`)
          const isUnitEqual = texts.includes("=")
          if (!isUnitEqual) betRate = -1
          // this.betText.replace(new RegExp(`${this.state.unit}=`, 'g'), "").replace(/\|/g, ",")
          // checkBetRate(0, texts.replace(new RegExp(`${this.state.unit}=`, "g"), ""))
          return isUnitEqual ? checkBetRate(0, texts.split("=")[1], "") : texts.split(",").some(checkBetRate.bind(null, index))
        })
      }

      if (!validateFlag) {
        notificationAsync.alert(
          `<div>
              您的当前订单暂无法进行追号，可能存在以下情况：<br />
              1、包括多种玩法<br />
              2、每注单价或者赔率不相同<br />
              3、当前玩法不支持智能追号<br />
              4、当前投注方案的盈利率小于或等于0
          </div>
        `,
          { title: "操作提示" }
        )
        return
      }

      this.setState({
        footerMode: "chase",
        OpenLottery: _.get(this.lotteryHeadRef.current, "state.OpenLottery", { LastKai: {}, newKai: {} }),
      })
    }

    getValidate() {
      return this.betDisplayRef.current?.validate()
    }

    async onSubmit(unit) {
      const lotteryId = this.state.id
      const validateResult = this.betDisplayRef.current?.validate()
      if (validateResult) {
        notificationAsync.alert(validateResult, { title: "操作提示" })
        return
      }
      const betText = this.betDisplayRef.current?.getBetText()
      this.setState({ apiLoading: true })
      const res = await action.post("Lottery/Bet", {
        lotteryid: lotteryId,
        lx: util.getUrlParam("lx"),
        money: unit,
        betText: betText,
      })
      this.setState({ apiLoading: false })
      if (res.Code != 1) {
        if (res.Message.startsWith("系统限制每期单号最高下注5000")) {
          res.Message = res.Message.replace(/(系统限制每期单号最高下注5000\.0彩金!)+/g, "系统限制每期单号最高下注5000.0彩金!")
        }
        apiNotification.alert(res, { title: "操作提示" }, this.props)
      } else {
        util.triggerEvent("updateUser", { Money: res.Data.Balance })
        this.handleBetResult(res)
      }
    }

    showModal(show) {
      this.betDisplayRef.current?.showModal(show)
    }

    onModeChange(mode) {
      this.lotteryFooterRef.current?.onModeChange(mode)
    }

    onUnitChange(unit) {
      this.betDisplayRef.current?.onUnitChange(unit)
    }

    //从特码的modal 回调回来
    async onModalBetCall() {
      //这边自己写判断

      const lotteryId = this.state.id
      const validateResult = this.betDisplayRef.current?.validate()
      if (validateResult) {
        notificationAsync.alert(validateResult, { title: "操作提示" })
        return
      }
      const betText = this.betDisplayRef.current?.getBetText()

      this.setState({ apiLoading: true })
      //todo 这边要改 数据格式
      const res = await action.post("Lottery/Bet", {
        lotteryid: lotteryId,
        lx: util.getUrlParam("lx"),
        money: 0,
        betText: betText,
      })
      this.setState({ apiLoading: false })
      if (res.Code != 1) {
        apiNotification.alert(res, { title: "操作提示" }, this.props)
      } else {
        util.triggerEvent("updateUser", { Money: res.Data.Balance })
        this.handleBetResult(res)
      }
    }

    handleBetResult(res) {
      if (res.Data.ShareBtn) {
        notificationAsync
          .confirm(res.Message, { title: " 恭喜您!", buttonLabels: ["确定", "分享"] })
          .then(() => {
            util.trialCheck()
            this.sendRequestsSequentially(res.Data.BetID, this.state.id)
              .then(() => {
                notificationAsync.alert("分享成功", { title: "操作提示" })
              })
              .catch((msg) => {
                notificationAsync.alert(msg, { title: "操作提示" })
              })
          })
          .finally(() => {
            this.onClear()
          })
      } else {
        notificationAsync.confirm(res.Message, { title: " 恭喜您!" }).finally(() => {
          this.onClear()
        })
      }
    }

    async sendRequestsSequentially(betIds, id) {
      for (let i = 0; i < betIds.length; i++) {
        await new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const res = await shareBroadcast(id, betIds[i])
              if (res.Code !== 1) throw new Error(res.Message)
              resolve()
            } catch (error) {
              reject(typeof error === "string" ? error : error.message)
            }
          }, 200 * i)
        })
      }
    }

    onClear() {
      this.setState({ betCount: 0 })
      this.betDisplayRef.current?.clear()
    }

    onFillUnit(unit) {
      if (this.betDisplayRef.current) {
        const betCount = this.betDisplayRef.current?.fillUnit(unit)
        if (!!betCount) this.setState({ betCount })
      }
    }

    getMaxRate() {
      if (this.betDisplayRef.current) {
        return this.betDisplayRef.current?.getMaxRate()
      }
      return "-"
    }

    getTemaInfo() {
      if (this.betDisplayRef.current) {
        return this.betDisplayRef.current?.getTemaInfo()
      }
      return "-"
    }

    render() {
      const data = this.state.data
      const rule = this.props.config.rule || ""
      let LotteryRate = (data && data.LotteryRate) || {}
      let LotteryRebate = {}
      if (this.gameData.type == "lhc") {
        LotteryRate = (data && data.LotteryRate.Rate) || {}
        LotteryRebate = (data && data.LotteryRate.Rebate) || {}
      }

      // console.log({ LotteryRate, LotteryRebate })
      const showPredictReward = !!this.props.config && this.props.config.hasOwnProperty("predictReward") ? this.props.config.predictReward : true
      const lx = util.getUrlParam("lx")
      const type = util.getUrlParam("type")
      const id = util.getUrlParam("id")
      const key = type ? `${this.gameData.type}#${lx}#${type}` : `${this.gameData.type}#${lx}`
      const subname = playRuleConfigLxMap.hasOwnProperty(key) ? playRuleConfigLxMap[key].name : ""
      const title = `${this.gameData.name}-${subname}`
      const betNameList = this.props.config.list.map((configItem) =>
        id == "165" && ["1", "2"].includes(lx) ? subname : _.get(configItem, "title", subname) || subname
      )

      return (
        <LayoutPage
          className="lottery-page-module"
          center={title}
          loading={this.state.loading}
          apiLoading={this.state.apiLoading}
          renderFixed={() =>
            this.state.footerMode === "bet" ? (
              <LotteryFoot
                ref={this.lotteryFooterRef}
                config={this.props.config}
                baseUnit={this.props.config.baseUnit || ""}
                initUnit={this.state.unit}
                showPredictReward={showPredictReward}
                enableChase={gamesById[this.state.id]?.enableChase}
                maxRate={this.getMaxRate.bind(this)}
                getTemaInfo={this.getTemaInfo.bind(this)}
                getValidate={this.getValidate.bind(this)}
                betCount={this.state.betCount || 0}
                temaTrustCount={this.state.temaTrustCount || 0}
                temaTrustTopWin={this.state.temaTrustTopWin}
                onClear={this.onClear.bind(this)}
                onFillUnit={this.onFillUnit.bind(this)}
                onSubmit={this.onSubmit.bind(this)}
                onChase={this.onChase.bind(this)}
                showModal={this.showModal.bind(this)}
                betMode={this.betDisplayRef?.current?.state?.mode ? this.betDisplayRef.current.state.mode : ""}
                setUnitAndChase={() => {
                  const betGroup = _.groupBy(this.betDisplayRef.current.getBetTrustData(), "value")
                  if (Object.keys(betGroup).filter((value) => !!value).length > 1) {
                    notificationAsync.alert("请输入相同金额！", { title: "金额错误" })
                    return
                  }
                  const unit = Object.keys(betGroup)[0]
                  this.setState({ unit })
                  setTimeout(() => {
                    this.onChase()
                  }, 0)
                }}
                onUnitChange={(unit) => {
                  this.onUnitChange(unit)
                  this.setState({ unit: unit })
                }}
              />
            ) : (
              <ChaseBet
                betNameList={betNameList}
                gameConfig={this.props.config}
                rate={this.state.rate}
                OpenLottery={this.state.OpenLottery}
                betText={
                  this.betText.includes("=") ? this.betText.replace(new RegExp(`${this.state.unit}=`, "g"), "").replace(/\|/g, ",") : this.betText
                }
                maxRate={this.getMaxRate.bind(this)}
                betCount={this.state.betCount || 0}
                unit={this.state.unit}
                onBack={() => {
                  this.setState({ footerMode: "bet" })
                }}
                isMultipleLevel={this.props.config.list.filter((ball) => ball.list.length > 0).length > 1}
              />
            )
          }
        >
          {data && (
            <>
              <Broadcast />
              <LotteryHead ref={this.lotteryHeadRef} lotteryId={this.state.id} lotteryType={this.gameData.type} />
              <LotteryTab
                lotteryId={this.state.id}
                lotteryType={this.gameData.type}
                LotteryRate={LotteryRate}
                LotteryRebate={LotteryRebate}
                rule={rule}
                RefundMsg={this.state.RefundMsg}
              />
              <div className="bet-content">
                <BetDisplay
                  ref={this.betDisplayRef}
                  onModeChange={this.onModeChange.bind(this)}
                  center={title}
                  unit={this.state.unit}
                  config={this.props.config}
                  LotteryRate={LotteryRate}
                  LotteryRebate={LotteryRebate}
                  onModalBetCall={this.onModalBetCall.bind(this)}
                  nextDate={util.date.toDate(this.state.data.OpenLottery.NewKai.EndTime)}
                  onChange={(obj) => {
                    this.setState({
                      maxRate: obj.maxRate,
                      betCount: obj.betCount,
                      temaTrustCount: obj.temaTrustCount,
                      temaTrustTopWin: obj.temaTrustTopWin,
                    })
                  }}
                />
              </div>
            </>
          )}
        </LayoutPage>
      )
    }
  }
)
