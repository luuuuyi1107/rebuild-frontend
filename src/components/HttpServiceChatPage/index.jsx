import React, { createRef } from "react"
import LayoutPage from "@/components/LayoutPage"
import { Icon, Row, Col, Input, Button } from "react-onsenui"
import CustomIcon from "@/components/CustomIcon"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import AvatarImg from "@/components/AvatarImg"
import "./style.scss"
import ClipboardJS from "clipboard"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import Quote from "@/components/HttpChatPage/Quote"
import { notificationAsync } from "@/magic/notification"
var timeOutAT = 0

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
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
        quoteData: "",
        effecMenuData: "",
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

    componentDidMount() {
      this.loadData()
    }

    async loadData() {
      let user = await getPush()
      this.setState({ user: user.Data.UserData })

      await this.loadMoreMessage(1)
      this.loopMessage()
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
      let res = await action.post(listApi.url, Object.assign(listApi.params, { PageIndex: PageIndex, PageSize: this.state.PageSize }))
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
                box.scrollTop = list.offsetHeight - l
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

    componentWillUnmount() {
      this.loadTimer && clearTimeout(this.loadTimer)
    }

    async loopMessage() {
      await this.loadNewMessage()
      this.loadTimer = setTimeout(() => {
        this.loopMessage()
      }, 2000)
    }
    async sendMessage(text) {
      let sendApi = this.props.sendApi
      let res = await action.post(sendApi.url, Object.assign(sendApi.params, { content: text }))
      if (res.Code != 1) {
        apiNotification.alert(res, { title: "提示" }, this.props)
      } else {
        await this.loadNewMessage()
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
      let _this = this
      _this.setState({ text: _this.state.text + "@" + fromName + " " })
    }

    render() {
      let msgList = this.state.msgList
      return (
        <LayoutPage
          center={this.props.center}
          className="http-chat-room-page"
          // renderFixed={()=> <Foot onSend={this.sendMessage.bind(this)}/>}
          renderFixed={() => this.foot()}
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
              {msgList.map((msg) => {
                let content = msg.content.split("(quote)")
                return (
                  <div key={msg.id}>
                    {msg.time && (
                      <div className="spliter">
                        <span>{msg.time}</span>
                      </div>
                    )}
                    <div className={`chat_msg ${msg.isMe ? "right" : "left"}`}>
                      <div className="user-info">
                        {!msg.isMe ? (
                          <div className="systemAvatar"></div>
                        ) : this.state.user.Avatar ? (
                          <AvatarImg avatarLink={this.state.user.Avatar.FilePath} width={"0.8rem"} height={"0.8rem"} />
                        ) : (
                          <AvatarImg width={"0.8rem"} height={"0.8rem"} />
                        )}
                      </div>
                      <div className="message-body">
                        <label className="user-name" style={msg.UID == 0 ? { color: "#e8505b" } : { color: "#000" }}>
                          {msg.fromName}
                        </label>
                        <p
                          className={msg.UID == 0 ? "systemMessage" : "Message"}
                          onClick={() => {
                            if (!msg.isMe) {
                              this.setState({ effecMenuData: msg })
                            }
                          }}
                        >
                          {content.length > 1 ? (
                            <>
                              <Quote text={content[0]} time={content[1]} name={content[2]}>
                                {content[3]}
                              </Quote>
                            </>
                          ) : (
                            <span dangerouslySetInnerHTML={{ __html: content[0] }}></span>
                          )}
                          {/*{msg.content}*/}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
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
      let content = msg.content.split("(quote)")
      if (!msg.isMe) {
        switch (menuOrder) {
          case 1:
            this.longPress(msg.fromName)
            this.setState({ effecMenuData: "" })
            break
          case 2:
            if (content.length > 1) {
              msg.content = content[3]
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
          text: function () {
            return text
          },
          action: function () {
            return "copy"
          },
          container: typeof container === "object" ? container : document.body,
        })
        clipboard.on("success", function (e) {
          clipboard.destroy()

          notificationAsync.alert("已成功复制到剪贴板", {
            title: "复制成功",
          })
          resolve(e)
        })
        clipboard.on("error", function (e) {
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
      let text = this.state.text.trim()
      if (!text) {
        return notificationAsync.alert("不能发送空文本")
      }
      if (this.state.quoteData) {
        let quoteData = this.state.quoteData
        text = quoteData.content + "(quote)" + quoteData.fromName + "(quote)" + quoteData.time + "(quote)" + text
      }

      this.sendMessage(text)
      this.setState({ text: "", quoteData: "", action: "" })
    }

    foot() {
      let _this = this
      return (
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
                  {_this.state.emojiList.map(function (e) {
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
