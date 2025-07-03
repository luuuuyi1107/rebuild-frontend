import React from "react"

import LayoutPage from "@/components/LayoutPage"
import { Icon, Button } from "react-onsenui"
import CustomIcon from "@/components/CustomIcon"
import Menu from "./menu"
import Poker from "./Poker"

import "./style.scss"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        user: null,
        data: null,
        dtime: 0, //客户端与服务端时间差
        countDown: "刷新中",
        currentChip: 0, //玩家选择的筹码
        myDefinedChip: util.cache.get("baccarat-chip") || "", // 自定义筹码
        loading: true,
        apiLoading: false,
        moneyMap: {}, //注单金额
        showResult: false,
        initLoad: true,
        gradesStatistics: { ZWin: 0, XWin: 0, Draw: 0 },
      }
      this.nextTime = 0 //发牌互斥量
      this.firstPokerId = 0 // 倒计时互斥量
      this.timer = null
    }

    componentDidMount() {
      this.loadUserData()
      this.loopData().then(() => {
        // this.statistics();
        this.startCountDown()
      })
    }

    componentWillUnmount() {
      this.timer && clearTimeout(this.timer)
      this.countdownTimer && clearInterval(this.countdownTimer)
    }

    async loadUserData() {
      let userRes = await getPush()
      if (userRes.Code != 1) {
        apiNotification.alert(userRes, {}, this.props)
        return
      }

      this.setState({ user: userRes.Data.UserData, loading: false })
    }
    async loadBaccaratData() {
      let id = util.getUrlParam("id")
      let t1 = new Date().getTime()
      let res = await action.get("Baccarat/GetData", { ID: id })

      let t2 = new Date().getTime()
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }

      let serverTime = util.date.toDate(res.Data.FirstPoker.ServerTime).getTime()
      let countDown = null
      let beginTime = res.Data.FirstPoker.BeginTime
      if (beginTime == null) {
        countDown = "请下注"
      } else {
        beginTime = util.date.toDate(beginTime).getTime()
        //console.log(this.firstPokerId, res.Data.FirstPoker.ID);
        if (this.firstPokerId != res.Data.FirstPoker.ID) {
          this.firstPokerId = res.Data.FirstPoker.ID
          countDown = beginTime - serverTime + (t2 - t1) / 2 + 1000
        } else {
          countDown = this.state.countDown
        }
        //countDown = isNaN(this.state.countDown) ? beginTime - serverTime + (t2 - t1)/2 + 1000: this.state.countDown;
        if (countDown > res.Data.PokerTime * 1000) {
          countDown = res.Data.PokerTime * 1000
        }
        if (countDown <= 0) {
          countDown = "停止下注"
        }
      }
      //** 第一次加载，如果有牌不显示 */
      if (res.Data.FirstPoker && res.Data.FirstPoker.Poker.Xian && res.Data.FirstPoker.Poker.Xian.length == 0) {
        this.setState({ initLoad: false })
      }

      let gradesStatistics = res.Data.Lottery

      this.setState({
        data: res.Data,
        loading: false,
        countDown: countDown,
        gradesStatistics: gradesStatistics,
      })
      return res
    }

    // async statistics(){
    //     let grades = await action.get("Baccarat/GetBoardList",{ID:this.state.data.ID,PageIndex: 1,PageSize: this.state.data.SealHide});
    //
    //     console.log(grades)
    //     let gradesStatistics = grades.Data.Lottery || {Zdian:0,Xdian:0,draw:0};
    //
    //     // grades.Data.map(data=>{
    //     //     if(data.Poker.Zdian>data.Poker.Xdian){
    //     //         gradesStatistics.Zdian ++;
    //     //     }else if(data.Poker.Zdian<data.Poker.Xdian){
    //     //       gradesStatistics.Xdian ++;
    //     //     }else if(data.Poker.Zdian == data.Poker.Xdian){
    //     //         gradesStatistics.draw ++;
    //     //     }
    //     // })
    //
    //     this.setState({gradesStatistics:gradesStatistics});
    // }

    async loopData() {
      let res = await this.loadBaccaratData()

      // this.statistics();

      //console.log("nextTime", this.nextTime, res.Data.FirstPoker.NextTime);
      if (!this.state.initLoad && res.Data.FirstPoker.NextTime && this.nextTime != res.Data.FirstPoker.NextTime) {
        let serverTime = util.date.toDate(res.Data.FirstPoker.ServerTime).getTime()
        let nextTime = util.date.toDate(res.Data.FirstPoker.NextTime).getTime()
        let poker = res.Data.FirstPoker.Poker
        this.nextTime = res.Data.FirstPoker.NextTime
        //console.log("show result");

        setTimeout(
          () => {
            this.setState({ showResult: true })
            // this.statistics();
          },
          poker.Xian.length == 3 || poker.Zhuan.length == 3 ? 5500 : 4500
        )

        this.timer = setTimeout(() => {
          this.clearTable()
          this.loopData()
        }, nextTime - serverTime)
      } else {
        this.timer = setTimeout(() => {
          this.loopData()
        }, 2000)
      }
    }
    clearTable() {
      this.setState({ showResult: false, moneyMap: {} })
    }
    startCountDown() {
      this.countdownTimer = setInterval(() => {
        if (!isNaN(this.state.countDown)) {
          let countDown = this.state.countDown - 1000
          if (countDown < 0) {
            countDown = "停止下注"
          }
          this.setState({ countDown: countDown })
        }
      }, 1000)
    }
    setChip(value) {
      if (value) {
        this.setState({ currentChip: value })
      } else {
        notificationAsync.prompt("请设置筹码金额", { title: "自定义筹码", cancelable: false }).then((res) => {
          if (res !== null) {
            if (isNaN(res)) {
              notificationAsync.alert("金额设置错误", { title: "金额设置错误", cancelable: true })
            } else if (res == 1 || res == 10 || res == 100) {
              notificationAsync.alert("金额设置重复", { title: "金额设置重复", cancelable: true })
            } else {
              this.setState({ myDefinedChip: parseInt(res) })
              util.cache.set("baccarat-chip", parseInt(res))
            }
          }
        })
      }
    }
    resetDefinedChip(e) {
      e.stopPropagation()
      e.preventDefault()
      this.setState({ myDefinedChip: "" })
      util.cache.set("baccarat-chip", "")
    }
    setMoney(lx) {
      if (!this.state.currentChip) {
        notificationAsync.toast("请先选择筹码", { class: "baccarat-toast", timeout: 1200 })
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
        notificationAsync.toast("您未下注", { class: "baccarat-toast", timeout: 1200 })
        return
      }

      let result = []
      for (let i = 0, len = keys.length; i < len; i++) {
        result.push(`${keys[i]},${moneyMap[keys[i]]}`)
      }

      let id = util.getUrlParam("id")
      let code = util.getUrlParam("code")
      this.setState({ apiLoading: true })
      let res = await action.post("Baccarat/Bet", { ID: id, Code: code, betText: result.join("|") })
      this.setState({ apiLoading: false })
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
      } else {
        notificationAsync.alert(res.Message, { title: " 恭喜您!" })
        let userData = Object.assign({}, this.state.user)
        this.setState({ user: Object.assign(userData, { Money: res.Data.Balance }), moneyMap: {} })
        this.loadBaccaratData()
      }
    }
    render() {
      let data = this.state.data
      let user = this.state.user
      let currentChip = this.state.currentChip
      let myDefinedChip = this.state.myDefinedChip

      let BetCount = (data && data.FirstPoker.BetCount) || {}
      let BetCountMap = util.arrayToMap(BetCount, "BetLx")

      let moneyMap = this.state.moneyMap || {}
      let pokers = (data && data.FirstPoker.Poker) || {}

      return (
        <LayoutPage
          right={data ? <Menu gameTableID={data.ID} /> : null}
          apiLoading={this.state.apiLoading}
          className="baccarat-gameTable"
          center="百家乐"
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
                {data && (
                  <div className="tableInfo">
                    <div className="top">
                      <Icon icon="ion-ios-game-controller-b" />
                      <span className="name">
                        <b>第{data.HandMax}局</b>&nbsp;共{data.SealHide}局
                      </span>
                      <span className="count-down">
                        <Icon icon="ion-android-time" />
                        {isNaN(this.state.countDown) ? this.state.countDown : util.date.formatRemaintingTime(this.state.countDown)}
                      </span>
                    </div>
                    <div className="middle">
                      <span>
                        桌号 : <b>{data.ID}</b>
                      </span>
                      <span>
                        庄主 : <b>{data.NickName}</b>
                      </span>
                    </div>
                    <div className="bottom">
                      <span>
                        限红 :{" "}
                        <b>
                          {data.MinHide}～{data.MaxHide}
                        </b>
                      </span>
                      <span>
                        彩池 :{" "}
                        <b>
                          {data.PotMoney}/{data.Guarantee}
                        </b>
                      </span>
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
                      {!this.state.initLoad && pokers.Zhuan && pokers.Zhuan.length
                        ? pokers.Zhuan.map((item, index) => {
                            return (
                              <Poker
                                key={index}
                                className={`zhuang poker-${index}`}
                                value={item.code}
                                shape={item.name}
                                timeout={index == 0 ? 0 : index == 1 ? 600 : 3000}
                                openTimeout={index == 0 ? 2000 : index == 1 ? 2000 : 4000}
                              />
                            )
                          })
                        : null}
                    </div>
                    {this.state.showResult && pokers.Zhuan && pokers.Zhuan.length > 0 && (
                      <div className="result">
                        <span className="dian">{pokers.Zdian}点</span>
                        <span className="win-lose">{pokers.Xdian > pokers.Zdian ? "输" : pokers.Xdian == pokers.Zdian ? "和" : "赢"}</span>
                      </div>
                    )}
                  </div>
                  <div className="box xian">
                    <p className="title">闲</p>
                    <div className="pokers">
                      {!this.state.initLoad && pokers.Xian && pokers.Xian.length
                        ? pokers.Xian.map((item, index) => {
                            return (
                              <Poker
                                key={index}
                                className={`xian poker-${index}`}
                                value={item.code}
                                shape={item.name}
                                timeout={index == 0 ? 300 : index == 1 ? 900 : 3000}
                                openTimeout={index == 0 ? 2000 : index == 1 ? 2000 : 4000}
                              />
                            )
                          })
                        : null}
                    </div>
                    {this.state.showResult && pokers.Xian && pokers.Xian.length > 0 && (
                      <div className="result">
                        <span className="dian">{pokers.Xdian}点</span>
                        <span className="win-lose">{pokers.Xdian < pokers.Zdian ? "输" : pokers.Xdian == pokers.Zdian ? "和" : "赢"}</span>
                      </div>
                    )}
                  </div>
                  {this.state.countDown != "停止下注" && this.state.countDown != 0 && (
                    <div className="count-down">
                      {isNaN(this.state.countDown)
                        ? this.state.countDown == "请下注"
                          ? `第${data.HandMax}局开始`
                          : this.state.countDown
                        : util.date.formatRemaintingTime(this.state.countDown)}
                    </div>
                  )}
                </div>
                <div className="row row1">
                  <Box name="庄" odds="1.95" lx="1" betCount={BetCountMap["1"]} money={moneyMap["1"]} onClick={this.setMoney.bind(this, "1")} />
                  <Box name="闲" odds="2" lx="2" betCount={BetCountMap["2"]} money={moneyMap["2"]} onClick={this.setMoney.bind(this, "2")} />
                </div>
                <div className="row row2">
                  <Box name="不补" odds="2.5" lx="11" betCount={BetCountMap["11"]} money={moneyMap["11"]} onClick={this.setMoney.bind(this, "11")} />
                  <Box name="和局" odds="8" lx="3" betCount={BetCountMap["3"]} money={moneyMap["3"]} onClick={this.setMoney.bind(this, "3")} />
                  <Box name="补牌" odds="1.54" lx="10" betCount={BetCountMap["10"]} money={moneyMap["10"]} onClick={this.setMoney.bind(this, "10")} />
                </div>
                <div className="row row3">
                  <Box name="庄单" odds="1.95" lx="6" betCount={BetCountMap["6"]} money={moneyMap["6"]} onClick={this.setMoney.bind(this, "6")} />
                  <Box name="庄双" odds="1.95" lx="8" betCount={BetCountMap["8"]} money={moneyMap["8"]} onClick={this.setMoney.bind(this, "8")} />
                  <Box name="闲单" odds="1.95" lx="7" betCount={BetCountMap["7"]} money={moneyMap["7"]} onClick={this.setMoney.bind(this, "7")} />
                  <Box name="闲双" odds="1.95" lx="9" betCount={BetCountMap["9"]} money={moneyMap["9"]} onClick={this.setMoney.bind(this, "9")} />
                </div>
                <div className="row row4">
                  <Box name="庄对" odds="11" lx="4" betCount={BetCountMap["4"]} money={moneyMap["4"]} onClick={this.setMoney.bind(this, "4")} />
                  <Box name="完美对" odds="25" lx="12" betCount={BetCountMap["12"]} money={moneyMap["12"]} onClick={this.setMoney.bind(this, "12")} />
                  <Box name="任意对" odds="5" lx="13" betCount={BetCountMap["13"]} money={moneyMap["13"]} onClick={this.setMoney.bind(this, "13")} />
                  <Box name="闲对" odds="11" lx="5" betCount={BetCountMap["5"]} money={moneyMap["5"]} onClick={this.setMoney.bind(this, "5")} />
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
)

class Box extends React.PureComponent {
  render() {
    return (
      <div className="box" onClick={this.props.onClick}>
        <div className="hd">
          <Icon icon="ion-soup-can" />
          &nbsp;<span>{this.props.betCount ? this.props.betCount.Money : ""}</span>
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
