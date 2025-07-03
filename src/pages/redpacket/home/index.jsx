import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import { Icon, List, ListItem } from "react-onsenui"

import AvatarImg from "@/components/AvatarImg"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        loading: true,
        UserData: {},
        gameList: [],
      }
    }
    componentDidMount() {
      this.loadData()
    }

    async loadData() {
      let res = await getPush()
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }

      let gameListRes = await action.get("RedPacket/GetList")
      if (gameListRes.Code != 1) {
        apiNotification.alert(gameListRes, {}, this.props)
        return
      }
      this.setState({ UserData: res.Data.UserData, gameList: gameListRes.Data, loading: false })
    }

    render() {
      let user = this.state.UserData
      let gameList = this.state.gameList

      return (
        <LayoutPage
          className="redpacket-home-page"
          center="扫雷红包"
          loading={this.state.loading}
          right={() => (
            <span
              onClick={() => {
                this.props.router.push("/redpacket/rule")
              }}
            >
              规则说明
            </span>
          )}
        >
          <div className="top-box">
            <div className="user-info">
              <div className="info">
                <div className="left">{Object.keys(user).length != 0 && <AvatarImg UID={user.ID} width={55} height={55} shape="round" />}</div>
                <div className="right">
                  <p className="name">
                    {user.NickName}
                    <span className="id">ID: {user.ID}</span>
                  </p>
                  <p className="amount">
                    余额: <span>{user.Money}元</span>
                  </p>
                </div>
                <span
                  className="deposit-button"
                  onClick={() => {
                    this.router.isLoginToOrRedirect("/site/depositCenter", "/site/home")
                  }}
                >
                  <Icon icon="ion-fireball" />
                  &nbsp;前往充值
                </span>
              </div>
              <div className="actions">
                <ul>
                  <li
                    onClick={() => {
                      this.props.router.push("/redpacket/rank")
                    }}
                  >
                    <div style={{ backgroundColor: "#fbe7e7" }}>
                      <Icon icon="ion-trophy" style={{ color: "#fbbf2c" }} />
                    </div>
                    <p>排行榜</p>
                  </li>
                  <li
                    onClick={() => {
                      this.props.router.isLoginToOrRedirect("/redpacket/record")
                    }}
                  >
                    <div style={{ backgroundColor: "#e8eaf3" }}>
                      <Icon icon="ion-document-text" style={{ color: "#527afb" }} />
                    </div>
                    <p>扫雷记录</p>
                  </li>
                  <li
                    onClick={() => {
                      this.props.router.isLoginToOrRedirect("/redpacket/dailyReport")
                    }}
                  >
                    <div style={{ backgroundColor: "#e1fdfd" }}>
                      <Icon icon="ion-android-list" style={{ color: "#679b9b" }} />
                    </div>
                    <p>每日报表</p>
                  </li>
                  <li
                    onClick={() => {
                      this.props.router.push("/site/promotionCenter")
                    }}
                  >
                    <div style={{ backgroundColor: "#fbe7e7" }}>
                      <Icon icon="ion-heart" style={{ color: "red" }} />
                    </div>
                    <p>优惠活动</p>
                  </li>
                  <li
                    onClick={() => {
                      this.props.router.isLoginToOrRedirect("/interaction/broadcast")
                    }}
                  >
                    <div style={{ backgroundColor: "#d7f7f4" }}>
                      <Icon icon="ion-speakerphone" style={{ color: "#42aba2" }} />
                    </div>
                    <p>广播喇叭</p>
                  </li>
                </ul>
              </div>
            </div>
            <div className="game-list">
              <List>
                {gameList.map((item) => {
                  return (
                    <ListItem
                      key={item.ID}
                      onClick={() => {
                        this.props.router.push(`/redpacket/room`, {
                          id: item.ID,
                          title: item.Explain,
                          minMoney: item.MinMoney,
                          maxMoney: item.MaxMoney,
                          redNum: item.RedNum,
                          speak: item.Speak,
                        })
                      }}
                    >
                      <div className="left">
                        <img src={util.buildAssetsPath(item.Icon)} />
                      </div>
                      <div className="center">
                        <p className="p1">{item.Name}</p>
                        <p className="p2">{item.Explain}</p>
                      </div>
                      <div className="right">
                        <Icon icon="ion-ios-arrow-forward" />
                      </div>
                    </ListItem>
                  )
                })}
              </List>
            </div>
          </div>
        </LayoutPage>
      )
    }
  }
)
