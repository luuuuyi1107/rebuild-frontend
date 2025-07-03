import React from "react"
import CustomIcon from "@/components/CustomIcon"
import { Row, Col, Input, Button, Modal, Icon } from "react-onsenui"
import SendModal from "./SendModal"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      action: "",
      emojiList: [
        "😀",
        "😁",
        "😂",
        "😃",
        "😄",
        "😅",
        "😆",
        "😉",
        "😊",
        "😋",
        "😎",
        "😍",
        "😘",
        "😗",
        "😙",
        "😚",
        "😇",
        "😐",
        "😑",
        "😶",
        "😏",
        "😣",
        "😥",
        "😮",
        "😯",
        "😪",
        "😫",
        "😴",
        "😌",
        "😛",
        "😜",
        "😝",
        "😒",
        "😓",
        "😔",
        "😕",
        "😲",
        "😷",
        "😖",
        "😞",
        "😟",
        "😤",
        "😢",
        "😭",
        "😦",
        "😧",
        "😨",
        "😬",
        "😰",
        "😱",
        "😳",
        "😵",
        "😡",
        "😠",
      ],
      text: "",
    }
  }
  render() {
    let _this = this
    return (
      <div className="ft">
        <Row className="action-input">
          <Col width="40px" className="left">
            <span
              className={`emoji ${_this.props.speak ? "" : "disabled"}`}
              onClick={() => {
                this.props.speak && _this.setState({ action: _this.state.action == "" ? "showEmoji" : "" })
              }}
            >
              <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/emoji.svg")} />
            </span>
            {_this.state.action == "showEmoji" && (
              <div className="emoji-panel">
                {_this.state.emojiList?.map(function (e) {
                  return (
                    <span
                      onClick={() => {
                        _this.setState({ text: _this.state.text + e })
                      }}
                      key={e}
                    >
                      {e}
                    </span>
                  )
                })}
              </div>
            )}
          </Col>
          <Col className="center">
            <Input
              disabled={_this.props.speak ? false : true}
              placeholder={"请输入聊天内容"}
              value={_this.state.text}
              onInput={(e) => _this.setState({ text: e.target.value })}
              onFocus={() => {
                _this.setState({ action: "" })
              }}
            />
          </Col>
          <Col width="65px" className="right">
            {_this.state.text && <Button onClick={_this.sendText.bind(_this)}>发送</Button>}
            {!_this.state.text && (
              <span className={`send-redpacket-btn`}>
                <CustomIcon
                  onClick={() => {
                    this.setState({ action: "showSendMoal" })
                  }}
                  style={{ width: 20, height: 20 }}
                  className="redpacket-icon"
                  type={require("./icons/redpacket.svg")}
                />
                <span>发红包</span>
              </span>
            )}
          </Col>
        </Row>
        <Modal
          isOpen={this.state.action == "showSendMoal"}
          animation={"lift"}
          onDeviceBackButton={() => {
            this.setState({ action: "" })
          }}
          className="send-redpacket-modal"
        >
          <div>
            {this.state.action == "showSendMoal" && <SendModal {...this.props} onSend={this.onSendRedpacket.bind(this)} />}
            <div
              className="close"
              onClick={() => {
                this.setState({ action: "" })
              }}
            >
              <Icon icon="ion-android-close" />
            </div>
          </div>
        </Modal>
      </div>
    )
  }
  sendText() {
    if (!this.state.text) {
      notificationAsync.alert("不能发送空文本")
      return
    }
    let data = {
      type: 0,
      content: this.state.text,
    }
    this.props.onSend && this.props.onSend(data)
    this.setState({ text: "", action: "" })
  }
  onSendRedpacket(data) {
    data.type = 1
    this.props.onSend && this.props.onSend(data)
    this.setState({ action: "" })
  }
}
