import React from "react"
import LayoutPage from "@/components/LayoutPage"
// ;
import * as action from "@/action"
import { Button } from "react-onsenui"
import "./style.scss"
import InputBox from "@/components/InputBox"
import Bus from "@/magic/EventBus"
import util from "@/magic/util"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      content: "",
      title: "",
    }
  }

  componentDidMount() {}

  sendMessage() {
    let validate = this.check()
    if (validate) {
      notificationAsync.alert(validate, { title: "提现信息错误" })
      return
    }

    action.post(
      "Book/PostBook",
      {
        title: this.state.title,
        content: this.state.content,
        nickname: this.props.nickname,
      },
      (res) => {
        if (res.Code == 1) {
          Bus.emit(`tab.reload.${util.getUrlParam("tab") || "全部留言"}`)
          notificationAsync.alert(res.Message, { title: "成功" })
        } else {
          notificationAsync.alert(res.Message, { title: "操作提示" })
        }
      }
    )
  }

  check() {
    if (!this.state.title) {
      return "标题不能为空"
    }
    if (!this.state.content) {
      return "留言不能为空"
    }
    return ""
  }

  render() {
    return (
      <LayoutPage className="sent-msg" title="发表留言" right={null}>
        <div className="content">
          <div className="item">
            <div className="title">留言标题:</div>
            <div className="text">
              <InputBox
                placeholder="请输入标题(15字以内)"
                type="text"
                name="amount"
                onChange={(value) => {
                  this.setState({ title: value })
                }}
                value={this.state.title}
              />
            </div>
          </div>
          <div className="enter-area">
            <div className="title">留言:</div>
            <div className="text">
              <textarea
                className="textarea"
                onChange={(e) => {
                  this.setState({ content: e.target.value })
                }}
                rows="3"
                placeholder="请输入留言"
              ></textarea>
            </div>
          </div>
          <div className="submit">
            <Button
              onClick={() => {
                this.sendMessage()
              }}
            >
              确认
            </Button>
          </div>
        </div>
      </LayoutPage>
    )
  }
}
