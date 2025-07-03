import React from "react"
import { Icon } from "react-onsenui"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        Friends: 0,
        Notifys: 0,
        Message: 0,
        Service_Msgs: 0,
      }
    }
    componentDidMount() {
      window.addEventListener("globalMessage", this.update.bind(this))
      this.showPage()
    }
    componentWillUnmount() {
      window.removeEventListener("globalMessage", this.update.bind(this))
    }
    update(event) {
      let MsgCount = event.detail.MsgCount
      this.setState({
        Friends: MsgCount.Friends,
        Notifys: MsgCount.Notifys,
        Message: MsgCount.Messages,
        Service_Msgs: MsgCount.Service_Msgs,
      })
    }
    async showPage(e) {
      if (e && e.persisted) {
        this.setState({ Friends: 0, Notifys: 0, Message: 0, Service_Msgs: 0 })
        let res = await getPush()
        if (res.Code == 1) {
          this.update({ detail: res.Data })
        }
      }
    }

    render() {
      let number = this.state.Friends
      let msgNumber = this.state.Message

      return (
        <div className="home-navigator-bar">
          <div
            className={`download-app tab ${this.props.active == "message" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect("/interaction/friendMessage")
            }}
          >
            <div className="icon">
              <Icon icon="ion-chatbubbles" />
            </div>
            <div className="text">消息</div>
            {msgNumber > 0 ? <span className="bubble">{msgNumber > 99 ? <i>&middot;&middot;&middot;</i> : msgNumber}</span> : null}
          </div>
          <div
            className={`shop tab ${this.props.active == "friends" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect("/interaction/friendList")
            }}
          >
            <div className="icon">
              <Icon icon="ion-person-stalker" />
            </div>
            <div className="text">好友</div>
          </div>
          <div
            className={`user-center tab ${this.props.active == "friend-request" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect("/interaction/friendRequest")
            }}
          >
            <div className="icon">
              <Icon icon="ion-at" />
            </div>
            <div className="text">发现</div>
            {number > 0 ? <span className="bubble">{number > 99 ? <i>&middot;&middot;&middot;</i> : number}</span> : null}
          </div>
        </div>
      )
    }
  }
)
