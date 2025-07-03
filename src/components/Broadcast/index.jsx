import React from "react"
import { Icon } from "react-onsenui"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import { ConvertMessageData } from "@/components/HttpChatPage/Messages"
import { preloadMessageList } from "@/contexts/BroadcastContext/MessageManager"
import { withEmojiContext } from "@/contexts/EmojiContext"
export default withEmojiContext(
  withRouter(
    class extends React.PureComponent {
      constructor(props) {
        super(props)
        this.state = {
          Broadcast: null,
        }
      }

      componentDidMount() {
        window.addEventListener("globalMessage", this.update.bind(this))
      }

      update(event) {
        let data = event.detail
        if (data && data.Broadcast) {
          this.setState({ Broadcast: data.Broadcast })
        }
      }

      componentWillUnmount() {
        window.removeEventListener("globalMessage", this.update.bind(this))
      }

      // fetchPreloadMessageList = async ({ GroupID, ToID }) => {
      //   if (!GroupID || !ToID) return
      //   const res = await preloadMessageList(GroupID, ToID)
      //   if (res.Code !== 1) return
      //   util.cache.set(`messageList_${broadcast.GroupID}_${broadcast.ToID}`, res.Data, "session")
      // }

      render() {
        let broadcast = this.state.Broadcast
        if (!broadcast) {
          return null
        }

        var isSpecial = false

        if (broadcast && broadcast.Text) {
          preloadMessageList(broadcast.GroupID, broadcast.ToID)

          if (broadcast.Text.indexOf("interaction/getRedPacket") !== -1) {
            var txt = broadcast.Text.substring(1, broadcast.Text.length)
            var firstCart = txt.indexOf("]")
            var LastCart = txt.indexOf("[")
            var desc = txt.substring(firstCart + 1, LastCart)
            broadcast.Text = desc
            isSpecial = true
          } else {
            // 新增处理逻辑：检查是否为图片、影片或音乐连结
            const imageRegex = /\.(jpeg|jpg|gif|png|webp)$/i
            const videoRegex = /\.(mp4|avi|mov|wmv|flv|mkv)$/i
            const audioRegex = /\.(mp3|wav|ogg|flac)$/i

            if (imageRegex.test(broadcast.Text)) {
              broadcast.Text = "分享图片"
            } else if (videoRegex.test(broadcast.Text)) {
              broadcast.Text = "分享影片"
            } else if (audioRegex.test(broadcast.Text)) {
              broadcast.Text = "分享音乐"
            } else if (this.props.emojiData?.emojiList.some((emoji) => emoji.Code === broadcast.Text)) {
              broadcast.Text = `<img style="height: 32px; margin-left: 15px; display: block;" src="${this.props.emojiData?.emojiList?.find((emoji) => emoji.Code === broadcast.Text).ImagePath
                }" alt="${broadcast.Text}" />`
            } else {
              const messageData = ConvertMessageData({ content: broadcast.Text }, 0)
              broadcast.Text = messageData.text
            }
          }
        }

        return (
          <div
            className={`broadcast-module ${this.props.className || ""}`}
            onClick={() => {
              //统一跑到 - 广播频道
              this.props.router.isLoginToOrRedirect("/interaction/chatchannel", { groupId: 0, toId: 0, title: "网站广播" })
              // this.props.router.isLoginToOrRedirect("/interaction/broadcast")
            }}
          >
            <Icon className="notice-icon" icon="ion-speakerphone"></Icon>
            <div className="marquee">
              <span className="name">{broadcast.NickName || ""} </span>
              {isSpecial ? (
                <span className="strong red">🧧您的专属红包尚未领取🧧</span>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: broadcast.Text }}></span>
              )}
            </div>
            <Icon className="subfix-icon" icon="ion-ios-arrow-forward" />
          </div>
        )
      }
    }
  )
)
