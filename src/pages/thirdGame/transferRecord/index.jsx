import React from "react"
import { withRouter } from "@/magic/withRouter"
import util from "@/magic/util"
import GameNavigatorBar from "@/components/GameNavigatorBar"
import config from "@/config/platforms"
import "./style.scss"
import RecordPage from "@/components/RecordPage"

@withRouter
export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.platform = util.getUrlParam("platform")
    this.config = config[this.platform]
    this.state = {
      lotteryId: util.getUrlParam("lotteryId"),
    }
  }

  componentDidUpdate(preProps) {
    if (preProps.route.query.lotteryId != this.props.route.query.lotteryId) {
      this.setState({ lotteryId: this.props.route.query.lotteryId })
    }
  }

  render() {
    let platformCofig = this.config
    let title = platformCofig.altTitle || platformCofig.title
    let listConfig = {
      name: platformCofig.title + "转换记录",
      listApi: platformCofig.transferRecordApi.url,
      listApiMethod: platformCofig.transferRecordApi.method,
      renderRow: (row, data) => {
        return (
          <div className="record-item">
            <p className="tl">
              转换金额: {row.Money}元 <span className="right money">{row.Type == 0 ? "转出" : "转入"}</span>
            </p>
            <p className="dd">
              <span style={{ width: "100%" }}>时间：{util.date.format(util.date.toDate(row.Time), "YYYY-MM-DD hh:mm:ss")}</span>
            </p>
          </div>
        )
      },
    }

    console.log({ params: platformCofig.transferRecordApi })

    if (platformCofig.transferRecordApi.params) {
      let filter = []
      const lotteryId = this.state.lotteryId //子遊戲的params
      const _params = !lotteryId ? platformCofig.transferRecordApi.params : Object.assign({}, platformCofig.transferRecordApi.params, { lotteryId })
      for (let key in _params) {
        let obj = {}
        obj.key = key
        obj.defaultValue = _params[key]
        obj.type = "hidden"
        filter.push(obj)
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
        key={this.state.lotteryId}
        className="third-game-transferRecord"
        config={{
          tabs: [listConfig],
        }}
        center={`${title}-转换记录`}
        renderFixed={() => <GameNavigatorBar active="transfer-record" platform={this.platform} />}
      />
    )
  }
}
