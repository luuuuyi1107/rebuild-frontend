import React from "react"

import RecordPage from "@/components/RecordPage"
import FriendNavigatorBar from "@/components/FriendNavigatorBar"

import "./style.scss"
import "../friendMessage/style.scss"
import { ListItem, Icon } from "react-onsenui"
import AvatarImg from "@/components/AvatarImg"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.config = {
        tabs: [
          {
            name: "好友列表",
            listApi: "User/GetFriendList",
            listApiMethod: "get",
            renderRow: (row, data) => {
              return (
                <ListItem
                  className="friend-record-item"
                  onClick={() => {
                    this.props.router.isLoginToOrRedirect(`/interaction/friendInfo`, { id: row.UID })
                  }}
                >
                  <div className="left">
                    <AvatarImg UID={row.UID} width={"0.8rem"} height={"0.8rem"} />
                  </div>
                  <div className="center">
                    <div>
                      <p className="tl">
                        {row.NickName}
                        <span className="light">ID: {row.UID}</span>
                      </p>
                      <p className="dd">暂无消息</p>
                    </div>
                  </div>
                  <div className="right">
                    <Icon icon="ion-ios-arrow-forward" />
                  </div>
                </ListItem>
              )
            },
          },
        ],
      }
      this.state = {
        apiLoading: false,
      }
    }

    onSearchFriend() {
      notificationAsync.prompt("添加好友", { title: "请输入会员ID", placeholder: "请输入会员ID", cancelable: true }).then((content) => {
        if (content !== null) {
          if (content && !isNaN(content)) {
            this.props.router.isLoginToOrRedirect("/interaction/friendInfo", { id: content })
          } else {
            notificationAsync.alert("ID错误", { title: "操作提示", cancelable: true })
          }
        }
      })
    }

    render() {
      return (
        <div>
          <RecordPage
            apiLoading={this.state.apiLoading}
            config={this.config}
            center="我的好友"
            right={() => <span onClick={this.onSearchFriend.bind(this)}>搜索添加好友</span>}
            renderFixed={() => <FriendNavigatorBar active="friends" />}
            className="friend-page frient-list"
          />
        </div>
      )
    }
  }
)
