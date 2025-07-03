import React, { createRef } from "react"
import LayoutPage from "@/components/LayoutPage"
import { Icon, Row, Col, Input, Button } from "react-onsenui"
import CustomIcon from "@/components/CustomIcon"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import AvatarImg from "@/components/AvatarImg"
import InputBox from "@/components/InputBox"
import util from "@/magic/util"
import { gameList } from "@/config/game"
import $ from "@/components/jQuery"
import "@/components/jQuery/jquery.signalR.js"
import "./style.scss"
import ShareBetRecord from "./shareBetRecord"
import config from "@/config/config"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"
var timeOutAT = 0

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.chatHub = null
      this.state = {
        isLoadingHistory: true,
        msgList: [],
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
        shareRecord: false,
        followBetData: [],
        ServerTime: null,
        shareRecordId: 0,
        bottomButton: false,
      }
      this.pageIndex = 1
      this.pageSize = 20
      this.fixBottom = true
      this.user = util.cache.get("user")
      this.chatContentBoxRef = createRef()
      this.chatListRef = createRef()
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

      let _this = this
      let token = this.user.Token
      let connection = $.hubConnection(`${config.wsUrl}signalr`, { useDefaultPath: false })
      this.chatHub = connection.createHubProxy("chathub")

      this.listenMessage()

      connection
        .start()
        .done(function () {
          console.log("Now connected, connection ID=" + connection.id)
          _this.chatHub.invoke("Connect", token).done(function () {
            console.log("Invocation of Connect succeeded")
          })
        })
        .fail(function () {
          console.log("Could not connect")
        })
    }

    componentWillUnmount() {
      if (this.timer) {
        clearInterval(this.timer)
      }
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

    buyInfo(infoID, money) {
      notificationAsync.confirm("购买此则信息需要" + money + "元", { title: "购买", buttonLabels: ["取消", "购买"] }).then(() => {
        this.chatHub.invoke("PayShare", infoID)
      })
    }

    appendMessageList(incomingList, position) {
      if (position == "tail") {
        this.setState({ msgList: [].concat(this.state.msgList, incomingList) })
        setTimeout(() => {
          this.scrollToBottom(true)
        }, 100)
      } else {
        let box = this.chatContentBoxRef.current
        let list = this.chatListRef.current
        let l = list?.offsetHeight - box?.scrollTop
        this.setState({ msgList: [].concat(incomingList, this.state.msgList) }, () => {
          if (box) {
            box.scrollTop = list.offsetHeight - l
          }
        })
      }
    }
    updateMessageList(imcomingList) {
      let list = Object.assign([], this.state.msgList)
      for (let k = 0; k < list.length; k++) {
        for (let i = 0; i < imcomingList.length; i++) {
          if (list[k].ID == imcomingList[i].ID) {
            list[k] = imcomingList[i]
          }
        }
      }
      this.setState({ msgList: list })
    }
    loadMoreMessage() {
      let pageIndex = ++this.pageIndex
      let pageSize = this.pageSize
      this.chatHub.invoke("GetPageList", pageIndex, pageSize)
    }

    sendMessage(text) {
      let _this = this
      this.chatHub.invoke("Speak", 0, text).done(function () {
        _this.chatHub.invoke("onUpdateMsg")
      })
    }

    listenMessage() {
      let _this = this
      this.chatHub.on("onMessageList", function (list) {
        // console.log('onMessageList', list);
        _this.setState({ isLoadingHistory: false })
        _this.appendMessageList(list, "head")
      })
      this.chatHub.on("onUpdateMsg", function (list) {
        _this.updateMessageList(list)
        // console.log("updateMessage" , list);
      })
      this.chatHub.on("onMessage", function (list) {
        // console.log("onMessage", list);
        _this.appendMessageList(list, "tail")
        _this.setState({ isLoadingHistory: false })
      })
      this.chatHub.on("onUserList", function () {
        // console.log("onUserList", arguments);
      })
      this.chatHub.on("onMsg", function (msg) {
        notificationAsync.alert(msg, { title: "错误" })
        console.log("onMsg", msg)
      })
      this.chatHub.on("onLog", function () {
        console.log("onLog", arguments)
      })
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
      if (box?.scrollTop < list?.offsetHeight - box?.offsetHeight * 2 && !this.state.bottomButton) {
        this.setState({ bottomButton: true })
      } else if (box?.scrollTop > list?.offsetHeight - box?.offsetHeight * 2 && this.state.bottomButton) {
        this.setState({ bottomButton: false })
      }
      if (box?.scrollTop == 0) {
        if (!this.state.isLoadingHistory) {
          this.setState({ isLoadingHistory: true })
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
            box.scrollTop = list.offsetHeight - box.offsetHeight + 50
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
    endAT(isMe) {
      if (!isMe) {
        clearTimeout(timeOutAT)
        timeOutAT = 0
      }
    }
    longPress(fromName) {
      let _this = this
      _this.setState({ text: _this.state.text + "@" + fromName + " " })
    }

    render() {
      let msgList = this.state.msgList
      return (
        <LayoutPage
          center={this.props.center}
          className="http-chat-room-page"
          renderFixed={() => this.foot()}
          right={this.props.right}
          onBack={() => {
            let _this = this
            _this.chatHub.invoke("Exit")
            this.props.router.back()
          }}
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
              {msgList.map((msg) => {
                let isMe = true
                let sharePercent = ((msg.ShareWin / (msg.ShareWin + msg.ShareLose)) * 100).toFixed(0)
                if (msg.ShareWin + msg.ShareLose == 0) {
                  sharePercent = 0
                }
                if (msg.UID != this.user.ID) {
                  isMe = false
                }
                let overTime = this.state.ServerTime && new Date(msg.Content.ExT).getTime() - this.state.ServerTime > 0
                return (
                  <div key={msg.ID}>
                    {msg.Time && <div className="spliter">{msg.Time}</div>}
                    {/*<div className="spliter"></div>*/}
                    <div className={`chat_msg ${isMe ? "right" : "left"}`}>
                      <div
                        className="user-info"
                        onClick={() => {
                          if (msg.UID != 0) {
                            this.props.router.isLoginToOrRedirect(`/interaction/friendInfo`, { id: msg.UID })
                          }
                        }}
                        onTouchStart={() => this.startAT(msg.NickName, isMe)}
                        onTouchMove={() => this.moveAT(isMe)}
                        onTouchEnd={() => this.endAT(isMe)}
                      >
                        {msg.UID == 0 ? (
                          <div className="systemAvatar"></div>
                        ) : (
                          <AvatarImg avatarLink={msg.Avatar} width={"0.8rem"} height={"0.8rem"} />
                        )}
                      </div>
                      <div className={`message-body message-room-bady`}>
                        <label
                          className="user-name"
                          style={msg.UID == 0 ? { color: "#e8505b" } : { color: "#000" }}
                          onTouchStart={() => this.startAT(msg.NickName, isMe)}
                          onTouchMove={() => this.moveAT(isMe)}
                          onTouchEnd={() => this.endAT(isMe)}
                        >
                          {msg.NickName}
                          {msg.Expert && <span className="expert"></span>}
                        </label>
                        {msg.Type == 0 && <p className={msg.UID == 0 ? "systemMessage" : "Message"}>{msg.Content}</p>}
                        {msg.Type == 1 && (
                          <div className="person-share-info">
                            <span>
                              总{msg.ShareCount} 胜{msg.ShareWin}/负{msg.ShareLose} {sharePercent}% 连赢{msg.TopWin}
                            </span>
                          </div>
                        )}
                        {gameList.map((game) => {
                          let oneBetAmount = 0
                          let allAmount = 0
                          let betCount = 0

                          let dateTime = []
                          let date = []
                          let time = []
                          if (msg.Content.ExT) {
                            dateTime = msg.Content.ExT.split("T")
                            time = dateTime[1].split(":")
                          }
                          if (game.id == msg.Content.LoId) {
                            return (
                              <div key={msg.ID + game.id} className="bet-message">
                                <div className="lottery-title">
                                  <div className={"lottery-logo " + game.logo + "-icon"}></div>
                                  <div className="lottery-name">
                                    <div>{game.name}</div>
                                    <div>{msg.Content.LoNo}期</div>
                                  </div>
                                  <div className="lottery-no">
                                    <div>跟投终点</div>
                                    {/*<div>{util.date.format(util.date.toDate(msg.Content.ExT), "hh:mm:ss")}</div>*/}
                                    {overTime ? <div>{time[0] + ":" + time[1] + ":" + time[2]}</div> : <div>已截止</div>}
                                  </div>
                                </div>
                                <div className="lottery-content">
                                  {msg.Content.Items.map((betItem) => {
                                    oneBetAmount = betItem.Money
                                    // betCount ++;
                                    let betDatas = betItem.Bet.split(",")
                                    return (
                                      <div className="lottery-bet-list" key={"lottery-bet" + betItem.ID}>
                                        <div className="lottery-bet-rule">{betItem.Play}</div>
                                        <div className="lottery-bet-ball">
                                          {betDatas.map((betData, index) => {
                                            betCount++
                                            allAmount += betItem.Money
                                            let ballLength = "one"
                                            if (betData.length == 2) {
                                              ballLength = "two"
                                            } else if (betData.length == 3) {
                                              ballLength = "three"
                                            } else if (betData.length > 3) {
                                              ballLength = "stars"
                                              allAmount = "****"
                                              if (!overTime) {
                                                // let _this = this;
                                                // _this.chatHub.invoke("onMessageList").done(function(){
                                                //     console.log('8888')
                                                // })
                                              }
                                            }
                                            return (
                                              <span key={betItem.ID + index} className={"shareBall " + ballLength}>
                                                {betData}
                                              </span>
                                            )
                                          })}
                                        </div>
                                        <div className="lottery-bet-maoney">{betItem.Money}元</div>
                                      </div>
                                    )
                                  })}
                                  {/*<div className="lottery-follow-money">*/}
                                  {/*<div className="allAmount">投注总额：{allAmount}元</div>*/}
                                  {/*</div>*/}
                                </div>
                                <div className="lottery-btn">
                                  <div
                                    className="history"
                                    onClick={() => {
                                      this.setState({ shareRecordId: msg.UID, shareRecord: true })
                                    }}
                                  >
                                    历史记录
                                  </div>
                                  {msg.Content.Bet ? (
                                    <div
                                      className="follow"
                                      onClick={async () => {
                                        if (overTime) {
                                          this.setState({
                                            followBetData: [game, msg, oneBetAmount, allAmount, betCount],
                                            followBetMoney: oneBetAmount,
                                          })
                                        }
                                      }}
                                    >
                                      {overTime ? "跟随投注" : "投注截止"}
                                    </div>
                                  ) : (
                                    <div
                                      className="buy-info"
                                      onClick={() => {
                                        if (overTime) {
                                          this.buyInfo(msg.ID, msg.Content.Fee)
                                        }
                                      }}
                                    >
                                      {overTime ? "购买信息" : "投注截止"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }
                        })}
                        {/*<p className={msg.UID==0?"systemMessage":"Message"}>{msg.Content}</p>*/}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {this.state.followBetData && this.state.followBetData.length > 0 && (
              <div className="follow-bet-modal" onClick={() => this.setState({ followBetData: [] })}>
                <div
                  className="follow-bet-window"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <div className="follow-bet-title">{this.state.followBetData[0].name}</div>
                  <div className="follow-bet-content">
                    {this.state.followBetData[1].Content.Items.map((betItem) => {
                      return (
                        <div className="follow-bet-list" key={"follow-bet-list" + betItem.ID}>
                          <span className="follow-bet-rule">{betItem.Play}</span>
                          <span className="follow-bet-ball">{betItem.Bet}</span>
                          <span className="follow-bet-maoney">{betItem.Money}元</span>
                        </div>
                      )
                    })}
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
                        总额：{this.state.followBetMoney * this.state.followBetData[4] || this.state.followBetData[3]}元
                      </div>
                    </div>
                  </div>
                  <div className="follow-bet-btn">
                    <div className="cancel" onClick={() => this.setState({ followBetData: [] })}>
                      取消
                    </div>
                    <div
                      className="submit"
                      onClick={async () => {
                        if ((this.state.ServerTime && new Date(this.state.followBetData[1].Content.ExT).getTime() - this.state.ServerTime) > 0) {
                          let res = await action.post("Lottery/Bet", {
                            lotteryid: this.state.followBetData[1].Content.LoId,
                            lx: this.state.followBetData[1].Content.Lx,
                            money: this.state.followBetMoney,
                            betText: this.state.followBetData[1].Content.Bet,
                          })
                          apiNotification.alert(res, { title: "操作提示" }, this.props)
                          this.setState({ followBetData: [] })
                        } else {
                          notificationAsync.alert("投注截止")
                          this.setState({ followBetData: [] })
                        }
                      }}
                    >
                      跟注
                    </div>
                  </div>
                </div>
              </div>
            )}

            {this.state.bottomButton && (
              <div
                className="bottomBtn"
                onClick={() => {
                  this.scrollToBottom(true)
                }}
              >
                <Icon icon="ion-android-arrow-dropdown-circle" />
              </div>
            )}
          </div>

          {/* 分享注单记录 */}
          <ModalPage
            className="record-model exchange-record-modal"
            isOpen={!!this.state.shareRecord}
            animation="lift"
            onClose={() => {
              this.setState({ shareRecord: false })
            }}
          >
            {/*{this.state.shareRecord&&<div>test</div>}*/}
            {this.state.shareRecord && <ShareBetRecord ServerTime={this.state.ServerTime} id={this.state.shareRecordId} center="历史记录" />}
          </ModalPage>
        </LayoutPage>
      )
    }

    sendText() {
      let text = this.state.text.trim()
      if (!text) {
        return notificationAsync.alert("不能发送空文本")
      }

      this.sendMessage(text)
      this.setState({ text: "", action: "" })
    }

    foot() {
      let _this = this
      return (
        <div className="ft">
          <Row className="action-input">
            <Col width="40px" className="left">
              <span
                className={`emoji`}
                onClick={() => {
                  _this.setState({ action: _this.state.action == "" ? "showEmoji" : "" })
                }}
              >
                <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/emoji.svg")} />
              </span>
              {_this.state.action == "showEmoji" && (
                <div className="emoji-panel">
                  {_this.state.emojiList?.map(function (e) {
                    return (
                      <span
                        onClick={() => {
                          _this.setState({ text: _this.state.text + e })
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
            <Col className="center">
              <Input
                disabled={false}
                placeholder={"请输入..."}
                value={_this.state.text}
                onInput={(e) => _this.setState({ text: e.target.value })}
                onFocus={() => {
                  _this.setState({ action: "" })
                }}
              />
            </Col>
            <Col width="65px" className="right">
              <Button onClick={_this.sendText.bind(_this)}>发送</Button>
            </Col>
          </Row>
        </div>
      )
    }
  }
)
