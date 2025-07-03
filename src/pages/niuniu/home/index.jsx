import React, { createRef } from "react"

import LayoutPage from "@/components/LayoutPage"

import "./style.scss"
import util from "@/magic/util"
import * as action from "@/action"
import { getPush } from "@/action/apis"
import RadioSwitch from "@/components/RadioSwitch"
import NiuBetFooter from "@/pages/niuniu/footer/index"
import CountDownArea from "./countdown"
import * as apiNotification from "@/magic/ApiNotification"
import LastKaiArea from "./draw_area"
import BetDrawArea from "./betdraw_area"
import BetTable from "./betTable"
import { Modal } from "react-onsenui"
import HistoryData from "./historyData"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { toast } from "@/magic/toast"
import { notificationAsync } from "@/magic/notification"
// import {Switch}from 'react-onsenui';
// import {Icon, ListItem} from "react-onsenui";
// import CustomIcon from "../../../components/CustomIcon";
//   const parentRef = useRef(null);

const modes = ["平倍", "翻倍"]
const bets = [5, 20, 100, 0]
export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        apiLoading: false,
        showAnimation: false,
        //-1无，0:自定义N,1：5,2：20,3:100,
        cur_coin: -1,
        OpenLottery: null,
        user: util.cache.get("user"),
        HXCow: {
          EndBy: 0,
          GameData: 1,
          High: 500000,
          Lows: 1,
          PlayYards: true,
          Remove: false,
          Seal: 5,
          Simple: "哈希牛牛",
          Status: true,
          Text: "游戏维护中",
          Title: "哈希牛牛",
          UpdateBets: false,
          WinTax: 0,
        },
        betResult: [], //--------庄,闲1,闲2,闲3,闲4
        CoinAmount: "",
        //分开存，因为封盘后5秒才能拿到 hash 开奖数值
        lastKai: null,
        maxPrize: 0,
        isDoubleMode: false,
        showInstruction: false,
        showMoreRecord: "",
      }
      this.countDownAreaRef = createRef()
      this.betDrawAreaRef = createRef()
    }
    reloadLimit = 3
    lotteryId = null
    myTimer = null
    get modeName() {
      return modes[this.state.isDoubleMode ? 1 : 0]
    }

    get numberOfBet() {
      const getNumberOfBet = (obj) => Object.values(obj).reduce((acc, cur) => acc + cur, 0)
      return this.state.betResult.length === 0 || !this.state.betResult.some((obj) => Object.keys(obj).length > 0)
        ? 0
        : this.state.betResult.reduce((acc, cur) => acc + getNumberOfBet(cur), 0)
    }

    get amountOfBet() {
      const getAmountOfBet = (obj) => Object.entries(obj).reduce((acc, [k, v]) => acc + parseInt(k) * v, 0)
      return this.state.betResult.length === 0 || !this.state.betResult.some((obj) => Object.keys(obj).length > 0)
        ? 0
        : this.state.betResult.reduce((acc, cur) => acc + getAmountOfBet(cur), 0)
    }

    get prepayOfBet() {
      if (!this.state.isDoubleMode) return 0
      const getPrePayOfBet = (obj) => Object.entries(obj).reduce((acc, [k, v]) => acc + parseInt(k) * v * 2, 0)
      return this.state.betResult.length === 0 || !this.state.betResult.some((obj) => Object.keys(obj).length > 0)
        ? 0
        : this.state.betResult.reduce((acc, cur) => acc + getPrePayOfBet(cur), 0)
    }

    componentDidMount() {
      this.lotteryId = util.getUrlParam("id")
      if (!this.lotteryId) {
        notificationAsync.alert("彩种参数错误，请重新进入").then(() => {
          this.props.router.back()
        })
        return
      }

      const cacheData = util.cache.get("lottery-cache-" + this.lotteryId)
      if (!!cacheData) {
        this.setState({
          OpenLottery: cacheData.OpenLottery,
          lastKai: cacheData.lastKai,
          HXCow: cacheData.HXCow,
          user: cacheData.UserData,
        })
      }
      this.clearCoin()
      this.loadData()
    }

    loadData() {
      if (!!this.myTimer) clearTimeout(this.myTimer)
      getPush({ lotteryid: this.lotteryId, keys: "hxcow,lotteryrate" }).then((res) => {
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        }

        const OpenLottery = res.Data.OpenLottery
        this.countDownAreaRef.current?.start(res.Data)

        const showAnimation = !util.cache.get("lottery-cache-" + this.lotteryId)
        const map = {
          OpenLottery,
          lastKai: OpenLottery.LastKai,
          HXCow: res.Data.HXCow,
          user: res.Data.UserData,
          showAnimation,
        }

        // console.log(new Date(getNumber(OpenLottery.LastKai.KaiTime)));
        //代表无奖旗，封盘
        if (OpenLottery && OpenLottery.NewKai && OpenLottery.NewKai.GameID == "0-000") {
          map["drawState"] = 0
        }

        if (!OpenLottery.LastKai.KaiText) {
          this.myTimer = setTimeout(this.fetchLastKaiText.bind(this), 3000)
          delete map.OpenLottery
          delete map.lastKai
        } else {
          util.cache.set("lottery-cache-" + this.lotteryId, map)
        }
        this.betDrawAreaRef.current?.refresh()
        this.setState(map)
      })
    }

    fetchLastKaiText() {
      getPush({ lotteryid: this.lotteryId, keys: "hxcow" }).then((res) => {
        // 再打一次API
        if (res.Code === 1 && !!res.Data.OpenLottery.LastKai.KaiText) {
          this.setState({ lastKai: res.Data.OpenLottery.LastKai, OpenLottery: res.Data.OpenLottery })
          const map = {
            OpenLottery: res.Data.OpenLottery,
            lastKai: res.Data.OpenLottery.LastKai,
            HXCow: this.state.HXCow,
            user: this.state.UserData,
          }
          util.cache.set("lottery-cache-" + this.lotteryId, map)
          clearTimeout(this.myTimer)
        } else {
          if (!!this.myTimer) clearTimeout(this.myTimer)
          this.myTimer = setTimeout(this.fetchLastKaiText.bind(this), 3000)
        }
      })
    }

    //更新全局的 开奖timer
    reloadNewIssue() {
      this.loadData()
    }

    onBetAreaClick(position) {
      if (this.state.cur_coin === -1) {
        notificationAsync.toast("请输入筹码!", { timeout: 500 })
        return
      }

      if (this.state.cur_coin === 0 && this.state.CoinAmount == "") {
        notificationAsync.toast("请输入投注金额!", { timeout: 500 })
        return
      }

      const betResult = [...this.state.betResult]
      const addAmount = this.state.cur_coin === 0 ? parseInt(this.state.CoinAmount) : bets[this.state.cur_coin - 1]

      if (!betResult[position].hasOwnProperty(addAmount)) betResult[position][addAmount] = 0
      betResult[position][addAmount] += 1
      this.setState({ betResult })
      setTimeout(this.setMaxPrize.bind(this), 0)
    }

    clearCoin() {
      const betResult = new Array(5).fill("").map(() => ({}))
      this.setState({ betResult })
      setTimeout(this.setMaxPrize.bind(this), 0)
    }

    //更新筹码
    updateCoinParent(cur_coin) {
      this.setState({ cur_coin })
    }

    //筹码输入框改变
    onBetAmountChange(CoinAmount) {
      this.setState({
        CoinAmount: CoinAmount,
      })
    }

    //投注送出
    onBetSend() {
      if (this.amountOfBet <= 0) {
        notificationAsync.toast("您尚未投注金额!", { timeout: 500 })
        return
      }

      const betText = this.state.betResult
        .reduce((acc, cur, idx) => {
          if (Object.keys(cur).length > 0) {
            const amount = Object.entries(cur).reduce((sum, [bet, number]) => sum + parseInt(bet) * number * (this.state.isDoubleMode ? 3 : 1), 0)
            const key = idx + (this.state.isDoubleMode ? 6 : 1)
            acc.push(`${key},${amount}`)
          }
          return acc
        }, [])
        .join("|")

      this.setState({ apiLoading: true })
      action
        .post("HxGame/bet", {
          lotteryid: this.lotteryId,
          money: this.amountOfBet + this.prepayOfBet,
          betText: betText,
        })
        .then((res) => {
          this.setState({ apiLoading: false })
          if (res.Code != 1) {
            apiNotification.alert(res, { title: "提示" }, this.props)
          }

          if (res.Code === 1) {
            const user = util.cache.get("user")
            user.Money = res.Data.Balance
            this.setState({ user })

            if (this.betDrawAreaRef.current?.isBetRecord()) this.betDrawAreaRef.current?.refresh()
          }
          toast(res.Message)
          this.clearCoin()
        })
    }

    setMaxPrize() {
      const _times = this.state.isDoubleMode ? 4 : 2
      const getAmount = (obj) => Object.entries(obj).reduce((acc, [k, v]) => acc + parseInt(k) * v, 0)
      const maxPrize = this.state.betResult.reduce((acc, cur, idx) => acc + (idx > 0 ? getAmount(cur) : 0) * _times, 0)
      this.setState({ maxPrize })
    }

    changeGameMode(event) {
      this.setState({ isDoubleMode: event.value })
      setTimeout(this.setMaxPrize.bind(this), 0)
    }

    showHistoryModel(showMoreRecord) {
      this.setState({ showMoreRecord })
    }

    render() {
      const lottoId = util.getUrlParam("id")
      return (
        <LayoutPage
          apiLoading={this.state.apiLoading}
          className="hx-bai-ren-niuniu"
          center="哈希百人牛牛"
          onBack={() => {
            this.props.router.push("/site/home")
          }}
          renderFixed={() => (
            <NiuBetFooter
              maxPrize={this.state.maxPrize}
              isDoubleMode={this.state.isDoubleMode}
              cur_coin={this.state.cur_coin}
              user={this.state.user}
              betResult={this.state.betResult}
              updateCoinParent={this.updateCoinParent.bind(this)}
              onBetAmountChange={this.onBetAmountChange.bind(this)}
              onBetSend={this.onBetSend.bind(this)}
              clearCoin={this.clearCoin.bind(this)}
              bets={bets}
              numberOfBet={this.numberOfBet}
              amountOfBet={this.amountOfBet}
              prepayOfBet={this.prepayOfBet}
            />
          )}
        >
          <div className="bg_area">
            <div className="top_bar">
              <div
                className="intro"
                onClick={() => {
                  this.setState({ showInstruction: true })
                }}
              >
                <div className="intro_ic" />
                <div className="intro_ic_tx">游戏说明</div>
              </div>
              <LastKaiArea lastKai={this.state.lastKai} lottoId={lottoId} animation={this.state.showAnimation} />
            </div>
            <div className="draw_background">
              <BetDrawArea ref={this.betDrawAreaRef} openHistoryModel={this.showHistoryModel.bind(this)} />
              <div style={{ height: "10px" }} />
              <div className="draw_area">
                <div className="first_bar">
                  <div className="switch_area">
                    <div className={`title${this.state.isDoubleMode ? " double" : ""}`}>{this.modeName}投注区</div>
                    <RadioSwitch value={this.state.isDoubleMode} onChange={this.changeGameMode.bind(this)} titles={modes} />
                  </div>

                  <div className={`limit ${this.state.isDoubleMode ? " red" : ""}`}>
                    限注：￥{!this.state.HXCow ? "0" : this.state.isDoubleMode ? "3" : this.state.HXCow.Lows}元 - ￥
                    {this.state.HXCow ? this.state.HXCow.High : "0"}元
                  </div>
                </div>
                <CountDownArea
                  OpenLottery={this.state.OpenLottery}
                  ref={this.countDownAreaRef}
                  reloadNewIssue={this.reloadNewIssue.bind(this)}
                  clearCoin={this.clearCoin.bind(this)}
                />
                <BetTable
                  betResult={this.state.betResult}
                  bets={bets}
                  onBetAreaClick={this.onBetAreaClick.bind(this)}
                  currentCoin={this.state.cur_coin}
                  CoinAmount={this.state.CoinAmount}
                />
              </div>
            </div>
          </div>

          <Modal isOpen={this.state.showInstruction} className="pop-notice-modal" animation="fade">
            <div className="instruction">
              <div className="inner">
                <div
                  className="close-btn"
                  onClick={() => {
                    this.setState({ showInstruction: false })
                  }}
                >
                  <div className="close-icon" />
                  关闭
                </div>
                <img src={util.buildAssetsPath("images/niuniu/home/instruction.png")} />
              </div>
            </div>
          </Modal>
          <ModalPage
            className="record-model"
            isOpen={!!this.state.showMoreRecord}
            animation="lift"
            onClose={() => {
              this.setState({ showMoreRecord: false })
            }}
          >
            {this.state.showMoreRecord !== "" && (
              <HistoryData
                type={this.state.showMoreRecord}
                onClickClose={() => {
                  this.setState({ showMoreRecord: "" })
                }}
                id={this.lotteryId}
              />
            )}
          </ModalPage>
        </LayoutPage>
      )
    }
  }
)
