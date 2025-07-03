import $ from "@/components/jQuery"
import "@/components/jQuery/jquery.signalR.js"

import React, { createRef } from "react"

import config from "@/config/config"
import LayoutPage from "@/components/LayoutPage"
import Foot from "./foot"
import util from "@/magic/util"
import { Icon } from "react-onsenui"
import CustomIcon from "@/components/CustomIcon"
import RedpacketDetail from "./RedpacketDetail"
import PickRedpacket from "./PickRedpacket"
import * as apiNotification from "@/magic/ApiNotification"

import AvatarImg from "@/components/AvatarImg"

import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.chatHub = null
      this.state = {
        isLoadingHistory: true,
        msgList: [],
        detailId: false,
      }
      this.fixBottom = true
      this.pageIndex = 1
      this.pageSize = 20
      this.roomId = util.getUrlParam("id") || 1
      this.minMoney = util.getUrlParam("minMoney")
      this.maxMoney = util.getUrlParam("maxMoney")
      this.speak = util.getUrlParam("speak") == "false" ? false : true
      this.redNum = util.getUrlParam("redNum")
      this.user = util.cache.get("user")
      this.chatContentBoxRef = createRef()
      this.chatListRef = createRef()
    }
    componentDidMount() {
      let _this = this
      let token = this.user.Token
      //${config.apiUrl}
      let connection = $.hubConnection(`${config.wsUrl}signalr`, { useDefaultPath: false })
      this.chatHub = connection.createHubProxy("redPacketHub")

      this.listenMessage()

      connection
        .start()
        .done(function () {
          console.log("Now connected, connection ID=" + connection.id)
          _this.chatHub.invoke("Connect", token, _this.roomId).done(function () {
            console.log("Invocation of Connect succeeded")
          })
        })
        .fail(function () {
          console.log("Could not connect")
        })
    }

    showRedpacketDetail(detailId) {
      this.setState({
        detailId,
        showPickRedpacket: false,
      })
    }

    showPickRedpacket() {
      this.setState({ detailId: false, showPickRedpacket: true })
    }

    chatContentScroll() {
      let box = this.chatContentBoxRef.current
      let list = this.chatListRef.current
      //console.log(this.fixBottom, box.scrollTop, list.offsetHeight - box.offsetHeight - 50);
      if (box.scrollTop < list.offsetHeight - box.offsetHeight - 50) {
        this.fixBottom = false
      } else {
        this.fixBottom = true
      }
      if (box.scrollTop < 5) {
        if (!this.state.isLoadingHistory) {
          this.setState({ isLoadingHistory: true })
          this.loadMoreMessage()
        }
      }
    }

    scrollToBottom() {
      try {
        if (this.fixBottom) {
          let box = this.chatContentBoxRef.current
          let list = this.chatListRef.current
          box.scrollTop = list.offsetHeight - box.offsetHeight + 50
        }
      } catch (e) {
        //console.error(e);
      }
    }
    render() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login")
        return null
      }
      let msgList = this.state.msgList
      return (
        <LayoutPage
          center={util.getUrlParam("title") || "红包扫雷"}
          className="redpacket-room-page"
          renderFixed={() => (
            <Foot speak={this.speak} minMoney={this.minMoney} maxMoney={this.maxMoney} redNum={this.redNum} onSend={this.sendMessage.bind(this)} />
          )}
          right={() => <span onClick={() => this.showPickRedpacket()}>捡漏</span>}
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
                if (msg.Type == 0) {
                  return (
                    <div key={msg.ID}>
                      {msg.Time && (
                        <div className="spliter">
                          <span>{msg.Time}</span>
                        </div>
                      )}
                      <div className={`chat_msg ${this.isMe(msg) ? "right" : "left"}`}>
                        <div className="user-info">
                          <AvatarImg UID={msg.UID} width={".8rem"} height={".8rem"} />
                        </div>
                        <div className="message-body">
                          <label className="user-name">{msg.NickName}</label>
                          <p>{msg.Content}</p>
                        </div>
                      </div>
                    </div>
                  )
                }
                if (msg.Type == 1) {
                  return (
                    <div key={msg.ID}>
                      {msg.Time && (
                        <div className="spliter" key={msg.Time}>
                          <span>{msg.Time}</span>
                        </div>
                      )}
                      <div className={`chat_msg ${this.isMe(msg) ? "right" : "left"}`}>
                        <div className="user-info">
                          <AvatarImg UID={msg.UID} width={".8rem"} height={".8rem"} />
                        </div>
                        <div
                          className={`message-body red-packet ${this.isFinished(msg) ? "finish" : "unfinish"}`}
                          onClick={this.onRedpacketClick.bind(this, msg)}
                        >
                          <label className="user-name">{msg.NickName}</label>
                          <p>
                            <span className="icon">
                              <CustomIcon style={{ width: 30, height: 30 }} className="redpacket-icon" type={require("./icons/packet2.svg")} />
                            </span>
                            <span className="s1">
                              <em className="e1">
                                {msg.Money}
                                <font>—{msg.Mines}</font>
                              </em>
                              <em className="e2">领取红包</em>
                            </span>
                            <span className="s2">扫雷红包</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          </div>
          <ModalPage
            isOpen={!!this.state.detailId}
            animation="lift"
            onClose={() => {
              this.setState({
                detailId: false,
              })
            }}
          >
            {!!this.state.detailId && <RedpacketDetail id={this.state.detailId} />}
          </ModalPage>
          <ModalPage
            isOpen={!!this.state.selectedRedpacket}
            animation="lift"
            onClose={() => {
              this.setState({ selectedRedpacket: false })
            }}
          >
            <div>
              {this.state.selectedRedpacket && (
                <div className="grep-redpacket-dialog" onClick={this.grepRedpacket.bind(this, this.state.selectedRedpacket)}>
                  <img src={util.buildAssetsPath("/file/reds/chai.png")} />
                  <p>
                    <span>
                      {this.state.selectedRedpacket.Avatar != "null" ? (
                        <img width="18" height="18" src={this.state.selectedRedpacket.Avatar} />
                      ) : (
                        <Icon icon="ion-person" />
                      )}
                    </span>
                    <span>{this.state.selectedRedpacket.NickName}</span>
                  </p>
                  {this.state.grepLoading && (
                    <span className="grep-loading">
                      <Icon icon="ion-load-d" />
                    </span>
                  )}
                </div>
              )}
              <div className="close" style={{ fontSize: 25, marginTop: 0 }}>
                <Icon
                  className="ion-android-close"
                  onClick={() => {
                    this.setState({ selectedRedpacket: null })
                  }}
                />
              </div>
            </div>
          </ModalPage>
          <ModalPage
            isOpen={this.state.showPickRedpacket}
            animation="lift"
            onClose={() => {
              this.setState({ showPickRedpacket: false })
            }}
          >
            <div>
              {this.state.showPickRedpacket && (
                <PickRedpacket id={this.roomId} showRedpacketDetail={(detailId) => this.showRedpacketDetail(detailId)} />
              )}
            </div>
          </ModalPage>
        </LayoutPage>
      )
    }
    appendMessageList(incomingList, position) {
      if (position == "tail") {
        this.setState({ msgList: [].concat(this.state.msgList, incomingList) })
        setTimeout(() => {
          this.scrollToBottom()
        }, 100)
      } else {
        let box = this.chatContentBoxRef.current
        let list = this.chatListRef.current
        let l = list.offsetHeight - box.scrollTop
        this.setState({ msgList: [].concat(incomingList, this.state.msgList) }, () => {
          box.scrollTop = list.offsetHeight - l
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
      this.chatHub.invoke("GetPageList", pageIndex, pageSize, this.roomId, -1, -1)
    }
    sendMessage(msg) {
      this.chatHub.invoke("Send", this.roomId, msg.type, msg.content || null, msg.money || 0, msg.mines || 0)
    }
    grepRedpacket(msg) {
      if (!this.state.grepLoading) {
        this.setState({ grepLoading: true })
        this.chatHub
          .invoke("Get", msg.ID)
          .done(function () {
            console.log("doneGet55555555")
          })
          .fail(function () {
            console.log("failGet55555555")
          })
      }
    }

    listenMessage() {
      let _this = this
      this.chatHub.on("onMessageList", function (list) {
        //console.log('onMessageList', list);
        _this.setState({ isLoadingHistory: false })
        _this.appendMessageList(list, "head")
      })
      this.chatHub.on("updateMessage", function (list) {
        _this.updateMessageList(list)
        //console.log("updateMessage" , list);
      })
      this.chatHub.on("onMessage", function (list) {
        //console.log("onMessage", list);
        _this.appendMessageList(list, "tail")
      })
      this.chatHub.on("onUserList", function () {
        //console.log("onUserList", arguments);
      })
      this.chatHub.on("onMsg", function (msg) {
        console.log(msg)
        console.log("onMsg", arguments)

        if (typeof msg == "string") {
          apiNotification.alert({ Code: -1, Message: msg }, {}, this.props)
        } else if (typeof msg == "object") {
          if (msg.Code != 1) {
            apiNotification.alert(msg, {}, this.props)
            _this.setState({ grepLoading: false })
          } else if (msg.Message == "领取红包成功") {
            _this.showRedpacketDetail(_this.state.selectedRedpacket.ID)
            _this.setState({ selectedRedpacket: null, grepLoading: false })
          }
        }
        //console.log('onMsg',msg);
      })
      this.chatHub.on("onLog", function (msg) {
        console.log(msg)
        console.log("onLog", arguments)
      })
    }
    isMe(msg) {
      let user = util.cache.get("user")
      return msg.UID == user.ID
    }
    isFinished(msg) {
      return msg.Status == 1 || msg.Status == 2
    }
    onRedpacketClick(msg) {
      if (msg.Status == 0 && msg.Receive == false && msg.UID != this.user.ID) {
        //可抢红包
        this.setState({ selectedRedpacket: msg })
      } else {
        this.showRedpacketDetail(msg.ID)
      }
    }
  }
)
