import React from "react"

import LayoutPage from "@/components/LayoutPage"
import { orderedGames } from "@/config/game"
import util from "@/magic/util"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    gameClick(game) {
      let to = util.getUrlParam("to")

      if (to == "drawHistory") {
        this.props.router.push(`/lottery/record?id=${game.id}&lotteryType=${game.type}`)
      } else if (to == "betHistory") {
        this.props.router.isLoginToOrRedirect(`/lottery/betRecord`, { id: game.id, lotteryType: game.type })
      } else {
        this.props.router.push(`/lottery/home?id=${game.id}&lotteryType=${game.type}`)
      }
    }

    switchGame(games, pickId, beforeId) {
      const _game = games.find((g) => g.id === pickId)
      const _restGames = games.filter((g) => g.id !== pickId)

      if (beforeId === "last") {
        _restGames.push(_game)
      } else if (beforeId === "first") {
        _restGames.unshift(_game)
      } else {
        const _idx = _restGames.findIndex((g) => g.id === beforeId)
        _restGames.splice(_idx + 1, 0, _game)
      }
      return _restGames
    }

    renderType(type) {
      let _games = orderedGames(type)
      if (type === "哈希彩") {
        _games = this.switchGame(_games, "73", "169")
        _games = this.switchGame(_games, "74", "last")
        _games = _games.filter((_game) => _game.name !== "爆倍哈希")
      }

      return _games.map((game, index) => (
        <div key={type + game.type + index} className="item" onClick={this.gameClick.bind(this, game)}>
          {game.name}
        </div>
      ))
    }

    render() {
      let to = util.getUrlParam("to")
      let titles = {
        drawHistory: "开奖记录",
        betHistory: "投注记录",
      }
      // let types = ["极速彩", "境外彩", "香港彩"]
      let types = ["哈希彩", "极速彩", "境外彩", "官方彩", "六合彩"]
      return (
        <LayoutPage right={null} center={titles[to] || "彩种切换"} className="lottery-nav">
          {types.map((type) => {
            return (
              <div className="box" key={type}>
                <div className="hd">{type}系列</div>
                <div className="bd">
                  {this.renderType(type)}
                  {/*{*/}
                  {/*Object.keys(games).map(key => {*/}
                  {/*if(games[key].type2 == type){*/}
                  {/*return <div key={key} className="item" onClick={this.gameClick.bind(this, games[key])}>{games[key].name}</div>*/}
                  {/*}else{*/}
                  {/*return null*/}
                  {/*}*/}
                  {/*})*/}
                  {/*}*/}
                </div>
              </div>
            )
          })}
        </LayoutPage>
      )
    }
  }
)
