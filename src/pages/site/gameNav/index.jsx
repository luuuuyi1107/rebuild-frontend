import React from "react"

import LayoutPage from "@/components/LayoutPage"
import games from "@/config/platforms"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import _ from "lodash"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    async onClick(platform, game) {
      if (platform == "ag" || platform === "DBGame") {
        const typeIndex = await notificationAsync.originAlert(" ", {
          class: "agGameType",
          buttonLabels: ["视讯", "电子", "捕鱼"].concat("DBGame" === platform ? ["电竞"] : []),
        })
        if (typeIndex < 0) return
        if (platform === "ag") {
          const typeObj = typeIndex === 0 ? { type: "br" } : typeIndex === 1 ? { type: "ebr" } : { type: "hsr" }
          this.props.router.isLoginToOrRedirect(`/thirdGame/betRecord`, { platform, ...typeObj })
        } else {
          const _game = game.games.find((_game) => _game.name.includes(buttonLabels[typeIndex]))
          if (!_game) return
          const params = _game.params || {}
          this.props.router.isLoginToOrRedirect(`/thirdGame/betRecord`, { platform, ..._.pick(params, "lotteryId") })
        }
      } else {
        this.props.router.isLoginToOrRedirect(`/thirdGame/betRecord`, { platform })
      }
    }

    render() {
      return (
        <LayoutPage right={null} center={"下注记录"} className="game-nav">
          <div className="box">
            <div className="hd">彩票游戏</div>
            <div className="bd">
              <div
                className="item"
                onClick={() => {
                  this.props.router.isLoginToOrRedirect(`/interaction/broadcastShareBet`, { closeShare: "true" })
                }}
              >
                <i className={`game-icon lottery-icon`} />
                彩票游戏
              </div>
            </div>
          </div>
          <div className="box">
            <div className="hd">第三方游戏</div>
            <div className="bd">
              {Object.keys(games).map((key) => {
                return (
                  <div
                    key={key}
                    className="item"
                    onClick={() => {
                      this.onClick(key, games[key])
                    }}
                  >
                    <i className={`game-icon ${key}-icon`} />
                    {games[key].title}
                  </div>
                )
              })}
            </div>
          </div>
          {/*{*/}
          {/*types.map(type => {*/}
          {/*return <div className="box" key={type}>*/}
          {/*<div className="hd">{type}系列</div>*/}
          {/*<div className="bd">*/}
          {/*{this.renderType(type)}*/}
          {/*/!*{*!/*/}
          {/*/!*Object.keys(games).map(key => {*!/*/}
          {/*/!*if(games[key].type2 == type){*!/*/}
          {/*/!*return <div key={key} className="item" onClick={this.gameClick.bind(this, games[key])}>{games[key].name}</div>*!/*/}
          {/*/!*}else{*!/*/}
          {/*/!*return null*!/*/}
          {/*/!*}*!/*/}
          {/*/!*})*!/*/}
          {/*/!*}*!/*/}
          {/*</div>*/}
          {/*</div>*/}
          {/*})*/}
          {/*}*/}
        </LayoutPage>
      )
    }
  }
)
