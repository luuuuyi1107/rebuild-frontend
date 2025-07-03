import React from "react"
import util from "@/magic/util"
import RecordPage from "@/components/RecordPage"
import MessageContent from "./messageContent"
import SendMessage from "./sendMessage"
import { useTabs } from "./tabs"
import ClipboardJS from "clipboard"
import ModalPage from "@/components/ModalPage"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import "./style.scss"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        showMessageContent: false,
        showSendMessage: false,
        messageContentId: null,
        nickname: "",
        // config: null, // useTabs(util.isLogin(), this.openMessage.bind(this)), // { tabs: [{ name: null }] }
        config: useTabs(util.isLogin(), this.openMessage.bind(this)), // { tabs: [{ name: null }] }
        version: new Date().getTime(),
      }
    }

    openMessage(messageContentId) {
      this.setState({
        messageContentId,
        showMessageContent: true,
        showSendMessage: false,
      })
    }

    componentDidMount() {
      this.listenClipboard()
      this.loadData()
    }
    componentWillUnmount() {
      this.clipboardInstance?.destroy()
    }

    listenClipboard() {
      this.clipboardInstance = new ClipboardJS(".copy-btn")
      this.clipboardInstance.on("success", function (e) {
        notificationAsync.alert("已成功复制到剪贴板", {
          title: "复制成功",
        })
      })

      this.clipboardInstance.on("error", function (e) {
        notificationAsync.alert("请手动选择文字进行复制", {
          title: "复制失败",
        })
      })
    }

    async loadData() {
      let res = await getPush()
      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      this.setState({ nickname: res.Data.UserData.NickName })
    }

    render() {
      return (
        <div>
          <RecordPage
            config={this.state.config}
            className="interaction-suggestion"
            center="客服留言"
            right={
              <div
                className="text-[16px]"
                onClick={() => {
                  if (util.isLogin()) {
                    util.trialCheck()
                    this.setState({
                      showMessageContent: false,
                      showSendMessage: true,
                    })
                  } else {
                    this.props.router.push("/site/login")
                  }
                }}
              >
                发布留言
              </div>
            }
          />

          {/* 查看留言 */}
          <ModalPage
            isOpen={!!this.state.showMessageContent}
            className="report-record-modal align_left"
            animation="lift"
            onClose={() => {
              this.setState({ showMessageContent: false })
            }}
          >
            {this.state.showMessageContent && <MessageContent id={this.state.messageContentId} className="msg-modal"></MessageContent>}
          </ModalPage>

          {/*/!* 发布留言 *!/*/}
          <ModalPage
            isOpen={!!this.state.showSendMessage}
            className="report-record-modal align_left"
            animation="lift"
            onClose={() => {
              this.setState({ showSendMessage: false })
            }}
          >
            {this.state.showSendMessage && <SendMessage nickname={this.state.nickname} className="sent-msg-modal"></SendMessage>}
          </ModalPage>
        </div>
      )
    }
  }
)
