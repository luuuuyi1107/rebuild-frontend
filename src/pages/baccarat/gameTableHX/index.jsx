import React from "react"
import LayoutPage from "@/components/LayoutPage"
import { Icon, Button } from "react-onsenui"
import Menu from "./menu"
import Poker from "./Poker"

import "./style.scss"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import { getPush, shareBroadcast } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

@withRouter
export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      data: null,
      currentChip: 0, //玩家选择的筹码
      myDefinedChip: util.cache.get("baccarat-chip") || "", // 自定义筹码
      loading: true,
      apiLoading: false,
      moneyMap: {}, //注单金额
      hasBet: false, // 是否有下注
      showResult: false,
      initLoad: false,
      gradesStatistics: { ZWin: 0, XWin: 0, Draw: 0 }, // 累积开
      OpenLottery: {}, // 新 API 开奖资讯
      gameReloading: false,
      showCountDown: -1,
      reloadCountDown: -1,
      currentIssueText: null,
      openState: "-1", // -1 刷新中  0 停止下注   1 xxx 开始  2 倒数 3 开奖中   flow state
      openStateText: "刷新中",
      isOpening: false, // 开奖过程中
      odds: {
        // 赔率配置 [Player]闲  [Makers]庄  [Draw]和局  [PV]赢  [S]双  [D]单
        AnyPair: 5, // 任意对
        DrawPv: 8, // 和局
        High: 10000,
        Lows: 1,
        MakersD: 1.95, // 庄单
        MakersPv: 1.95, // 庄赢
        MakersS: 1.95, // 庄双
        PairPv: 11, // 对子赔率
        PerfectPair: 0, // 完美对子
        PlayerD: 1.95, // 闲单
        PlayerPv: 2, // 闲赢
        PlayerS: 1.95, // 闲双
        PokerBig: 1.54, // 补牌
        PokerSmall: 2.5, // 未补
        Seal: 5,
      },
    }
    this.nextTime = 0 //发牌互斥量
    this.firstPokerId = 0 // 倒计时互斥量
    this.timer = null
  }

  componentDidMount() {
    this.loadData()
  }

  async loadData() {
    const res = await this.loadBaccaratData() // 初次取值

    this.loopCheck(res)
    this.getOdds()

    window.addEventListener("updateUser", this.updateUser.bind(this))
    this.pageShow()
  }
  componentWillUnmount() {
    this.timer && clearTimeout(this.timer)
    window.removeEventListener("updateUser", this.updateUser.bind(this))
  }
  updateUser(event) {
    this.setState({
      UserData: Object.assign({}, this.state.UserData, event.detail),
    })
  }
  async pageShow(e) {
    if (e && e.persisted) {
      this.setState({ gameReloading: true })
      await this.load()
      this.setState({ gameReloading: false })
    }
  }

  // 初始载入游戏资料
  async loadBaccaratData() {
    // 取资料
    let id = util.getUrlParam("id")
    let keys = ""
    let hasBet = this.state.hasBet
    if (hasBet) {
      keys = "hxbaccaratbet"
    }

    let res = await getPush({ lotteryid: id, keys: keys })

    this.getCount() // 取总数

    if (res.Code != 1) {
      apiNotification.alert(res, {}, this.props)
      return
    }

    let OpenLottery = res.Data.OpenLottery
    let dt = util.date.toDate(res.Data.ServerTime).getTime() - new Date().getTime() // 校正时间用
    let showCountDown = util.date.toDate(OpenLottery.NewKai.EndTime).getTime() - new Date().getTime() - dt
    let openState = 1
    let currentIssueText = "刷新中"
    let openStateText = "刷新中"
    if (OpenLottery.NewKai) {
      let issue = OpenLottery.NewKai.GameID // .split("-")[1];
      currentIssueText = `第 ${issue} 局开始`
    }
    if (showCountDown > 0) {
      // 倒数中
      openState = 1
      openStateText = currentIssueText
    } else {
      openState = 0
      openStateText = "停止下注"
    }

    if (hasBet) {
      // 有下注则倒数
      openState = 2
    }

    if (this.state.openState == 3) {
      // 开奖
      this.openGame(res.Data)
    }
    if (OpenLottery.LastKai.KaiText) {
      setTimeout(() => {
        this.openGame(res.Data)
      }, 100)
    }

    this.setState({
      OpenLottery: OpenLottery,
      dt: dt,
      openState: openState,
      openStateText: openStateText,
      currentIssueText: currentIssueText,
      showCountDown: showCountDown,
      reloadCountDown: util.date.toDate(OpenLottery.NewKai.KaiTime).getTime() - new Date().getTime() - dt,
      user: res.Data.UserData,
      loading: false,
    })

    return res
  }

  loopCheck(res) {
    // 刷秒用
    let OpenLottery = res?.Data.OpenLottery || this.state.OpenLottery
    let dt = this.state.dt || 0
    if (this.state.reloadCountDown > 0) {
      let c = util.date.toDate(OpenLottery.NewKai.KaiTime).getTime() - new Date().getTime() - dt
      this.setState({ reloadCountDown: c })
      if (c <= 0) {
        console.log("结束")
        setTimeout(this.loadBaccaratData.bind(this), 1000)
      }
    }

    if (this.state.showCountDown > 0) {
      let c = util.date.toDate(OpenLottery.NewKai.EndTime).getTime() - new Date().getTime() - dt
      this.setState({ showCountDown: c })
    }

    if (this.state.showCountDown <= 0) {
      let c = util.date.toDate(OpenLottery.NewKai.KaiTime).getTime() - new Date().getTime() - dt
      this.clearTable()

      this.setState({
        openState: c <= 0 ? 3 : 0, // 3 是开奖
        hasBet: false,
        openStateText: "停止下注",
      })
    }

    this.timer = setTimeout(this.loopCheck.bind(this), 1000)
  }

  async getCount() {
    // 取统计
    let id = util.getUrlParam("id")
    let res = await getPush({ lotteryid: id, keys: "hxbaccaratbet" })
    let gradesStatistics = res.Data.HXBaccaratBet.Count || {
      Zdian: 0,
      Xdian: 0,
      Draw: 0,
    }

    this.setState({
      data: res.Data, // 存下注信息
      gradesStatistics: gradesStatistics,
    })
  }

  async getOdds() {
    // 取倍率
    let id = util.getUrlParam("id")
    let res = await getPush({ lotteryid: id, keys: "hxbaccarat" })

    this.setState({ odds: res.Data.HXBaccarat })
  }

  openGame(data) {
    let OpenLottery = this.state.OpenLottery
    let lastKai = OpenLottery.LastKai
    // console.log("开奖", lastKai.KaiText)
    if (OpenLottery.NewKai && lastKai.KaiText) {
      // && data.OpenLottery.NewKai.GameID !== OpenLottery.NewKai.GameID) { // 下期更换
      // 待处理要算清牌时间

      let xian = lastKai.KaiText ? lastKai.KaiText.split("|")[1].split(",") : []
      let zhuan = lastKai.KaiText ? lastKai.KaiText.split("|")[0].split(",") : []

      let ms = xian.length == 3 || zhuan.length == 3 ? 5500 : 4500
      // console.log("成功")

      this.setState({ isOpening: true, showResult: true }) // 开牌

      // ----- 注解掉动画 START -------
      // this.setState({ isOpening: true }); // 开牌

      // setTimeout(() => { // 开结果
      //   this.setState({ showResult: true, })
      // }, xian.length == 3 || zhuan.length == 3 ? 6000 : 3500); // 开牌秒数

      // setTimeout(() => {
      //   this.setState({
      //     showResult: false,
      //     isOpening: false,
      //     openState: 1,
      //   })

      //   this.clearTable();
      //   this.loadBaccaratData();
      // }, ms + 3000); // 五秒后清空
      // ----- 注解掉动画 END -------
    } else {
      setTimeout(this.loadBaccaratData.bind(this), 1000)
      console.log("fail", data, OpenLottery)
    }
  }

  clearTable() {
    this.setState({ showResult: false, moneyMap: {}, isOpening: false })
  }

  setChip(value) {
    if (value) {
      this.setState({ currentChip: value })
    } else {
      notificationAsync
        .prompt("请设置筹码金额", {
          title: "自定义筹码",
          cancelable: false,
        })
        .then((res) => {
          if (res !== null) {
            if (isNaN(res) || !/^[0-9]+$/.test(res)) {
              notificationAsync.alert("金额设置错误", {
                title: "金额设置错误",
                cancelable: true,
              })
            } else if (res == 1 || res == 10 || res == 100) {
              notificationAsync.alert("金额设置重复", {
                title: "金额设置重复",
                cancelable: true,
              })
            } else {
              const currentChip = parseInt(res)
              this.setState({ myDefinedChip: currentChip, currentChip })
              util.cache.set("baccarat-chip", currentChip)
            }
          }
        })
    }
  }
  resetDefinedChip(e) {
    e.stopPropagation()
    e.preventDefault()
    this.setState({ myDefinedChip: "", currentChip: 0 })
    util.cache.set("baccarat-chip", "")
  }
  setMoney(lx) {
    if (!this.state.currentChip) {
      notificationAsync.toast("请先选择筹码", {
        class: "baccarat-toast",
        timeout: 1200,
      })
      return
    }
    let moneyMap = Object.assign({}, this.state.moneyMap)
    if (moneyMap[lx]) {
      moneyMap[lx] += this.state.currentChip
    } else {
      moneyMap[lx] = this.state.currentChip
    }
    this.setState({ moneyMap: moneyMap })
  }
  resetMoney() {
    this.setState({ moneyMap: {} })
  }
  async bet() {
    let moneyMap = this.state.moneyMap
    let keys = Object.keys(moneyMap)

    if (keys.length == 0) {
      notificationAsync.toast("您未下注", {
        class: "baccarat-toast",
        timeout: 1200,
      })
      return
    }

    let result = []
    for (let i = 0, len = keys.length; i < len; i++) {
      result.push(`${keys[i]},${moneyMap[keys[i]]}`)
    }

    let id = util.getUrlParam("id")
    let code = util.getUrlParam("code")
    this.setState({ apiLoading: true })
    let res = await action.post("Baccarat/HXBet", {
      ID: id,
      Code: code,
      betText: result.join("|"),
    })

    this.setState({ apiLoading: false })
    if (res.Code != 1) {
      apiNotification.alert(res, {}, this.props)
    } else {
      this.handleBetResult(res)
      let userData = Object.assign({}, this.state.user)
      // console.log("bet", { Money: res.Data.Balance })
      this.setState({
        hasBet: true,
        user: Object.assign(userData, { Money: res.Data.Balance }),
        moneyMap: {},
      })
      this.loadBaccaratData()
    }
  }

  handleBetResult(res) {
    let id = util.getUrlParam("id")
    if (res.Data.ShareBtn) {
      notificationAsync.confirm(res.Message, { title: "恭喜您!", buttonLabels: ["确定", "分享"] }).then((index) => {
        util.trialCheck()
        Promise.all(res.Data.BetID.map((betId) => shareBroadcast(id, betId))).then(() => {
          notificationAsync.alert("分享成功", { title: "操作提示" })
        })
      })
    } else {
      notificationAsync.alert(res.Message, { title: " 恭喜您!" })
    }
  }

  render() {
    let data = this.state.data
    let lastKai = this.state.OpenLottery.LastKai
    let newKai = this.state.OpenLottery.NewKai
    let user = this.state.user
    let currentChip = this.state.currentChip
    let myDefinedChip = this.state.myDefinedChip
    let odds = this.state.odds

    let BetCount = data && data.HXBaccaratBet ? data.HXBaccaratBet.Items : {}

    let BetCountMap = util.arrayToMap(BetCount, "BetLx")

    let moneyMap = this.state.moneyMap || {}
    let pokers = {
      Xian: "",
      Zhuan: "",
    }

    if (lastKai && lastKai.KaiText) {
      pokers.Xian = lastKai.KaiText.split("|")[1].split(",")
      pokers.XianCount = pokers.Xian.reduce((a, b) => Number(a) + Number(b)) % 10
      pokers.Zhuan = lastKai.KaiText.split("|")[0].split(",")
      pokers.ZhuanCount = pokers.Zhuan.reduce((a, b) => Number(a) + Number(b)) % 10
    }

    return (
      <LayoutPage
        right={lastKai ? <Menu gameTableID={util.getUrlParam("id")} /> : null}
        apiLoading={this.state.apiLoading}
        className="baccarat-gameTable hx-baccarat gameTableHX"
        center="哈希百家乐"
      >
        <div className="content">
          <div className="userInfo">
            {user && (
              <span>
                账户: <b>{user.NickName}</b> (ID: {user.ID})
              </span>
            )}
            {user && (
              <span>
                余额: <b>{user.Money.toFixed(2)}元</b>
              </span>
            )}
          </div>
          <div className="bet-content">
            <div className={`tableInfo-holder ${data ? "" : "loading"}`}>
              {newKai && (
                <div className="tableInfo">
                  <div className="top">
                    <Icon icon="ion-ios-game-controller-b" />
                    <span className="name">
                      <b>第 {newKai.GameID} 局</b>
                    </span>
                    <span className="count-down">
                      <Icon icon="ion-android-time" />
                      {this.state.gameReloading && "刷新中"}
                      {!this.state.gameReloading && this.state.showCountDown <= 0 && "停止下注"}
                      {isNaN(this.state.showCountDown) ? this.state.showCountDown : util.date.formatRemaintingTime(this.state.showCountDown)}
                    </span>
                  </div>
                  <div className="middle"></div>
                  <div className="bottom">
                    <span>限红 : 无限制 </span>
                  </div>
                  <div className="gradesStatistics">
                    <span>
                      庄赢 : <b>{this.state.gradesStatistics.ZWin} 次</b>
                    </span>
                    <span>
                      闲赢 : <b>{this.state.gradesStatistics.XWin} 次</b>
                    </span>
                    <span>
                      和局 : <b>{this.state.gradesStatistics.Draw} 次</b>
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="game-table">
              <div className="top">
                <div className="box zhuang">
                  <p className="title">庄</p>
                  <div className="pokers">
                    {this.state.isOpening && pokers.Zhuan && pokers.Zhuan.length
                      ? pokers.Zhuan.map((item, index) => {
                          return (
                            <Poker
                              key={index}
                              className={`zhuang poker-${index}`}
                              value={item}
                              shape={"hearts"}
                              timeout={index == 0 ? 0 : index == 1 ? 600 : 3000}
                              openTimeout={index == 0 ? 2000 : index == 1 ? 2000 : 4000}
                              noAnimation={true}
                            />
                          )
                        })
                      : null}
                    {/* <Poker className={`zhuang poker-${0}`} value={"3"} shape={"hearts"} timeout={0} openTimeout={0} noAnimation={true} /> */}
                  </div>
                  {this.state.showResult && pokers.Zhuan && pokers.Zhuan.length > 0 && (
                    <div className="result">
                      <span className="dian">{pokers.ZhuanCount}点</span>
                      <span className="win-lose">
                        {pokers.XianCount > pokers.ZhuanCount ? "输" : pokers.XianCount == pokers.ZhuanCount ? "和" : "赢"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="box xian">
                  <p className="title">闲</p>
                  <div className="pokers">
                    {this.state.isOpening && pokers.Xian && pokers.Xian.length
                      ? pokers.Xian.map((item, index) => {
                          return (
                            <Poker
                              key={index}
                              className={`xian poker-${index}`}
                              value={item}
                              shape={"spades"}
                              timeout={index == 0 ? 300 : index == 1 ? 900 : 3000}
                              openTimeout={index == 0 ? 2000 : index == 1 ? 2000 : 4000}
                              noAnimation={true}
                            />
                          )
                        })
                      : null}
                  </div>
                  {this.state.showResult && pokers.Xian && pokers.Xian.length > 0 && (
                    <div className="result">
                      <span className="dian">{pokers.XianCount}点</span>
                      <span className="win-lose">
                        {pokers.XianCount < pokers.ZhuanCount ? "输" : pokers.XianCount == pokers.ZhuanCount ? "和" : "赢"}
                      </span>
                    </div>
                  )}
                </div>
                {!this.state.isOpening && this.state.showCountDown != 0 && this.state.openState != 3 && (
                  <div className="count-down">
                    {this.state.openState < 2 ? this.state.openStateText : util.date.formatRemaintingTime(this.state.showCountDown)}
                  </div>
                )}
              </div>
              <div className="row row1">
                <Box
                  name="庄"
                  odds={odds.MakersPv}
                  lx="1"
                  betCount={BetCountMap["1"]}
                  money={moneyMap["1"]}
                  onClick={this.setMoney.bind(this, "1")}
                />
                <Box
                  name="闲"
                  odds={odds.PlayerPv}
                  lx="2"
                  betCount={BetCountMap["2"]}
                  money={moneyMap["2"]}
                  onClick={this.setMoney.bind(this, "2")}
                />
              </div>
              <div className="row row2">
                <Box
                  name="不补"
                  odds={odds.PokerSmall}
                  lx="11"
                  betCount={BetCountMap["11"]}
                  money={moneyMap["11"]}
                  onClick={this.setMoney.bind(this, "11")}
                />
                <Box
                  name="和局"
                  odds={odds.DrawPv}
                  lx="3"
                  betCount={BetCountMap["3"]}
                  money={moneyMap["3"]}
                  onClick={this.setMoney.bind(this, "3")}
                />
                <Box
                  name="补牌"
                  odds={odds.PokerBig}
                  lx="10"
                  betCount={BetCountMap["10"]}
                  money={moneyMap["10"]}
                  onClick={this.setMoney.bind(this, "10")}
                />
              </div>
              <div className="row row3">
                <Box
                  name="庄单"
                  odds={odds.MakersD}
                  lx="6"
                  betCount={BetCountMap["6"]}
                  money={moneyMap["6"]}
                  onClick={this.setMoney.bind(this, "6")}
                />
                <Box
                  name="庄双"
                  odds={odds.MakersS}
                  lx="8"
                  betCount={BetCountMap["8"]}
                  money={moneyMap["8"]}
                  onClick={this.setMoney.bind(this, "8")}
                />
                <Box
                  name="闲单"
                  odds={odds.PlayerD}
                  lx="7"
                  betCount={BetCountMap["7"]}
                  money={moneyMap["7"]}
                  onClick={this.setMoney.bind(this, "7")}
                />
                <Box
                  name="闲双"
                  odds={odds.PlayerS}
                  lx="9"
                  betCount={BetCountMap["9"]}
                  money={moneyMap["9"]}
                  onClick={this.setMoney.bind(this, "9")}
                />
              </div>
              <div className="row row4">
                <Box
                  name="庄对"
                  odds={odds.PairPv}
                  lx="4"
                  betCount={BetCountMap["4"]}
                  money={moneyMap["4"]}
                  onClick={this.setMoney.bind(this, "4")}
                />
                <Box
                  name="任意对"
                  odds={odds.AnyPair}
                  lx="13"
                  betCount={BetCountMap["13"]}
                  money={moneyMap["13"]}
                  onClick={this.setMoney.bind(this, "13")}
                />
                <Box
                  name="闲对"
                  odds={odds.PairPv}
                  lx="5"
                  betCount={BetCountMap["5"]}
                  money={moneyMap["5"]}
                  onClick={this.setMoney.bind(this, "5")}
                />
              </div>
              <div className="quick-select">
                <div className={`chip chip1 ${currentChip == 1 ? "on" : ""}`} onClick={this.setChip.bind(this, 1)}>
                  {/* <CustomIcon style={{fill: "#50b71e"}} className="chip-icon" type={require("./icons/chip.svg")}/> */}
                  <span className="number">1元</span>
                </div>
                <div className={`chip chip1 ${currentChip == 10 ? "on" : ""}`} onClick={this.setChip.bind(this, 10)}>
                  {/* <CustomIcon style={{fill: "#4271d0"}} className="chip-icon" type={require("./icons/chip.svg")}/> */}
                  <span className="number">10元</span>
                </div>
                <div className={`chip chip1 ${currentChip == 100 ? "on" : ""}`} onClick={this.setChip.bind(this, 100)}>
                  {/* <CustomIcon style={{fill: "#b71eab"}} className="chip-icon" type={require("./icons/chip.svg")}/> */}
                  <span className="number">100元</span>
                </div>
                <div
                  className={`chip chip1 ${currentChip === myDefinedChip ? "on" : ""} ${myDefinedChip == "" ? "unset" : ""}`}
                  onClick={this.setChip.bind(this, myDefinedChip)}
                >
                  {/* <CustomIcon style={{fill: "#b408fb"}} className="chip-icon" type={require("./icons/chip.svg")}/> */}
                  <span className="number">{myDefinedChip ? myDefinedChip + "元" : "自定义"}</span>
                  <span className="edit" onClick={this.resetDefinedChip.bind(this)}>
                    <Icon icon="ion-close-round" />
                  </span>
                </div>
              </div>
              <div className="bottom-buttons">
                <Button modifier="light" onClick={this.resetMoney.bind(this)}>
                  重新下注
                </Button>
                <Button onClick={this.bet.bind(this)}>确定下注</Button>
              </div>
            </div>
          </div>
        </div>
      </LayoutPage>
    )
  }
}

class Box extends React.PureComponent {
  render() {
    return (
      <div className="box" onClick={this.props.onClick}>
        <div className="hd">
          <Icon icon="ion-soup-can" />
          &nbsp;
          <span>{this.props.betCount ? this.props.betCount.BetMoney : ""}</span>
        </div>
        <div className="bd">
          <p className="name">{this.props.name}</p>
          <p className="odds">赔率: {this.props.odds}</p>
          {this.props.money && <span className="money">{this.props.money}</span>}
        </div>
      </div>
    )
  }
}
