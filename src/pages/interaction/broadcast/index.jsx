import React from "react"

import HttpChatPage from "@/components/HttpChatPage"
import util from "@/magic/util"

import "./style.scss"
import { withLogin } from "@/magic/withLogin"

export default withLogin(
  class extends React.PureComponent {
    render() {
      let user = util.cache.get("user")
      return (
        <HttpChatPage
          ref="http-chat-page"
          center={"网站广播"}
          listApi={{ url: "User/GetBroadcastList", params: {} }}
          sendApi={{ url: "User/SendBroadcast", params: {} }}
          right={null}
          shareBet={true}
          convert={(rawMsg) => {
            return {
              id: rawMsg.ID,
              fromName: rawMsg.NickName,
              isMe: rawMsg.UID == user.ID,
              UID: rawMsg.UID,
              content: rawMsg.Content,
              time: rawMsg.Time,
              OpTime: rawMsg.OpTime,
              Status: rawMsg.Status,
              Avatar: rawMsg.Avatar,
            }
          }}
        />
      )
    }
  }
)
