import React, { createRef } from "react"

import HttpServiceChatPage from "@/components/HttpServiceChatPage"
import { Modal, Icon } from "react-onsenui"
import util from "@/magic/util"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"

import { setServiceMessageAsRead } from "@/action/apis"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"
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
      setServiceMessageAsRead()
    }

    render() {
      let user = util.cache.get("user") || {}
      return (
        <div>
          <HttpServiceChatPage
            ref={this.httpChatPageRef}
            center={this.props.route.query.name || "聊天"}
            listApi={{ url: "User/GetService_Msgs", params: { id: this.props.route.query.id } }}
            sendApi={{ url: "User/ReplyService_Msgs", params: { id: this.props.route.query.id } }}
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
                isMe: !rawMsg.Service,
                UID: user.ID,
                content: rawMsg.Content,
                time: rawMsg.Time,

                // Avatar:this.state.user?this.state.user.Avatar:null,
                // time: rawMsg.Time ? util.date.format(util.date.toDate(rawMsg.Time), "MM月DD日 hh:mm:ss") : undefined,
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
            </div>
          </Modal>
        </div>
      )
    }
    async onMenuClick(index, e) {
      if (index == 0) {
        notificationAsync.alert("确定要清空消息", { title: "清空消息" }).then(async (i) => {
          if (i == 1) {
            let res = await action.get("User/DeleteDialogue", { id: this.props.route.query.id })
            if (res.Code != 1) {
              apiNotification.alert(res, {}, this.props)
            } else {
              //clearMessage
              this.httpChatPageRef.current?.clearMessage()
            }
          }
        })
      }
    }
  }
)
