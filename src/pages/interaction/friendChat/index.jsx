import React, { createRef } from "react"

import HttpChatPage from "@/components/HttpChatPage"
import { Modal, Icon } from "react-onsenui"
import util from "@/magic/util"
import * as action from "@/action"

import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        showAction: false,
      }
      this.httpChatPageRef = createRef()
    }
    componentDidMount() {
      setTimeout(() => {
        getPush()
      }, 1500)
    }
    render() {
      let user = util.cache.get("user") || {}
      return (
        <div>
          <HttpChatPage
            ref={this.httpChatPageRef}
            center={this.props.route.query.name || "聊天"}
            listApi={{ url: "User/GetMessagesList", params: { id: this.props.route.query.id } }}
            sendApi={{ url: "User/SendMessage", params: { uid: this.props.route.query.id } }}
            right={() => (
              <span
                onClick={() => {
                  this.setState({ showAction: true })
                }}
              >
                <Icon style={{ fontSize: 28 }} icon="ion-android-more-horizontal" />
              </span>
            )}
            convert={(rawMsg) => {
              return {
                id: rawMsg.ID,
                fromName: rawMsg.From_NickName,
                isMe: rawMsg.From_UID == 0,
                UID: rawMsg.From_UID == 0 ? user.ID || 0 : rawMsg.From_UID,
                content: rawMsg.Content,
                time: rawMsg.Time ? util.date.format(util.date.toDate(rawMsg.Time), "MM月DD日 hh:mm:ss") : undefined,
              }
            }}
          />
          <Modal
            isOpen={this.state.showAction}
            className="action-pop-menu-modal"
            animation="fade"
            onClick={() => {
              this.setState({ showAction: false })
            }}
          >
            <div className="menus group">
              <div className="menu" onClick={this.onMenuClick.bind(this, 0)}>
                删除消息
              </div>
              <div className="menu" onClick={this.onMenuClick.bind(this, 1)}>
                删除好友
              </div>
            </div>
          </Modal>
        </div>
      )
    }
    async onMenuClick(index, e) {
      if (index == 0) {
        notificationAsync.confirm("确定要清空消息", { title: "清空消息" }).then(async () => {
          let res = await action.get("User/DeleteDialogue", { id: this.props.route.query.id })
          if (res.Code != 1) {
            notificationAsync.alert(res.Message || "错误", {}, this.props)
          } else {
            //clearMessage
            this.httpChatPageRef.current?.clearMessage()
          }
        })
      }
      if (index == 1) {
        notificationAsync.confirm("确定要删除好友", { title: "删除好友" }).then(async () => {
          let res = await action.get("User/DeleteFriend", { Uid: this.props.route.query.id })
          if (res.Code != 1) {
            notificationAsync.alert(res.Message || "错误", {}, this.props)
          } else {
            notificationAsync.alert(res.Message, { title: "消息" }).then(() => {
              this.props.router.back()
            })
          }
        })
      }
    }
  }
)
