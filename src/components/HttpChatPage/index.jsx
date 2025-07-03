import * as action from "@/action"
import CustomIcon from "@/components/CustomIcon"
import LayoutPage from "@/components/LayoutPage"
import * as apiNotification from "@/magic/ApiNotification"
import React, { createRef } from "react"
import { Button, Col, Icon, Input, Row } from "react-onsenui"

import { getPush } from "@/action/apis"
import InputBox from "@/components/InputBox"
import gameConfigs from "@/magic/gameConfigs"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import ClipboardJS from "clipboard"
import dayjs from "dayjs"
import { pick } from "lodash"
import Messages, { ConvertContent, ConvertMessageData } from "./Messages"
import "./style.scss"
import { notificationAsync } from "@/magic/notification"
var timeOutAT = 0

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        isLoadingHistory: true,
        msgList: [],
        followBetData: false,
        PageIndex: 1,
        PageSize: 10,
        PageEnd: false,
        action: "",
        emojiList: [
          "😀",
          "😁",
          "😂",
          "😃",
          "😄",
          "😅",
          "😆",
          "😉",
          "😊",
          "😋",
          "😎",
          "😍",
          "😘",
          "😗",
          "😙",
          "😚",
          "😇",
          "😐",
          "😑",
          "😶",
          "😏",
          "😣",
          "😥",
          "😮",
          "😯",
          "😪",
          "😫",
          "😴",
          "😌",
          "😛",
          "😜",
          "😝",
          "😒",
          "😓",
          "😔",
          "😕",
          "😲",
          "😷",
          "😖",
          "😞",
          "😟",
          "😤",
          "😢",
          "😭",
          "😦",
          "😧",
          "😨",
          "😬",
          "😰",
          "😱",
          "😳",
          "😵",
          "😡",
          "😠",
        ],
        text: "",
        quoteData: "",
        effecMenuData: "",
        ftShare: false,
      }
      this.fixBottom = true
      this.chatContentBoxRef = createRef()
      this.chatListRef = createRef()
    }

    convertData(list) {
      let newList = []
      for (let i = 0, len = list.length; i < len; i++) {
        newList.push(this.props.convert(list[i]))
      }
      return newList
    }

    async componentDidMount() {
      let t1 = new Date().getTime()
      let res = await getPush()
      if (res.Code != 1) {
        apiNotification.alert(res, { title: "提示" }, this.props)
        return
      }
      let t2 = new Date().getTime()
      let serverTime = util.date.toDate(res.Data.ServerTime).getTime() + (t2 - t1) / 2

      this.startCountDown(serverTime)

      await this.loadMoreMessage(1)
      this.loopMessage()
    }

    componentWillUnmount() {
      this.timer && clearInterval(this.timer)
      this.loadTimer && clearTimeout(this.loadTimer)
    }

    startCountDown(ServerTime) {
      this.setState({ ServerTime: ServerTime })
      this.timer = setInterval(() => {
        this.countDown(this.state.ServerTime)
      }, 1000)
    }

    countDown(ServerTime) {
      this.setState({ ServerTime: ServerTime + 1000 })
    }

    async loadMoreMessage(PageIndex) {
      let listApi = this.props.listApi
      this.setState({ isLoadingHistory: true })
      if (PageIndex) {
        this.setState({ PageIndex: PageIndex })
      } else {
        PageIndex = this.state.PageIndex + 1
        this.setState({ PageIndex: PageIndex })
      }
      let res = await action.post(
        listApi.url,
        Object.assign(listApi.params, {
          PageIndex: PageIndex,
          PageSize: this.state.PageSize,
        })
      )
      if (res.Code != 1) {
        apiNotification.alert(res, { title: "提示" }, this.props)
      }
      this.mergeMessage(this.convertData(res.Data))
      this.setState({ isLoadingHistory: false, PageEnd: res.Data.length < this.state.PageSize })
    }

    mergeMessage(incomingList) {
      let msgList = Object.assign([], this.state.msgList)
      let idMap = {}
      for (let i = 0, len = msgList.length; i < len; i++) {
        idMap[msgList[i].id] = i
      }
      for (let i = 0, len = incomingList.length; i < len; i++) {
        let id = incomingList[i].id
        if (typeof idMap[id] != "undefined") {
          msgList[idMap[id]] = incomingList[i]
        } else {
          msgList.push(incomingList[i])
        }
      }

      let box = this.chatContentBoxRef.current
      let list = this.chatListRef.current
      let l = list?.offsetHeight - box?.scrollTop
      msgList = msgList.sort((a, b) => a.id - b.id)
      this.setState(
        { msgList: msgList },
        !this.fixBottom
          ? () => {
              if (box) {
                box.scrollTop = list?.offsetHeight - l
              }
            }
          : () => {}
      )

      setTimeout(() => {
        this.scrollToBottom()
      }, 50)

      //剪掉头部消息
      setTimeout(() => {
        if (msgList.length > this.state.PageSize * this.state.PageIndex) {
          msgList = msgList.slice(msgList.length - this.state.PageSize * this.state.PageIndex, msgList.length)
          this.setState({ msgList: msgList })
        }
      }, 100)
    }

    async loadNewMessage() {
      let listApi = this.props.listApi
      let res = await action.post(listApi.url, Object.assign(listApi.params, { PageIndex: 1, PageSize: 5 }))
      if (res.Code != 1) {
        apiNotification.alert(res, { title: "提示" }, this.props)
      }

      this.mergeMessage(this.convertData(res.Data))
    }

    async loopMessage() {
      await this.loadNewMessage()
      this.loadTimer = setTimeout(() => {
        this.loopMessage()
      }, 2000)
    }

    updateLocally({ content, ...params }) {
      let user = util.cache.get("user") || {}
      const id = (this.state.msgList.length > 0 ? this.state.msgList.slice(-1)[0].id : 0) + 1
      this.mergeMessage([
        {
          Avatar: user.Avatar.FilePath,
          OpTime: null,
          Status: 0,
          UID: user.ID,
          content,
          fromName: user.NickName,
          id,
          isMe: true,
          time: dayjs().format("HH:mm:ss"),
          ...params,
        },
      ])
      return id
    }

    async sendMessage(text, quote = "") {
      const id = this.updateLocally({ content: quote + text })
      let sendApi = this.props.sendApi
      let res = await action.post(sendApi.url, Object.assign(sendApi.params, { text, quote }))
      if (res.Code != 1) {
        apiNotification.alert(
          res,
          {
            title: "提示",
            callback: () => {
              this.setState({ msgList: this.state.msgList.filter((msg) => msg.id !== id) })
            },
          },
          this.props
        )
      }
      this.scrollToBottom(true)
    }

    clearMessage() {
      this.fixBottom = true
      this.setState({ msgList: [], PageIndex: 1 })
    }

    chatContentScroll() {
      let box = this.chatContentBoxRef.current
      let list = this.chatListRef.current
      //console.log(this.fixBottom, box.scrollTop, list.offsetHeight - box.offsetHeight - 50);
      if (box?.scrollTop < list?.offsetHeight - box?.offsetHeight - 50) {
        this.fixBottom = false
      } else {
        this.fixBottom = true
      }
      if (box?.scrollTop == 0) {
        if (!this.state.isLoadingHistory && !this.state.PageEnd) {
          this.loadMoreMessage()
        }
      }
    }

    scrollToBottom(force) {
      try {
        if (this.fixBottom || force) {
          let box = this.chatContentBoxRef.current
          let list = this.chatListRef.current
          if (box) {
            box.scrollTop = list?.offsetHeight - box?.offsetHeight + 50
          }
        }
      } catch (e) {
        //console.error(e);
      }
    }

    startAT(fromName, isMe) {
      if (!isMe) {
        timeOutAT = setTimeout(() => {
          this.longPress(fromName)
        }, 500)
      }
    }

    moveAT(isMe) {
      if (!isMe) {
        clearTimeout(timeOutAT)
      }
    }

    endAT(isMe, UID) {
      if (!isMe) {
        clearTimeout(timeOutAT)
        if (timeOutAT != 0 && UID != 0) {
          this.props.router.isLoginToOrRedirect(`/interaction/friendInfo`, { id: UID })
        }
        timeOutAT = 0
      }
    }

    longPress(fromName) {
      timeOutAT = 0
      this.setState({ text: this.state.text + "@" + fromName + " " })
    }

    setFollowBetModal(shareBet, OpTime, newBetTexts) {
      const isBaccarat = shareBet.GameTitle === "哈希百家乐"
      const config = isBaccarat ? null : util.findGames(shareBet.LoID)
      shareBet.OpTime = OpTime
      this.setState({ followBetMoney: shareBet.BetMoney })
      setTimeout(() => {
        let shareBetLength = newBetTexts.reduce((prev, curr) => prev + curr.length, 0)
        let baseUnit = 1

        if (config) {
          let betLx = shareBet.Lx
          if (betLx == 48 || betLx == 44 || betLx == 49) {
            // config 的内容是用type 来区分的 4, 5, 6 肖中特
            betLx = "48" + (betLx == 48 ? "-4" : betLx == 49 ? "-5" : betLx == 44 ? "-6" : "")
          }

          let gameConfig = gameConfigs[config.type][betLx]
          if (gameConfig) {
            if (!!gameConfig.betCount) {
              shareBetLength = gameConfig.betCount(
                ["选三前直", "选二连直"].some((text) => gameConfig.title === text)
                  ? newBetTexts.map((newText) => newText.map((text) => ({ text })))
                  : gameConfig.title === "对子直选"
                  ? newBetTexts.map((newText) => [newText.join(",")])
                  : newBetTexts
              )
            }
            if (!!gameConfig.baseUnit) {
              baseUnit = gameConfig.baseUnit
            }
          }
          // console.log({ shareBet, shareBetLength, baseUnit, isBaccarat, gameConfig })
        }
        this.setState({ followBetData: { ...shareBet, shareBetLength, baseUnit, isBaccarat } })
      }, 100)
    }

    async confirmFollowBet() {
      const shareBet = this.state.followBetData

      if (!this.state.ServerTime || shareBet.OpTime - this.state.ServerTime < 0) {
        notificationAsync.alert("投注截止")
        this.setState({ followBetData: null })
        return
      }

      let res = null
      if (shareBet.isBaccarat) {
        res = await action.post("Baccarat/HXBet", {
          ID: shareBet.LoID,
          Code: "hxbaccarat",
          betText: `${shareBet.BetText},${this.state.followBetMoney}`,
        })
      } else {
        const lx = [44, 49].some((v) => v == shareBet.Lx) ? 48 : shareBet.Lx // 44, 49 分别为六、五肖中特 投注时要转成 48
        res = await action.post("Lottery/Bet", {
          lotteryid: shareBet.LoID,
          lx,
          money: this.state.followBetMoney,
          betText: shareBet.BetText,
        })
      }

      if (res.Code != 1) {
        apiNotification.alert(res, { title: "操作提示" }, this.props)
      } else {
        notificationAsync.alert(res.Message, { title: " 恭喜您!" })
      }
      this.setState({ followBetData: null })
    }

    render() {
      let msgList = this.state.msgList
      return (
        <LayoutPage
          center={this.props.center}
          className="http-chat-room-page"
          // renderFixed={()=> <Foot onSend={this.sendMessage.bind(this)}/>}
          renderFixed={() => (
            <div className="ft">
              {this.state.quoteData && (
                <div className="ft-quote">
                  {this.state.quoteData.content}
                  <span
                    className="quoteCancel"
                    onClick={() => {
                      this.setState({ quoteData: "" })
                    }}
                  ></span>
                </div>
              )}
              {this.state.ftShare && (
                <div className="ft-share">
                  <div
                    className="share"
                    onClick={() => {
                      this.props.router.isLoginToOrRedirect(`/interaction/broadcastShareBet`)
                      this.setState({ ftShare: false })
                    }}
                  >
                    <p className="emoji">
                      <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/ticket.svg")} />
                    </p>
                    <p>分享注单</p>
                  </div>
                  <div
                    className="share"
                    onClick={async () => {
                      let res = await action.post("User/SendBroadcast", { type: 2, text: "" })
                      if (res.Code != 1) {
                        apiNotification.alert(res, { title: "提示" }, this.props)
                      } else {
                        this.updateLocally({ content: res.Data.Text, id: res.Data.ID })
                        // await this.loadNewMessage()
                        this.scrollToBottom(true)
                      }
                      this.setState({ ftShare: false })
                    }}
                  >
                    <p className="emoji">
                      <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/champ.svg")} />
                    </p>
                    <p>分享战绩</p>
                  </div>
                  <div
                    className="share"
                    onClick={() => {
                      this.props.router.isLoginToOrRedirect(`/interaction/broadcastMoreShare`)
                      this.setState({ ftShare: false })
                    }}
                  >
                    <p className="emoji">
                      <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/more.svg")} />
                    </p>
                    <p>更多战绩</p>
                  </div>
                </div>
              )}
              <Row className="action-input">
                <Col width="40px" className="left">
                  <span
                    className={`emoji`}
                    onClick={() => {
                      this.setState({ action: this.state.action == "" ? "showEmoji" : "" })
                    }}
                  >
                    <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/emoji.svg")} />
                  </span>
                  {this.state.action == "showEmoji" && (
                    <div className="emoji-panel">
                      {this.state.emojiList.map((e) => {
                        return (
                          <span
                            onClick={() => {
                              this.setState({ text: this.state.text + e })
                            }}
                            key={e}
                          >
                            {e}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </Col>
                {this.props.shareBet && (
                  <Col
                    width="40px"
                    className="left"
                    onClick={() => {
                      this.setState({ ftShare: !this.state.ftShare })
                    }}
                  >
                    <span className="emoji">
                      <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/share.svg")} />
                    </span>
                  </Col>
                )}
                <Col className="center">
                  <Input
                    disabled={false}
                    placeholder={"请输入..."}
                    value={this.state.text}
                    onInput={(e) => {
                      this.setState({ text: e.target.value })
                    }}
                    onFocus={() => {
                      this.setState({ action: "" })
                    }}
                  />
                </Col>
                <Col width="65px" className="right">
                  <Button onClick={this.sendText.bind(this)}>发送</Button>
                </Col>
              </Row>
            </div>
          )}
          right={this.props.right}
        >
          <div className="chat-content" ref={this.chatContentBoxRef} onScroll={this.chatContentScroll.bind(this)}>
            <div className="chat-list" ref={this.chatListRef}>
              {this.state.isLoadingHistory && (
                <div className="loading">
                  <p>
                    <Icon icon="ion-load-d" /> 正在加载...
                  </p>
                </div>
              )}
              <Messages
                value={msgList}
                setFollowBetModal={this.setFollowBetModal.bind(this)}
                ServerTime={this.state.ServerTime}
                setEffecMenuData={(effecMenuData) => {
                  this.setState({ effecMenuData })
                }}
                startAT={this.startAT.bind(this)}
                endAT={this.endAT.bind(this)}
                moveAT={this.moveAT.bind(this)}
              />
            </div>

            {this.state.followBetData && (
              <div className="follow-bet-modal" onClick={() => this.setState({ followBetData: null })}>
                <div
                  className="follow-bet-window"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <div className="follow-bet-title">{this.state.followBetData.GameTitle}</div>
                  <div className="follow-bet-content">
                    <div className="follow-bet-list">
                      <span className="follow-bet-rule">{this.state.followBetData.BetName}</span>
                      <span className="follow-bet-ball max-w-[200px] break-words">{this.state.followBetData.BetText}</span>
                      <span className="follow-bet-maoney">{this.state.followBetData.BetMoney}元</span>
                    </div>
                    <div className="follow-bet-all-amount">
                      <div className="betAmount">
                        每注：
                        <InputBox
                          placeholder="输入金额"
                          type="number"
                          name="amount"
                          onChange={(value) => {
                            this.setState({ followBetMoney: value })
                          }}
                          value={this.state.followBetMoney}
                        />
                        元
                      </div>
                      <div className="allAmount">
                        总额：{this.state.followBetMoney * this.state.followBetData.shareBetLength * this.state.followBetData.baseUnit}元
                      </div>
                    </div>
                  </div>
                  <div className="follow-bet-btn">
                    <div className="cancel" onClick={() => this.setState({ followBetData: null })}>
                      取消
                    </div>
                    <div
                      className="submit"
                      onClick={() => {
                        this.confirmFollowBet()
                      }}
                    >
                      跟注
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {this.state.effecMenuData && (
            <div className="effect-menu-box" onClick={() => this.setState({ effecMenuData: "" })}>
              <div className="mask"></div>
              <div className="effect-menus">
                <div
                  className="effect-menu"
                  onClick={(e) => {
                    e.stopPropagation()
                    this.messageEffect(1)
                  }}
                >
                  @TA
                </div>
                <div
                  className="effect-menu"
                  onClick={(e) => {
                    e.stopPropagation()
                    this.messageEffect(2)
                  }}
                >
                  引用
                </div>
                <div
                  className="effect-menu"
                  onClick={(e) => {
                    e.stopPropagation()
                    this.messageEffect(3)
                  }}
                >
                  复制
                </div>
              </div>
            </div>
          )}
        </LayoutPage>
      )
    }

    messageEffect(menuOrder) {
      let msg = this.state.effecMenuData
      let content = ConvertContent(msg)

      if (!msg.isMe) {
        switch (menuOrder) {
          case 1:
            this.longPress(msg.fromName)
            this.setState({ effecMenuData: "" })
            break
          case 2:
            if (content.length > 1) {
              msg.content = content[3]
            } else {
              const msgData = ConvertMessageData(msg, this.state.ServerTime)
              msg.content = msgData.text
            }
            this.setState({ quoteData: msg, effecMenuData: "" })
            break
          case 3:
            if (content.length > 1) {
              this.onCopy(content[3])
            } else {
              this.onCopy(content[0])
            }
            this.setState({ effecMenuData: "" })
            break
        }
      }
    }

    onCopy(text) {
      return new Promise((resolve, reject) => {
        let fakeElement = document.createElement("button")

        let clipboard = new ClipboardJS(fakeElement, {
          text() {
            return text
          },
          action() {
            return "copy"
          },
          container: typeof container === "object" ? container : document.body,
        })
        clipboard.on("success", (e) => {
          clipboard.destroy()

          notificationAsync.alert("已成功复制到剪贴板", {
            title: "复制成功",
          })
          resolve(e)
        })
        clipboard.on("error", (e) => {
          clipboard.destroy()
          //alert(JSON.stringify(e));
          notificationAsync.alert({
            title: "浏览器不支持，请手动复制",
            messageHTML: `<div class="manual-copy-input-wrap"><input value="${text}" οnfοcus="this.select()"/></div>`,
          })
          reject(e)
        })
        document.body.appendChild(fakeElement)
        fakeElement.click()
        document.body.removeChild(fakeElement)
      })
    }

    sendText() {
      util.trialCheck()
      let text = this.state.text.trim()
      let quote = this.state.quoteData ? JSON.stringify(pick(this.state.quoteData, ["content", "fromName", "time"])) : ""
      if (!text) {
        return notificationAsync.alert("不能发送空文本")
      }
      this.sendMessage(text, quote)
      this.setState({ text: "", quoteData: "", action: "" })
    }
  }
)
