import React from "react"

import RecordPage from "@/components/RecordPage"
import FriendNavigatorBar from "@/components/FriendNavigatorBar"
import util from "@/magic/util"

import "./style.scss"
import AvatarImg from "@/components/AvatarImg"
import { ListItem, Icon } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        avatar: false,
      }
      this.config = {
        tabs: [
          {
            name: "消息",
            listApi: "User/GetDialogueList",
            listApiMethod: "get",
            renderRow: (row, data) => {
              let avatarImg = false
              return (
                <ListItem
                  className="friend-record-item"
                  key={row.UID}
                  onClick={() => {
                    this.props.router.isLoginToOrRedirect(`/interaction/friendChat`, { id: row.UID, name: row.NickName })
                  }}
                >
                  <div className="left">
                    <AvatarImg UID={row.UID} width={".8rem"} height={".8rem"} />
                    {row.NewMsg ? <span className="count">{row.NewMsg}</span> : null}
                  </div>
                  <div className="center">
                    <div>
                      <p className="tl">{row.NickName}</p>
                      <p className="dd">
                        {row.LastTime} {row.Content}
                      </p>
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
    }

    render() {
      return <RecordPage config={this.config} center="好友消息" renderFixed={() => <FriendNavigatorBar active="message" />} className="friend-page" />
    }
  }
)
