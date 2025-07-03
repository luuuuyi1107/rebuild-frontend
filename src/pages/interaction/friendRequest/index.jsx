import React, { createRef } from "react"

import RecordPage from "@/components/RecordPage"
import FriendNavigatorBar from "@/components/FriendNavigatorBar"
import util from "@/magic/util"
import * as action from "@/action"
import { notificationAsync } from "@/magic/notification"
import "../friendMessage/style.scss"
import { ListItem } from "react-onsenui"
import AvatarImg from "@/components/AvatarImg"
import { withRouter } from "@/magic/withRouter"
import * as apiNotification from "@/magic/ApiNotification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.renderRow = (row, data) => {
        return (
          <ListItem className="friend-record-item" key={row.RID}>
            <div className="left">
              <span className="user-icon">
                <AvatarImg UID={row.From_UID} width={".8rem"} height={".8rem"} />
              </span>
            </div>
            <div className="center">
              <div>
                <p className="tl">{row.From_NickName}</p>
                <p className="dd">{util.date.format(util.date.toDate(row.Time), "YYYY-MM-DD hh:mm:ss")}</p>
              </div>
            </div>
            <div className="right">
              {row.Status == 0 && (
                <span className="btn" onClick={this.reply.bind(this, row)}>
                  回复
                </span>
              )}
              {row.Status == 3 && <span className="btn disable">已通过</span>}
              {row.Status == 2 && <span className="btn disable">已拒绝</span>}
              {row.Status == 1 && <span className="btn disable">已忽略</span>}
            </div>
          </ListItem>
        )
      }
      this.config = {
        tabs: [
          {
            name: "未读好友请求",
            listApi: "User/GetFriendRequestList",
            listApiMethod: "get",
            filter: [
              { key: "id", type: "hidden", defaultValue: 0 },
              { key: "PageSize", type: "hidden", defaultValue: 50 },
            ],
            renderRow: this.renderRow,
          },
          {
            name: "全部好友请求",
            listApi: "User/GetFriendRequestList",
            listApiMethod: "get",
            filter: [
              { key: "id", type: "hidden", defaultValue: 1 },
              { key: "PageSize", type: "hidden", defaultValue: 50 },
            ],
            renderRow: this.renderRow,
          },
        ],
      }
      this.recordPageRef = createRef()
    }
    reply(row) {
      notificationAsync
        .originAlert(`${row.From_NickName}想添加你为好友`, {
          title: "好友请求",
          buttonLabels: ["拒绝", "忽略", "同意"],
          cancelable: true,
          class: "theme-notification",
        })
        .then(async (res) => {
          if (res == 0) {
            let res0 = await action.get("User/ModifyFriendRequest/Refuse", { rid: row.RID })
            if (res0.Code != 1) {
              apiNotification.alert(res0, {}, this.props)
            } else {
              notificationAsync.alert(res0.Message, { title: "信息" })
              this.recordPageRef.current?.reload()
            }
          } else if (res == 1) {
            let res1 = await action.get("User/ModifyFriendRequest/Ignore", { rid: row.RID })
            if (res1.Code != 1) {
              apiNotification.alert(res1, {}, this.props)
            } else {
              notificationAsync.alert(res1.Message, { title: "信息" })
              this.recordPageRef.current?.reload()
            }
          } else if (res == 2) {
            let res2 = await action.get("User/ModifyFriendRequest", { rid: row.RID })
            if (res2.Code != 1) {
              apiNotification.alert(res2, {}, this.props)
            } else {
              notificationAsync.alert(res2.Message, { title: "信息" })
              this.recordPageRef.current?.reload()
            }
          }
        })
    }
    async clearRequest() {
      notificationAsync.confirm(`清空所有请求`, { title: "确定清空所有请求？", cancelable: true }).then(async (res) => {
        if (res == 1) {
          let res = await action.post("User/DeleteFriendRequest", { day: 0 })
          if (res.Message) {
            notificationAsync.alert(res.Message, { title: "信息" })
          }
          if (res.Code == 1) {
            this.recordPageRef.current?.reload()
          }
        }
      })
    }
    render() {
      return (
        <RecordPage
          ref={this.recordPageRef}
          right={() => <span onClick={this.clearRequest.bind(this)}>清空请求</span>}
          config={this.config}
          center="好友请求"
          renderFixed={() => <FriendNavigatorBar active="friend-request" />}
          className="friend-page"
        />
      )
    }
  }
)
