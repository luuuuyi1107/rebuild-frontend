import ChatRoom from "@/components/ChatRoom"
import util from "@/magic/util"
import "./style.scss"

let time = 0

export default () => {
  if (Date.now() - time < 100) return null
  time = Date.now()
  let user = util.cache.get("user")
  const title = util.getUrlParam("title") || "广播"
  const groupId = +(util.getUrlParam("groupId") || "0")
  const toId = +(util.getUrlParam("toId") || "0")

  return (
    <ChatRoom
      center={title}
      allowVisitor="register"
      listApi={{ url: "User/GetBroadcastList", params: {} }}
      sendApi={{ url: "User/SendBroadcast", params: {} }}
      shareBet={true}
      toId={toId}
      groupId={groupId}
      convert={(rawMsg) => {
        return {
          id: rawMsg.ID,
          fromName: rawMsg.NickName,
          isMe: !user ? false : rawMsg.UID == user.ID,
          UID: rawMsg.UID,
          content: rawMsg.Content,
          time: rawMsg.Time,
          OpTime: rawMsg.OpTime,
          Status: rawMsg.Status,
          Avatar: rawMsg.Avatar,
          Type: rawMsg.Type,
        }
      }}
    />
  )
}
