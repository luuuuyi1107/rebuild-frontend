import LayoutPage from "@/components/LayoutPage"
import React from "react"
import { Button, Icon } from "react-onsenui"

import * as action from "@/action"
import util from "@/magic/util"
import "./style.scss"

import { gameList } from "@/config/game"
import pkGames from "@/config/pkGames"
import thirdGames from "@/config/platforms"
import { withRouter } from "@/magic/withRouter"
import _ from "lodash"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.closeShare = util.getUrlParam("closeShare")
      this.state = {
        loading: true,
        beginTime: util.date.format(new Date(), "YYYY-MM-DD"),
        endTime: util.date.format(new Date(), "YYYY-MM-DD"),
        gameType: "全部",
        LotteryName: "全部",
        gamesPopBox: false,
        shareData: null,
        lotteryId: 0,
      }
    }
    componentDidMount() {
      this.search()
    }

    async search() {
      alert("SEARCH")
      let beginTime = this.state.beginTime
      let endTime = this.state.endTime
      beginTime = beginTime.replace(/\-/g, "")
      endTime = endTime.replace(/\-/g, "")
      let res = await action.post("Lottery/GetCount", { lotteryID: this.state.lotteryId, startTime: beginTime, endTime: endTime })
      if (res.Code != 1) {
        notificationAsync.alert(res, {}, this.props)
      }
      this.setState({ shareData: res.Data })
    }
    async share() {
      let beginTime = this.state.beginTime
      let endTime = this.state.endTime
      beginTime = beginTime.replace(/\-/g, "")
      endTime = endTime.replace(/\-/g, "")
      let text = this.state.lotteryId + "|" + beginTime + "|" + endTime
      let res = await action.post("User/SendBroadcast", { type: 2, text: text })
      if (res.Code != 1) {
        notificationAsync.alert(res.Message, {}, this.props)
      } else {
        notificationAsync.alert(res.Message, { title: " 恭喜您!" }).then(() => {
          this.props.router.back()
        })
      }
    }

    onFilterChange(opt) {
      if (opt.beginTime) {
        opt.beginTime = util.date.format(new Date(opt.beginTime), "YYYY-MM-DD")
        this.setState({ beginTime: opt.beginTime })
      }
      if (opt.endTime) {
        opt.endTime = util.date.format(new Date(opt.endTime), "YYYY-MM-DD")
        this.setState({ endTime: opt.endTime })
      }
    }

    get thirdGameList() {
      const thirdGameData = Object.values(thirdGames)
      thirdGameData.forEach((item) => {
        if (item.games?.some((game) => !!game.params?.tags)) {
          item.games
            .filter((game) => !!game.params?.tags)
            .forEach((game) => {
              const _platform = _.cloneDeep(item)
              _platform.title = game.name
              if (_platform.altTitle) delete _platform.altTitle
              if (!!game.params.lotteryId) _platform.lotteryId = game.params.lotteryId
              _platform.tags = game.params.tags
              Object.values(_platform).forEach((param) => {
                _.has(param, "params.lotteryId") && (param.params.lotteryId = game.params.lotteryId)
              })
              thirdGameData.push(_platform)
            })
        }
      })

      const gameComponent = (ikey, item) => (
        <div key={ikey + item.lotteryId} className="gameItem" onClick={(e) => this.gameChoose(e, item.lotteryId, item.title)}>
          {item.title}
        </div>
      )

      return {
        card: thirdGameData.filter((game) => game.tags.includes("棋牌")).map(gameComponent.bind(this, "card")),
        casino: thirdGameData.filter((game) => game.tags.includes("真人") || game.tags.includes("体育")).map(gameComponent.bind(this, "casino")),
        slot: thirdGameData.filter((game) => game.tags.includes("电子")).map(gameComponent.bind(this, "slot")),
      }
    }

    renderGameItem() {
      let type = this.state.gameType
      let ret = []
      let pkGameData = Object.values(pkGames)
      switch (type) {
        case "全部":
          break
        case "彩票":
          ret = gameList.map((lotto) => (
            <div key={"lotto" + lotto.id} className="gameItem" onClick={(e) => this.gameChoose(e, lotto.id, lotto.name)}>
              {lotto.name}
            </div>
          ))
          break
        case "视讯":
          ret = this.thirdGameList.casino
          break
        case "电子":
          ret = this.thirdGameList.slot
          break
        case "棋牌":
          ret = this.thirdGameList.card
          pkGameData.map((pkGame) => {
            if (pkGame.lotteryId) {
              ret.push(
                <div key={"pkGame" + pkGame.lotteryId} className="gameItem" onClick={(e) => this.gameChoose(e, pkGame.lotteryId, pkGame.title)}>
                  {pkGame.title}
                </div>
              )
            }
          })
          break
      }

      return ret
    }

    gameTypeChoose(e, type) {
      if (this.state.gameType != type) {
        this.setState({ gameType: type })
        if (type == "全部") {
          this.gameChoose(e, 0, "全部")
        }
      }
      e.stopPropagation()
      e.preventDefault()
    }

    gameChoose(e, id, name) {
      this.setState({ lotteryId: id, LotteryName: name, gamesPopBox: false })
      e.stopPropagation()
      e.preventDefault()
    }

    render() {
      return (
        <LayoutPage className="share-more-page" center="更多战绩" right={null} apiLoading={this.state.apiLoading}>
          <div className="content">
            <div className="filter">
              <span className="title">时间</span>
              {/*<InputBox prefix="ion-ios-locked-outline" placeholder=""  type="date" name="startDay"*/}
              {/*onChange={ value => {this.setState({oldPassword: value})}} value={this.state.oldPassword}/>*/}
              <div className="beginTime fitem">
                <span>{this.state.beginTime}</span>
                <Icon icon="ion-android-arrow-dropdown" />
                <input type="date" onChange={(e) => this.onFilterChange({ beginTime: e.target.value })} />
              </div>
              <span style={{ marginRight: 5, marginLeft: -5 }}>至</span>
              <div className="endTime fitem">
                <span>{this.state.endTime}</span>
                <Icon icon="ion-android-arrow-dropdown" />
                <input type="date" onChange={(e) => this.onFilterChange({ endTime: e.target.value })} />
              </div>
            </div>
            <div
              className="item"
              onClick={() => {
                this.setState({ gamesPopBox: true })
              }}
            >
              <span className="title">彩种</span>
              <span className="right">{this.state.LotteryName}</span>
              <Icon icon="ion-android-arrow-dropdown" />
            </div>
            {this.state.shareData && (
              <div className="shareData">
                <div className="item">
                  <span className="title">投注</span>
                  <span className="right">{this.state.shareData.BetMoney}</span>
                </div>
                <div className="item">
                  <span className="title">派彩</span>
                  <span className="right">{this.state.shareData.WinMoney}</span>
                </div>
                <div className="item">
                  <span className="title">盈亏</span>
                  <span className="right">{(this.state.shareData.WinMoney - this.state.shareData.BetMoney).toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className="submit">
              <Button
                onClick={() => {
                  this.search()
                }}
              >
                查询
              </Button>
              <Button
                onClick={() => {
                  this.share()
                }}
              >
                分享
              </Button>
            </div>
            {/*<div className="submit"><Button onClick={()=>{this.share()}}>分享</Button></div>*/}
          </div>
          {this.state.gamesPopBox && (
            <div
              className="gamesPopBox"
              onClick={() => {
                this.setState({ gamesPopBox: false })
              }}
            >
              <div className="popBoxContent">
                <div className="top">
                  <div
                    className={`gameType ${this.state.gameType == "全部" ? "on" : ""}`}
                    onClick={(e) => {
                      this.gameTypeChoose(e, "全部")
                    }}
                  >
                    全部
                  </div>
                  <div
                    className={`gameType ${this.state.gameType == "彩票" ? "on" : ""}`}
                    onClick={(e) => {
                      this.gameTypeChoose(e, "彩票")
                    }}
                  >
                    彩票
                  </div>
                  <div
                    className={`gameType ${this.state.gameType == "视讯" ? "on" : ""}`}
                    onClick={(e) => {
                      this.gameTypeChoose(e, "视讯")
                    }}
                  >
                    视讯
                  </div>
                  <div
                    className={`gameType ${this.state.gameType == "电子" ? "on" : ""}`}
                    onClick={(e) => {
                      this.gameTypeChoose(e, "电子")
                    }}
                  >
                    电子
                  </div>
                  <div
                    className={`gameType ${this.state.gameType == "棋牌" ? "on" : ""}`}
                    onClick={(e) => {
                      this.gameTypeChoose(e, "棋牌")
                    }}
                  >
                    棋牌
                  </div>
                </div>
                <div className="bottom">
                  {this.renderGameItem()}
                  {/*<div className="gameItem"></div>*/}
                </div>
              </div>
            </div>
          )}
        </LayoutPage>
      )
    }
  }
)
