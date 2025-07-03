import React, { createRef } from "react"

import RecordPage from "@/components/RecordPage"
import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"

import { Modal, ListItem, Icon } from "react-onsenui"
import "./style.scss"
import ModalPage from "@/components/ModalPage"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.renderRow = (row, data) => {
        if (row.Type === 1 && row.Content.includes("||")) row.Content = row.Content.split("||")[0]
        return (
          <ListItem
            className={`system-message-record-item ${row.Read == 0 ? "unread" : "read"}`}
            key={row.ID}
            onClick={this.onMessageClick.bind(this, row)}
          >
            <div className="left">
              <p>
                <span>{util.date.format(util.date.toDate(row.Time), "MM月DD日")}</span>
                <span>{util.date.format(util.date.toDate(row.Time), "hh:mm:ss")}</span>
              </p>
            </div>
            <div className="center">
              <div>
                <p className="tl">{row.SysName}</p>
                <div className="relative h-1.5">
                  <div className="absolute left-0 right-0">
                    <p
                      className="dd truncate"
                      dangerouslySetInnerHTML={{
                        __html: this.parseContent(row.Content, "list"),
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="right">
              <Icon icon="ion-ios-arrow-forward" />
            </div>
          </ListItem>
        )
      }
      this.config = {
        tabs: [
          {
            name: "未读系统消息",
            listApi: "User/GetNotifyList",
            listApiMethod: "get",
            filter: [{ key: "status", type: "hidden", defaultValue: 0 }],
            renderRow: this.renderRow,
          },
          {
            name: "管理客服消息",
            link: true,
            goWith: ["interaction", "serviceMessage"],
            messageNumber: true,
            listApi: "User/GetNotifyList",
            listApiMethod: "get",
            filter: [{ key: "status", type: "hidden", defaultValue: 0 }],
            renderRow: this.renderRow,
          },
          {
            name: "已读系统消息",
            listApi: "User/GetNotifyList",
            listApiMethod: "get",
            filter: [{ key: "status", type: "hidden", defaultValue: 1 }],
            renderRow: this.renderRow,
          },
        ],
      }
      this.state = {
        showAction: false,
        selectedMessage: null,
      }
      this.recordPageRef = createRef()
    }

    onMessageClick(row) {
      if (row.Read == 0) {
        action.get("User/SetNotifyRead", { id: row.ID })
      }
      // if (row.Content.includes("||")) row.Content = row.Content.split("||")[0]
      this.setState({
        selectedMessage: row,
      })
    }
    render() {
      let selectedMessage = this.state.selectedMessage
      return (
        <div>
          <RecordPage
            ref={this.recordPageRef}
            right={() => (
              <span
                onClick={() => {
                  this.setState({ showAction: true })
                }}
              >
                <Icon style={{ fontSize: 28 }} icon="ion-android-more-horizontal" />
              </span>
            )}
            config={this.config}
            center="系统消息"
            className="system-message-page"
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
                全部标为已读
              </div>
              <div className="menu" onClick={this.onMenuClick.bind(this, 1)}>
                删除已读消息
              </div>
              <div className="menu" onClick={this.onMenuClick.bind(this, 2)}>
                删除全部消息
              </div>
            </div>
          </Modal>
          <ModalPage
            isOpen={!!selectedMessage}
            className="message-detail-modal"
            animation="lift"
            onClose={() => {
              this.setState({ selectedMessage: false })
            }}
          >
            <div>
              {selectedMessage && (
                <LayoutPage center={selectedMessage.SysName} right={null}>
                  <div className="box">
                    <div className="hd">
                      <h3>{selectedMessage.SysName}</h3>
                      <p>{util.date.format(util.date.toDate(selectedMessage.Time), "YYYY年MM月DD日 hh:mm:ss")}</p>
                    </div>
                    <div className="bd" dangerouslySetInnerHTML={{ __html: this.parseContent(selectedMessage.Content) }}></div>
                  </div>
                </LayoutPage>
              )}
            </div>
          </ModalPage>
        </div>
      )
    }
    async onMenuClick(index) {
      if (index == 0) {
        let res = await action.get("User/SetNotifyRead")
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        } else if (res.Message) {
          notificationAsync.alert(res.Message, { title: "信息" })
          this.recordPageRef.current?.reload()
        }
      }
      if (index == 1) {
        let res = await action.get("User/DeleteNotify", { id: 0 })
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        } else if (res.Message) {
          notificationAsync.alert(res.Message, { title: "信息" })
          this.recordPageRef.current?.reload()
        }
      }
      if (index == 2) {
        let res = await action.get("User/DeleteNotify", { id: 1 })
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        } else if (res.Message) {
          notificationAsync.alert(res.Message, { title: "信息" })
          this.recordPageRef.current?.reload()
        }
      }
    }
    parseContent(content, type) {
      let reg = /\(friend=([^/"]*?)\)/g
      let res = reg.exec(content)
      if (res) {
        if (type == "list") {
          content = content.replace("(/friend)", " ")
          content = content.replace(res[0], "")
        } else {
          content = content.replace("(/friend)", "</a> ")
          content = content.replace(res[0], `<a href='/interaction/friendInfo?id=${res[1]}'>`)
        }
      }
      return content.includes("<br/>") ? content.split("<br/>")[0] : content
    }
  }
)
