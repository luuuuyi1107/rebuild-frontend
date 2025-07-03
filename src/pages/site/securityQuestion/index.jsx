import React from "react"
import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import "./style.scss"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import questions from "@/components/SecurityInput/questions"
import { checkIsBindedDevice } from "@/magic/security"
import { withRouter } from "@/magic/withRouter"
import SecurityInput from "@/components/SecurityInput"
import { notificationAsync } from "@/magic/notification"
import { withLoginExceptTrial } from "@/magic/withLogin"

@withLoginExceptTrial
@withRouter
export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      modalCheck: -1,
      id_mail_verified: false,
      hasQuestion: false,
      chosen: "",
      answer: "",
      question: "",
      loading: true,
    }
  }

  componentDidMount() {
    this.loadData()
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => {
        localStorage.setItem("cur-device-id", result.visitorId)
      })
  }

  loadData() {
    checkIsBindedDevice().then(({ hasQuestion, answers, id_mail_verified }) => {
      const question = hasQuestion ? questions[parseInt(answers[0]) - 1] : "---"
      this.setState({ hasQuestion, question, id_mail_verified: id_mail_verified, loading: false })
    })
  }

  /***
   * 送出所有设备内容
   */
  onBindAnswer(content) {
    const deviceID = localStorage.getItem("cur-device-id")
    action.post("User/SetSafeAnswer", { content, deviceID }).then((res) => {
      if (res.Code == 1) {
        util.cache.remove("security")
        //设置完成，绑定 设备码
        notificationAsync.toast(res.Message)
        this.props.router.back()
      } else {
        notificationAsync.toast(res.Message)
      }
    })
  }

  render() {
    return (
      <LayoutPage loading={this.state.loading} className="security_question" center="安全问题" right={null}>
        <div className="px-[20px]">
          <SecurityInput
            checked={this.state.modalCheck}
            hasQuestion={this.state.hasQuestion}
            question={this.state.question}
            chosen={this.state.chosen}
            answer={this.state.answer}
            onClickQuestion={(modalCheck) => {
              this.setState({ modalCheck })
            }}
            onModalSelect={(chosen) => {
              this.setState({
                chosen,
                modalCheck: -1,
              })
            }}
            onAnswerChange={(value) => {
              this.setState({ answer: value })
            }}
            onBindAnswer={this.onBindAnswer.bind(this)}
          />
        </div>
      </LayoutPage>
    )
  }
}
