import React from "react"
import util from "@/magic/util"
import { Icon } from "react-onsenui"
import "./style.scss"
import config from "@/config/platforms"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import _ from "lodash"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        autoConvert: true,
        convertText: "",
      }
    }
    componentDidMount() {
      getPush({ keys: "apigameset" }).then((res) => {
        let APIGameSet = res.Data.APIGameSet
        let game = config[this.props.platform]
        if (APIGameSet.hasOwnProperty(game.autoConvert + "UserConvert") && !APIGameSet[game.autoConvert + "UserConvert"]) {
          this.setState({ autoConvert: false, convertText: APIGameSet[game.autoConvert + "UserConvertText"] || "test" })
        }
      })
    }

    async checkMultipleGames(platform, tab) {
      let params = {}

      if ("DBGame" === platform || (platform === "ag" && tab === "bet-record")) {
        const typeIndex = await notificationAsync.originAlert(" ", {
          cancelable: true,
          class: "agGameType",
          buttonLabels: ["视讯", "电子", "捕鱼"].concat("DBGame" === platform ? ["电竞"] : []),
        })
        if (typeIndex < 0) return

        if (platform === "ag") {
          params = {
            ...(typeIndex === 0 ? { type: "br" } : typeIndex === 1 ? { type: "ebr" } : { type: "hsr" }),
          }
        } else {
          const game = config[this.props.platform]
          if (game.games && game.games.some((_game) => _game.params?.lotteryId)) {
            const filterGames = game.games.filter((_game) => _game.params?.lotteryId)
            filterGames.some((game) => {
              if (game.name.includes(buttonLabels[typeIndex])) {
                params = _.pick(game.params, "lotteryId")
                return true
              } else {
                return false
              }
            })

            if (Object.keys(params).length === 0 && util.getUrlParam("lotteryId") && game.lotteryId) {
              params = { lotteryId: game.lotteryId }
            }
          }
        }
      }
      return params
    }

    async onClick(tab) {
      let platform = this.props.platform

      if (tab == "home") {
        this.props.router.push(`/thirdGame/home?platform=${platform}`)
        return
      } else if (tab == "report") {
        this.props.router.isLoginToOrRedirect(`/thirdGame/report`, { platform })
        return
      } else if (tab == "transfer" && !util.isLogin()) {
        this.props.router.push("/site/login")
        return
      } else if (tab == "transfer" && !this.state.autoConvert) {
        return notificationAsync.alert(this.state.convertText, { title: "额度免转" })
      }

      const params = await this.checkMultipleGames(platform, tab)
      if (!params) return

      if (tab == "transfer") {
        const url = util.isLogin()
          ? `/thirdGame/wallet?platform=${platform}${Object.keys(params).length > 0 ? "&params=" + JSON.stringify(params) : ""}`
          : "/site/login"
        this.props.router.push(url)
      } else if (tab == "transfer-record") {
        this.props.router.isLoginToOrRedirect(`/thirdGame/transferRecord`, { platform, ...params })
      } else if (tab == "bet-record") {
        this.props.router.isLoginToOrRedirect(`/thirdGame/betRecord`, { platform, ...params })
      }
    }
    render() {
      return (
        <div className="home-navigator-bar">
          <div className={`download-app tab ${this.props.active == "home" ? "active" : ""}`} onClick={this.onClick.bind(this, "home")}>
            <div className="icon">
              <Icon icon="ion-flag" />
            </div>
            <div className="text">大厅</div>
          </div>
          <div
            className={`shop tab ${this.props.active == "transfer" ? "active" : ""}`}
            onClick={() => {
              util.trialCheck()
              this.onClick("transfer")
            }}
          >
            <div className="icon">
              <Icon icon="ion-arrow-swap" />
            </div>
            <div className="text">{this.state.autoConvert ? "额度" : "额度免转"}</div>
          </div>
          <div
            className={`user-center tab ${this.props.active == "transfer-record" ? "active" : ""}`}
            onClick={() => {
              util.trialCheck()
              this.onClick("transfer-record")
            }}
          >
            <div className="icon">
              <Icon icon="ion-clipboard" />
            </div>
            <div className="text">转换记录</div>
          </div>
          <div
            className={`go-old-version tab ${this.props.active == "bet-record" ? "active" : ""}`}
            onClick={() => {
              util.trialCheck()
              this.onClick("bet-record")
            }}
          >
            <div className="icon">
              <Icon icon="ion-document-text" />
            </div>
            <div className="text">注单</div>
          </div>
          <div className={`interaction tab ${this.props.active == "report" ? "active" : ""}`} onClick={this.onClick.bind(this, "report")}>
            <div className="icon">
              <Icon icon="ion-stats-bars" />
            </div>
            <div className="text">统计</div>
          </div>
        </div>
      )
    }
  }
)
