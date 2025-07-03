import React from "react"

import { withRouter } from "@/magic/withRouter"
import util from "@/magic/util"
import GameNavigatorBar from "@/components/GameNavigatorBar"
import platformMap from "@/config/platforms"
import "./style.scss"
import RecordPage from "@/components/RecordPage"
import { generatePGSeries, generateAgSeries, agNameMap } from "./records"

@withRouter
export default class extends React.PureComponent {
  constructor() {
    super()
    this.platformId = util.getUrlParam("platform")
    // this.type = util.getUrlParam("type")
    this.config = platformMap[this.platformId]
    this.state = {
      lotteryId: util.getUrlParam("lotteryId"),
      type: util.getUrlParam("type"),
    }
  }

  componentDidUpdate(preProps) {
    if (preProps.route.query.lotteryId != this.props.route.query.lotteryId) {
      this.setState({ lotteryId: util.getUrlParam("lotteryId") })
    }

    if (preProps.route.query.type != this.props.route.query.type) {
      this.setState({ type: util.getUrlParam("type") })
    }
  }

  renders = {
    ag: function (row, data) {
      return generateAgSeries(row)
    },
    br: function (row, data) {
      return generateAgSeries(row)
    },
    ebr: function (row, data) {
      return (
        <div className="record-item">
          <p className="tl">时间：{util.date.format(util.date.toDate(row.betTime), "YYYY-MM-DD hh:mm:ss")}</p>
          <p className="dd">
            {row.gameType && <span>名称：{row.gameType}</span>}
            {row.slottype && <span>老虎机：{row.slottype}</span>}
            {typeof row.betAmount != undefined && (
              <span>
                投注：<font color="#333">&yen;&nbsp;{util.formatNumber(row.betAmount)}</font>
              </span>
            )}
            {typeof row.netAmount != undefined && (
              <span>
                盈亏：<font color="#5e0ea0">&yen;&nbsp;{util.formatNumber(row.netAmount)}</font>
              </span>
            )}
          </p>
        </div>
      )
    },
    hsr: function (row, data) {
      return (
        <div className="record-item">
          <p className="tl">时间：{util.date.format(util.date.toDate(row.creationTime), "YYYY-MM-DD hh:mm:ss")}</p>
          <p className="dd">
            {row.Cost && <span>子弹数：{row.Cost}</span>}
            {row.Earn && <span>鱼价值：{row.Earn}</span>}
            {typeof row.Win != undefined && (
              <span>
                盈亏：<font color="#5e0ea0">&yen;&nbsp;{util.formatNumber(row.Win)}</font>
              </span>
            )}
          </p>
        </div>
      )
    },
    ky: function (row, data) {
      return (
        <div className="record-item">
          <p className="tl">时间：{util.date.format(util.date.toDate(row.GameEndTime), "YYYY-MM-DD hh:mm:ss")}</p>
          <p className="dd">
            {row.GameType && <span>名称：{row.GameType}</span>}
            {row.RoomName && <span>房间：{row.RoomName}</span>}
            {typeof row.AllBet != undefined && (
              <span>
                投注：<font color="#333">&yen;&nbsp;{row.AllBet}</font>
              </span>
            )}
            {typeof row.Profit != undefined && (
              <span>
                盈亏：<font color="#5e0ea0">&yen;&nbsp;{row.Profit}</font>
              </span>
            )}
          </p>
        </div>
      )
    },
    le: function (row, data) {
      return (
        <div className="record-item">
          <p className="tl">时间：{util.date.format(util.date.toDate(row.GameEndTime), "YYYY-MM-DD hh:mm:ss")}</p>
          <p className="dd">
            {row.GameType && <span>名称：{row.GameType}</span>}
            {row.RoomName && <span>房间：{row.RoomName}</span>}
            {typeof row.AllBet != undefined && (
              <span>
                投注：<font color="#333">&yen;&nbsp;{row.AllBet}</font>
              </span>
            )}
            {typeof row.Profit != undefined && (
              <span>
                盈亏：<font color="#5e0ea0">&yen;&nbsp;{row.Profit}</font>
              </span>
            )}
          </p>
        </div>
      )
    },
    sg: function (row, data) {
      return (
        <div className="record-item">
          <p className="tl">时间：{util.date.format(util.date.toDate(row.Created), "YYYY-MM-DD hh:mm:ss")}</p>
          <p className="dd">
            {row.League && <span style={{ width: "100%" }}>赛事：{row.League}</span>}
            {row.Tname_Home && <span style={{ width: "100%" }}>主场：{row.Tname_Home}</span>}
            {row.Tname_Away && <span style={{ width: "100%" }}>客场：{row.Tname_Away}</span>}
            {row.Ioratio && <span>比率：{row.Ioratio}</span>}
            {row.Result_Score && <span>比分：{row.Result_Score}</span>}
            {typeof row.BetAmount != undefined && (
              <span>
                投注：<font color="#333">&yen;&nbsp;{row.BetAmount}</font>
              </span>
            )}
            {typeof row.PayOut != undefined && (
              <span>
                盈亏：<font color="#5e0ea0">&yen;&nbsp;{row.PayOut}</font>
              </span>
            )}
          </p>
        </div>
      )
    },
    sb: function (row, data) {
      let status = ""
      switch (row.flag) {
        case 0:
          status = "未结算"
          break
        case 1:
          status = "已结算"
          break
      }
      return (
        <div className="record-item">
          <p className="tl">时间：{util.date.format(util.date.toDate(row.betTime), "YYYY-MM-DD hh:mm:ss")}</p>
          <p className="dd">
            {row.remark && <span>名称：{row.remark}</span>}
            {status && <span>状态：{status}</span>}
            {typeof row.betAmount != undefined && (
              <span>
                投注：<font color="#333">&yen;&nbsp;{row.betAmount}</font>
              </span>
            )}
            {typeof row.netAmount != undefined && (
              <span>
                盈亏：<font color="#5e0ea0">&yen;&nbsp;{row.netAmount}</font>
              </span>
            )}
          </p>
          {/*<p className="dd"> */}
          {/*    {row.League && <span style={{width: "100%"}}>赛事：{row.League}</span>}*/}
          {/*    {row.Tname_Home && <span style={{width: "100%"}}>主场：{row.Tname_Home}</span>}*/}
          {/*    {row.Tname_Away && <span style={{width: "100%"}}>客场：{row.Tname_Away}</span>}*/}
          {/*    {row.Ioratio && <span>比率：{row.Ioratio}</span>}*/}
          {/*    {row.Result_Score && <span>比分：{row.Result_Score}</span>}*/}
          {/*    {typeof row.BetAmount !=undefined && <span>投注：<font color="#333">&yen;&nbsp;{row.BetAmount}</font></span>}*/}
          {/*    {typeof row.PayOut !=undefined && <span>盈亏：<font color="#5e0ea0">&yen;&nbsp;{row.PayOut}</font></span>}*/}
          {/*</p>*/}
        </div>
      )
    },
    PG(row, data) {
      return generatePGSeries(row)
    },
    BAOBEI(row, data) {
      const statusMap = {
        0: "待开奖",
        1: "已中奖",
        2: "未中奖",
      }

      return (
        <div className="record-item grid grid-cols-2">
          <div className="col-span-2">名称: {row.LotteryName}</div>

          <div>期数: {row.GameID}</div>
          <div>{util.date.format(util.date.toDate(row.BetTime), "YYYY-MM-DD hh:mm:ss")}</div>

          <div>金额: {row.BetMoney}</div>
          <div>奖金: {row.Bonus}</div>

          <div>玩法: {row.PlayType}</div>
          <div>状态: {statusMap[row.Status] || row.Status}</div>

          <div className="col-span-2">注单: {row.BetText}</div>
        </div>
      )
    },
    BOYACHESS(row, data) {
      let resultMap = {
        LOSE: "输",
        WIN: "赢",
        DRAW: "平",
      }
      return (
        <div className="record-item">
          <div className="flex items-center mb-1">
            <div className="flex-1">
              时间：{util.date.format(util.date.toDate(row.Created), "YYYY-MM-DD hh:mm:ss")}
              <span className="right money">{resultMap[row.BetResult] || row.BetResult}</span>
            </div>
            <div className="flex-1">平台：{row.PlatformId}</div>
          </div>
          <div className="grid grid-cols-3">
            <div>游戏名称：{row.GameName}</div>
            <div>投注金额：{row.BetAmount || 0}</div>
            <div style={{ color: row.NetAmount >= 0 ? "red" : "green" }}>盈亏：{row.NetAmount || 0}</div>
          </div>
          {row.Content && <div className="w-full">{row.Content}</div>}
        </div>
      )
    },
    SPB(row) {
      return generatePGSeries(row)
    },

    others: function (row, data) {
      const params =
        row.PlatformId === "PM"
          ? { 2: "走水", 3: "输", 4: "赢", 5: "赢半", 6: "输半", 7: "赛事取消", 8: "赛事延期" }
          : row.PlatformId === "DB电竞"
          ? { 1: "待确认", 2: "已拒绝", 3: "待结算", 4: "已取消", 5: "赢", 6: "输", 7: "已撤销", 8: "赢半", 9: "输半", 10: "走水" }
          : {}

      const betResult = /^[0-9]+$/.test(row.BetResult) ? Number(row.BetResult) : row.BetResult
      let resultMap = {
        LOSE: "输",
        WIN: "赢",
        DRAW: "平",
        ...params,
      }
      return (
        <div className="record-item">
          <p className="tl">
            时间：{util.date.format(util.date.toDate(row.Created), "YYYY-MM-DD hh:mm:ss")}
            {betResult !== "" && <span className="right money">{resultMap[betResult] || betResult}</span>}
          </p>
          <p className="dd">
            <span style={{ width: "33%" }}>平台：{row.PlatformId}</span>
            {<span style={{ width: "33%" }}>投注金额：{row.BetAmount || 0}</span>}
            {<span style={{ width: "33%", color: row.NetAmount >= 0 ? "red" : "green" }}>盈亏：{row.NetAmount || 0}</span>}
            {row.Content && <span style={{ width: "100%" }}>{row.Content}</span>}
          </p>
        </div>
      )
    },
  }

