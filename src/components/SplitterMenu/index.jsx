import React from "react"
import { Icon, Page, List, ListItem, Button } from "react-onsenui"
import CustomIcon from "@/components/CustomIcon"
import util from "@/magic/util"
import thirdGames from "@/config/platforms"
import pkGames from "@/config/pkGames"
import "./style.scss"
import config from "@/config/config"
import * as apiNotification from "@/magic/ApiNotification"
import * as action from "@/action"
import { orderedGames } from "@/config/game"
import { withRouter } from "@/magic/withRouter"
import { userLogout } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        level2: null,
      }
    }
    lotteryGameClick(lotteryGame) {
      console.log(lotteryGame.route)

      this.props.router.push(lotteryGame.route ? lotteryGame.route : `/lottery/home?id=${lotteryGame.id}`)
    }
    thirdGameClick(platformId, thirdGame) {
      this.props.router.push(`/thirdGame/home?platform=${platformId}`)
    }
    pkGameClick(link) {
      this.props.router.push(`/${link}/home`)
    }

    renderType(type) {
      return orderedGames(type).map((game, index) => (
        <div key={type + game.type + index} className="item" onClick={this.lotteryGameClick.bind(this, game)}>
          {game.name}
          <Icon icon="ion-ios-arrow-forward" style={{ fontSize: 16 }} />
        </div>
      ))
    }

    renderLotteryMenu() {
      let types = ["哈希彩", "极速彩", "境外彩", "官方彩", "六合彩"]
      return (
        <div>
          {types.map((type) => {
            return (
              <div className="box" key={type}>
                <div className="title">{type}系列</div>
                <div className="bd">{this.renderType(type)}</div>
              </div>
            )
          })}
        </div>
      )
    }
    renderThirdGameMenu() {
      let types = ["真人", "体育", "棋牌", "对战", "电子"]
      return (
        <div>
          {types.map((type) => {
            if (type != "对战") {
              return (
                <div className="box" key={type}>
                  <div className="title">{type}</div>
                  <div className="bd">
                    {Object.keys(thirdGames).map((key) => {
                      if (thirdGames[key].tags.indexOf(type) > -1) {
                        return (
                          <div key={key} className="item" onClick={this.thirdGameClick.bind(this, key, thirdGames[key])}>
                            {thirdGames[key].title}
                            <Icon icon="ion-ios-arrow-forward" style={{ fontSize: 16 }} />
                          </div>
                        )
                      } else {
                        return null
                      }
                    })}
                  </div>
                </div>
              )
            } else {
              return (
                <div className="box" key="pkGame">
                  <div className="title">{type}</div>
                  <div className="bd">
                    {Object.keys(pkGames).map((key) => {
                      return (
                        <div key={key} className="item" onClick={this.pkGameClick.bind(this, pkGames[key].link)}>
                          {pkGames[key].title}
                          <Icon icon="ion-ios-arrow-forward" style={{ fontSize: 16 }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }
          })}
        </div>
      )
    }

    async loadBankCard() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login")
      } else {
        let bankCardRes = await action.post("User/GetBank")
        if (bankCardRes.Code != 1) {
          apiNotification.alert(bankCardRes, {}, this.props)
          return
        }

        if (bankCardRes.Code == 1) {
          if (bankCardRes.Data.length == 0) {
            notificationAsync.alert("请先设置银行卡", { title: "操作提示" }).then(() => {
              this.props.router.push("/site/setBankCard")
            })
          } else {
            this.props.router.push("/site/withdraw")
          }
        }
      }
    }

    onMenuClick(item) {
      if (item.switchLottery) {
        this.setState({ level2: "lottery" })
        this.props.onOpenMore()
      }
      if (item.switchThirdGame) {
        this.setState({ level2: "thirdGame" })
        this.props.onOpenMore()
      }
      if (item.trialCheck) {
        util.trialCheck()
      }
      if (item.path) {
        if (item.withLogin) {
          if (item.withBankCard) {
            this.loadBankCard()
          } else {
            this.props.router.isLoginToOrRedirect(item.path)
          }
        } else {
          this.props.router.push(item.path)
        }
      }
      if (item.serviceLink) {
        util.callService()
      }
      if (item.logout) {
        action.apiHandler(() => userLogout()).then(() => this.props.router.push("/site/login"))
      }
    }

    render() {
      let menus1 = [
        { label: "彩种切换", icon: <Icon icon="ion-fireball" style={{ fontSize: ".4rem" }} />, switchLottery: true }, //path: ["lottery", "nav", {to: "bet"}]
        { label: "游戏切换", icon: <Icon icon="ion-ios-game-controller-b" style={{ fontSize: ".4rem" }} />, switchThirdGame: true },
        { label: "返回首页", icon: <Icon icon="ion-android-home" style={{ fontSize: ".4rem" }} />, path: "/site/home" }, //
        { label: "永久域名", icon: <Icon icon="ion-planet" style={{ fontSize: ".4rem" }} />, value: config.domain },
      ]
      let menus2 = [
        { label: "个人中心", icon: <Icon icon="ion-person" style={{ fontSize: ".4rem" }} />, path: "/site/my", withLogin: true },
        {
          label: "在线充值",
          icon: <CustomIcon style={{ height: ".32rem", width: ".32rem" }} type={require("./icons/deposit.svg")} />,
          path: "/site/depositCenter",
          withLogin: true,
          trialCheck: true,
        },
        {
          label: "在线提款",
          icon: <CustomIcon style={{ height: ".32rem", width: ".32rem" }} type={require("./icons/withdraw.svg")} />,
          path: "/site/withdraw",
          withLogin: true,
          withBankCard: true,
          trialCheck: true,
        },
        // {label: "联系客服", icon: <Icon icon='ion-android-contacts' style={{fontSize: ".4rem"}}/>, path: ["site", "service"]},
        { label: "联系客服", icon: <Icon icon="ion-android-contacts" style={{ fontSize: ".4rem" }} />, serviceLink: true },
      ]
      if (util.isLogin()) {
        menus2.push({ label: "退出", icon: <Icon icon="ion-android-exit" style={{ fontSize: ".4rem" }} />, logout: true })
      }
      return (
        <Page className="splitter-menu">
          <div className="hd">
            <img src={util.buildAssetsPath("assets/logo.gif")} />
          </div>
          <div className={`bd ${this.props.openLevel == 2 ? "two-level" : ""}`}>
            <div className="level1">
              <List
                dataSource={menus1}
                renderRow={(item) => (
                  <ListItem key={item.label} onClick={this.onMenuClick.bind(this, item)}>
                    <div className="left">{item.icon}</div>
                    <div className="center text-12px">{item.label}</div>
                    <div className="right">
                      {item.value ? (
                        <span className="highlight">{item.value}</span>
                      ) : (
                        <Icon icon="ion-ios-arrow-forward" style={{ fontSize: ".32rem" }} />
                      )}
                    </div>
                  </ListItem>
                )}
              />
              <div className="sized-box h-[.2rem]"></div>
              <List
                dataSource={menus2}
                renderRow={(item) => (
                  <ListItem key={item.label} onClick={this.onMenuClick.bind(this, item)}>
                    <div className="left">{item.icon}</div>
                    <div className="center text-12px">{item.label}</div>
                    <div className="right">
                      {item.value ? <span className="highlight">{item.value}</span> : <Icon icon="ion-ios-arrow-forward" style={{ fontSize: 16 }} />}
                    </div>
                  </ListItem>
                )}
              />
              {!util.isLogin() && (
                <div className="foot">
                  <Button
                    className="!text-12px leading-loose"
                    onClick={() => {
                      this.props.router.push("/site/login")
                    }}
                  >
                    登录
                  </Button>
                  <Button
                    className="!text-12px leading-loose"
                    onClick={() => {
                      this.props.router.push("/site/login")
                    }}
                    modifier="outline"
                  >
                    立即注册
                  </Button>
                </div>
              )}
            </div>
            <div className="level2">
              <div className="inner-menu-bg" onClick={this.props.onCloseMore}></div>
              <div className="inner-menu">
                {this.state.level2 == "lottery" && this.renderLotteryMenu()}
                {this.state.level2 == "thirdGame" && this.renderThirdGameMenu()}
              </div>
            </div>
          </div>
        </Page>
      )
    }
  }
)
