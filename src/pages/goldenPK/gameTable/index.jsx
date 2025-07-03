import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import * as action from "@/action"

import "./style.scss"
import { Button } from "react-onsenui"
import * as apiNotification from "@/magic/ApiNotification"
import util from "@/magic/util"
import Poker from "@/pages/goldenPK/gameTable/Poker"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        money: null,
        loading: true,
        apiLoading: false,
        userCards: this.props.gameData && this.props.gameData.UserCards ? this.props.gameData.UserCards : null,
        userCardsType: null,
        myCards: this.props.gameData && this.props.gameData.MyCards ? this.props.gameData.MyCards : null,
        myCardsType: null,
        closeGame: false,
        changeCard: false,
        passInput: util.cache.get("GoldenPKPass") && Object.keys(util.cache.get("GoldenPKPass")).length > 0 ? false : true,
        pass: util.cache.get("GoldenPKPass") && Object.keys(util.cache.get("GoldenPKPass")).length > 0 ? util.cache.get("GoldenPKPass") : null,
      }
    }
    componentDidMount() {
      this.setState({ loading: false })
    }

    challenge() {
      let validate = this.check()
      if (validate) {
        notificationAsync.alert(validate, { title: "设置信息错误" })
        return
      }

      let query = {
        id: this.props.gameData.ID,
        pass: this.state.pass,
      }
      this.setState({ apiLoading: true })
      action.post("PKGame/Golden_Challenge", query, (res) => {
        this.setState({ apiLoading: false })
        if (res.Code == 1) {
          notificationAsync.alert(res.Message, { title: "成功" })
          util.cache.set("GoldenPKPass", this.state.pass)
          let data = res.Data
          this.setState({
            closeGame: true,
            passInput: false,
            myCards: data.DareCards,
            userCards: data.UserCards,
            userCardsType: data.UserXingTai,
            myCardsType: data.DareXingTai,
          })
        } else {
          notificationAsync.alert(res.Message, { title: "操作提示" })
        }
      })
    }

    check() {
      if (!this.state.pass) {
        return "登入密码不能为空"
      }
      return ""
    }

    async dealCard(type) {
      let poker = await action.post("PKGame/GoldenPoker", { type: type })
      if (poker.Code != 1) {
        apiNotification.alert(poker, {}, this.props)
      } else {
        if (type == 1) {
          this.setState({ changeCard: true })
          apiNotification.alert(poker, {}, this.props)
        }
        this.setState({ myCards: poker.Data })
      }
      return
    }

    render() {
      let gameData = this.props.gameData
      let userCards = this.state.userCards
      let myCards = this.state.myCards
      return (
        <LayoutPage
          className="game-table-golden"
          apiLoading={this.state.apiLoading}
          loading={this.state.loading}
          center="金花对战"
          onBack={() => {
            this.props.onBack()
          }}
          right={null}
        >
          <div className="content">
            {gameData && gameData.NickName && gameData.Money && (
              <div className="tip">
                <span>擂主：&nbsp;{gameData.NickName}</span>
                <span>彩金：&nbsp;¥&nbsp;{gameData.Money}</span>
              </div>
            )}
            <div className="round-info">
              <div className="poker-group">
                <div className="pokerItem Zdian dian">
                  <div className="dianItem">擂主牌面</div>
                  <div className="poker dianItem">
                    {userCards && userCards.length
                      ? userCards.map((item, index) => {
                          return <Poker key={index} className={`zhuang poker-${index}`} value={item.code} shape={item.name} />
                        })
                      : null}
                  </div>
                  {this.state.userCardType && <div className="point dianItem">{this.state.userCardType}</div>}
                </div>
                <div className="pokerItem Zdian dian">
                  <div className="dianItem">您的牌面</div>
                  <div className="poker dianItem">
                    {myCards && myCards.length ? (
                      myCards.map((item, index) => {
                        return (
                          <Poker
                            key={index + (this.state.changeCard ? "after" : "before")}
                            className={`zhuang poker-${index}`}
                            value={item.code}
                            shape={item.name}
                          />
                        )
                      })
                    ) : (
                      <div>暂无挑战者牌面，赶紧发牌挑战擂主吧！</div>
                    )}
                  </div>
                  {this.state.myCardsType && <div className="point dianItem">{this.state.myCardsType}</div>}
                </div>
              </div>
              {this.state.passInput && (
                <div className=" item password">
                  <div className="inline">验证密码:</div>
                  <div className="inline">
                    <InputBox
                      placeholder={"请输入提款密码"}
                      type="number"
                      name="amount"
                      onChange={(value) => {
                        this.setState({ pass: value })
                      }}
                      value={this.state.pass}
                    />
                  </div>
                </div>
              )}
            </div>

            {/*<div className="submit"><Button onClick={()=>{this.openTable()}}>摆擂</Button></div>*/}
            {this.state.closeGame ? (
              <div className="submit">
                <Button
                  onClick={() => {
                    this.props.onBack()
                  }}
                >
                  返回
                </Button>
              </div>
            ) : (
              <div className="submit">
                {myCards ? (
                  <Button
                    onClick={() => {
                      this.dealCard(1)
                    }}
                  >
                    换牌
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      this.dealCard(0)
                    }}
                  >
                    发牌
                  </Button>
                )}
                {myCards && (
                  <Button
                    onClick={() => {
                      this.challenge()
                    }}
                  >
                    挑战
                  </Button>
                )}
              </div>
            )}

            {/*<Button onClick={()=>{this.props.onBack()}}>返回</Button>*/}
          </div>
        </LayoutPage>
      )
    }
  }
)
