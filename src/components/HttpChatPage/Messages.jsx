import AvatarImg from "@/components/AvatarImg"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import defaults from "lodash/defaults"
import Quote from "@/components/HttpChatPage/Quote"
import Message from "./Message"

export const ConvertContent = (msg) => {
  let rebuildMsg = msg.content.replace(/\(strong\)(.*?)\(\/strong\)/g, "<span class='strong'>$1</span>")
  rebuildMsg = rebuildMsg.replace(/\(span=gbzy\)(.*?)\(\/span\)/g, "<span class='red'>$1</span>")
  return rebuildMsg.split("(quote)")
}

export const ConvertMessageData = (msg, ServerTime = 0) => {
  const content = ConvertContent(msg)
  let messageData = {
    content: "",
    quoteText: "",
    fromName: "",
    time: "",
    text: "",
    hasQuote: false,
    isShareType: false,
    shareStatus: "未开奖",
    shareBet: null,
    shareWin: null,
    newBetTexts: [],
    overTime: false,
    OpTime: 0,
  }

  if (content[0].charAt(0) == "{" && content[0].charAt(content[0].length - 1) == "}") {
    messageData.isShareType = true
    let share = JSON.parse(content[0])
    if (!share.LoID) {
      messageData.shareWin = share
    } else {
      messageData.shareBet = share
      messageData.newBetTexts = messageData.shareBet.BetText.split("|")
        .filter((val) => !!val)
        .map((val) => val.split(","))

      if (msg.Status == 1) {
        messageData.shareStatus = "已中奖"
      } else if (msg.Status == 2) {
        messageData.shareStatus = "未中奖"
      } else if (msg.Status == 3) {
        messageData.shareStatus = "打和退款"
      } else if (msg.Status == 4) {
        messageData.shareStatus = "已撤销"
      }
      messageData.OpTime = msg.OpTime.substr(6, msg.OpTime.length - 8)
      messageData.overTime = ServerTime && messageData.OpTime - ServerTime > 0
      // shareBet.GameID = shareBet.GameID.substr(8,shareBet.GameID.length-8)
    }
  } else if (content[0].includes("{") && content[0].includes("fromName") && content[0].includes("content")) {
    const originalString = content[0]
    const {
      content: quoteText,
      fromName,
      time = "",
    } = defaults(JSON.parse(originalString.substring(0, originalString.indexOf("}") + 1)), {
      content: "",
      fromName: "",
      time: "",
      text: "",
      hasQuote: true,
    })
    const text = originalString.substring(originalString.indexOf("}") + 1)
    messageData = { quoteText, fromName, time, text, hasQuote: true }
  } else if (content.length > 1) {
    // 旧版格式
    messageData = {
      quoteText: content[0],
      fromName: content[1],
      time: content[2],
      text: content[3],
      hasQuote: true,
    }
  } else {
    messageData.text = content[0]
  }

  return messageData
}

export default withRouter((props) => {
  return props.value.map((msg) => {
    const messageData = ConvertMessageData(msg, props.ServerTime)
    let StartDay = ""
    let EndDay = ""
    let todayText = util.date.format(new Date(), "YYYY-MM-DD")
    let today = false
    if (messageData.shareWin) {
      StartDay = messageData.shareWin.StartDay.toString()
      EndDay = messageData.shareWin.EndDay.toString()
      todayText = todayText.replace(/\-/g, "")
      if (todayText == StartDay && todayText == EndDay) {
        today = true
      } else {
        StartDay = StartDay.slice(4, 6) + "月" + StartDay.slice(6, 8) + "日"
        EndDay = EndDay.slice(4, 6) + "月" + EndDay.slice(6, 8) + "日"
      }
    }

    return (
      <div key={msg.id}>
        {msg.time && (
          <div className="spliter">
            <span>{msg.time}</span>
          </div>
        )}
        <div className={`chat_msg ${msg.isMe ? "right" : "left"}`}>
          <div
            className="user-info"
            onClick={() => {
              if (msg.UID != 0 && !util.platform.isWap()) {
                props.router.isLoginToOrRedirect(`/interaction/friendInfo`, { id: msg.UID })
              }
            }}
            onTouchStart={() => props.startAT(msg.fromName, msg.isMe)}
            onTouchMove={() => props.moveAT(msg.isMe)}
            onTouchEnd={() => props.endAT(msg.isMe, msg.UID)}
          >
            {msg.UID == 0 ? (
              <div className="systemAvatar"></div>
            ) : (
              <AvatarImg UID={msg.UID} avatarLink={msg.Avatar} width={"0.8rem"} height={"0.8rem"} />
            )}
            {/*<AvatarImg UID={msg.UID} width={"0.8rem"} height={"0.8rem"}/>*/}
          </div>
          <div className="message-body">
            <label
              className="user-name"
              style={msg.UID == 0 ? { color: "#e8505b" } : { color: "#000" }}
              // onTouchStart={()=>this.startAT(msg.fromName,msg.isMe)}
              // onTouchMove={()=>this.moveAT(msg.isMe)}
              // onTouchEnd={()=>this.endAT(msg.isMe)}
            >
              {msg.fromName}
            </label>
            <p
              className={`${msg.UID == 0 ? "systemMessage" : "Message"} ${messageData.isShareType && "shareType"}`}
              onClick={() => {
                if (!msg.isMe && !messageData.isShareType) {
                  props.setEffecMenuData(msg)
                }
              }}
            >
              {messageData.hasQuote && <Quote text={messageData.quoteText} time={messageData.time} name={messageData.fromName} />}
              {messageData.hasQuote && <Message text={messageData.text} />}
              {!messageData.hasQuote && !messageData.isShareType && <Message text={messageData.text} />}
              {!messageData.hasQuote && messageData.shareBet && (
                //    分享投注
                <span className="shareBet">
                  <span className="shareBetTitle">
                    <span>{messageData.shareBet.GameTitle}</span>
                    <span>{messageData.shareBet.GameID}期</span>
                  </span>
                  <span className="shareBetContent">
                    <span className="info">
                      <span>{messageData.shareBet.BetName}</span>
                      <span>{messageData.shareBet.BetText}</span>
                      <span>{messageData.shareBet.BetMoney}元</span>
                    </span>
                    <span className="status">
                      <span>状态:{messageData.shareStatus}</span>
                    </span>
                    {messageData.shareStatus == "未开奖" && !msg.isMe && messageData.overTime && (
                      <span
                        className="followBet"
                        onClick={() => {
                          props.setFollowBetModal(messageData.shareBet, messageData.OpTime, messageData.newBetTexts)
                        }}
                      >
                        跟投
                      </span>
                    )}
                  </span>
                </span>
              )}
              {!messageData.hasQuote && messageData.shareWin && (
                //    分享胜率
                <span className="shareWin">
                  <span className="shareWinTitle">
                    <span>{util.findGameId(messageData.shareWin.LotteryID)}</span>
                    <span>{today ? "今日" : StartDay == EndDay ? StartDay : StartDay + "-" + EndDay}</span>
                  </span>
                  <span className="shareWinContent">
                    <span className="shareWinItem shareWin_betMoney">
                      <span className="number">{messageData.shareWin.BetMoney}</span>
                      <span className="text">投注</span>
                    </span>
                    <span className="shareWinItem shareWin_winMoney">
                      <span className="number">{messageData.shareWin.WinMoney}</span>
                      <span className="text">奖金</span>
                    </span>
                    <span className="shareWinItem shareWin_profitLoss">
                      <span className="number">{messageData.shareWin.ProfitLoss}</span>
                      <span className="text">盈亏</span>
                    </span>
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  })
})
