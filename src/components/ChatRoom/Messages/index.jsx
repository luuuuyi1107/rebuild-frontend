import util from "@/magic/util"
import AvatarIcon from "@/components/AvatarIcon"
import { withRouter } from "@/magic/withRouter"
import MessageItem from "./MessageItem"
import ShareBet from "./shareBet"
import ShareWin from "./shareWin"
import "./style.scss"
import dayjs from "dayjs"
import ObsverComp from "@/components/ObsverComp"
export default withRouter((props) => {
  const timeSpliter = []

  const images = props.value
    .map((msg) => msg.content.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/g))
    .filter((img) => img)
    .flat()

  return props.value.map((msg) => {
    let rebuildMsg = msg.content.replace(/\(strong\)(.*?)\(\/strong\)/g, "<span class='strong'>$1</span>")
    rebuildMsg = rebuildMsg.replace(/\(span=gbzy\)(.*?)\(\/span\)/g, "<span class='red'>$1</span>")
    let shareBet = null
    let shareWin = null
    let shareStatus = "未开奖"
    let newBetTexts = []
    let overTime = false
    let OpTime = 0

    const isManager = msg.UID == 0 || props.managerList.includes(msg.UID)

    function compareTime(time1, time2) {
      // 将时间字符串转换为分钟数，便于比较
      const getMinutes = (timeStr) => {
        if (!timeStr) return 0
        const [hours, minutes, seconds] = timeStr.split(":").map(Number)
        return hours * 60 + minutes + seconds / 60
      }

      const minutes1 = getMinutes(time1)
      const minutes2 = getMinutes(time2)

      return minutes1 > minutes2
    }

    if (msg.Type !== 5 && !rebuildMsg.includes("(quote)") && rebuildMsg.charAt(0) == "{" && rebuildMsg.charAt(rebuildMsg.length - 1) == "}") {
      const share = JSON.parse(rebuildMsg)

      if (!share.LoID) {
        shareWin = share
      } else {
        shareBet = share
        newBetTexts = shareBet.BetText.split("|")
          .filter((val) => !!val)
          .map((val) => val.split(","))

        if (msg.Status == 1) {
          shareStatus = "已中奖"
        } else if (msg.Status == 2) {
          shareStatus = "未中奖"
        } else if (msg.Status == 3) {
          shareStatus = "打和退款"
        } else if (msg.Status == 4) {
          shareStatus = "已撤销"
        }
        OpTime = msg.OpTime.split("T")[1]

        const serverTime = util.date.format(util.getServerTime(), "HH:mm:ss")
        overTime = serverTime && compareTime(OpTime, serverTime)
      }
    }
    let StartDay = ""
    let EndDay = ""
    let todayText = util.date.format(new Date(), "YYYY-MM-DD")
    let today = false
    if (msg.Type !== 5 && shareWin) {
      StartDay = shareWin?.StartDay?.toString()
      EndDay = shareWin?.EndDay?.toString()
      todayText = todayText.replace(/\-/g, "")
      if (todayText == StartDay && todayText == EndDay) {
        today = true
      } else {
        StartDay = StartDay?.slice(4, 6) + "月" + StartDay?.slice(6, 8) + "日"
        EndDay = EndDay.slice(4, 6) + "月" + EndDay.slice(6, 8) + "日"
      }
    }

    const spliterTime = msg?.time

    return (
      <div className="chat-messages" key={msg.id}>
        <ObsverComp
          onVisible={() => {
            props.onVisibled(msg.UID)
          }}
        />
        {spliterTime && (
          <div className="spliter">
            <span>{spliterTime}</span>
          </div>
        )}
        <div className={`chat_msg ${msg.isMe ? "right" : "left"}`}>
          <div
            className="user-info"
            onClick={() => {
              if (msg.UID != 0) {
                // props.router.isLoginToOrRedirect("/interaction/userInfoData", { id: msg.UID })
                props.showUserInfo({ ID: msg.UID, Name: msg.fromName, Avatar: msg.Avatar })
              }
            }}
            onTouchStart={() => props.startAT(msg.fromName, msg.isMe)}
            onTouchMove={() => props.moveAT(msg.isMe)}
            onTouchEnd={() => props.endAT(msg.isMe, msg.UID)}
          >
            {/* {isManager 
              ? <div className="systemAvatar" /> 
              : <AvatarIcon src={msg.Avatar} className="w-[0.8rem] h-[0.8rem]" />} */}

            {msg.Avatar && msg.fromName !== "系统通知" ? (
              <AvatarIcon src={msg.Avatar} className="w-[0.8rem] h-[0.8rem]" />
            ) : (
              <div className="systemAvatar" />
            )}
          </div>
          <div className="message-body">
            <label className={`user-name ${isManager ? "is-manager" : ""}`}>{msg.fromName}</label>
            <div className={`${isManager ? "system-message" : "user-message"}`}>
              {!shareBet && !shareWin ? (
                <MessageItem content={rebuildMsg} fromName={msg.fromName} fromTime={msg.time} allImages={images} />
              ) : shareBet && !shareWin ? (
                <div className="inner">
                  <ShareBet
                    shareBet={shareBet}
                    isMe={msg.isMe}
                    overTime={overTime}
                    shareStatus={shareStatus}
                    onClick={() => {
                      props.setFollowBetModal(shareBet, OpTime, newBetTexts)
                    }}
                  />
                </div>
              ) : shareWin && !shareBet ? (
                <div className="inner">
                  <ShareWin shareWin={shareWin} StartDay={StartDay} EndDay={EndDay} today={today} />
                </div>
              ) : null}
            </div>{" "}
          </div>
        </div>
      </div>
    )
  })
})