  render() {
    let platformCofig = this.config
    let title = platformCofig.altTitle || platformCofig.title
    let betRecordApi = platformCofig.betRecordApi

    if (this.platformId === "ag" && !!this.state.type && agNameMap[this.state.type]) {
      title = "PA" + agNameMap[this.state.type]
    }

    let listConfig = {
      name: platformCofig.title + "投注记录",
      listApi: betRecordApi.url,
      listApiMethod: betRecordApi.method,
      renderRow: this.renders[this.platformId] || this.renders.others,
    }

    if (betRecordApi.params) {
      if (this.state.type) {
        betRecordApi.params.type = this.state.type
        listConfig.renderRow = this.renders[this.state.type]
      }
      let filter = []

      const lotteryId = this.state.lotteryId //子游戏的params
      const _params = !lotteryId ? platformCofig.transferRecordApi.params : Object.assign({}, platformCofig.transferRecordApi.params, { lotteryId })

      for (let key in _params) {
        let obj = {}
        obj.key = key
        obj.defaultValue = _params[key]
        obj.type = "hidden"
        filter.push(obj)
      }

      if (util.getUrlParam("type")) {
        filter.push({
          key: "type",
          defaultValue: util.getUrlParam("type"),
          type: "hidden",
        })
      }

      listConfig.filter = filter

      if (lotteryId) {
        platformCofig.games.some((game) => {
          if (game.params?.lotteryId == lotteryId && game.params?.title) {
            title = game.params.title
            return true
          }
          return false
        })
      }
    }

    return (
      <RecordPage
        key={this.state.lotteryId + "_" + this.state.type}
        className="third-game-betRecord"
        config={{
          tabs: [listConfig],
        }}
        center={`${title}-投注记录`}
        renderFixed={() => <GameNavigatorBar active="bet-record" platform={this.platformId} />}
      />
    )
  }
}
