import React from "react"
import { Icon } from "react-onsenui"
import * as action from "@/action"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        newestMsg: null,
      }
    }

    componentDidMount() {
      window.addEventListener("globalMessage", this.update.bind(this))
    }
    update(event) {
      let data = event.detail
      if (data && data.FristLatestMsg) {
        this.setState({ newestMsg: data.FristLatestMsg })
      } else {
        this.setState({ newestMsg: null })
      }
    }

    componentWillUnmount() {
      window.removeEventListener("globalMessage", this.update.bind(this))
    }

    goChat(customerServiceId, customerServiceName) {
      this.setState({ newestMsg: null })
      this.props.router.push(`/interaction/serviceChat?id=${customerServiceId}&name=${customerServiceName}`)
    }

    render() {
      let newestMsg = this.state.newestMsg
      if (!newestMsg) {
        return null
      }
      let customerServiceId = null
      let customerServiceName = ""
      let content = ""
      if (newestMsg && newestMsg.Content) {
        let rebuildMsg = newestMsg.Content.replace(/\(strong\)(.*?)\(\/strong\)/g, "<span class='strong'>$1</span>")
        rebuildMsg = rebuildMsg.replace(/\(span=gbzy\)(.*?)\(\/span\)/g, "<span class='red'>$1</span>")
        content = rebuildMsg.split("(quote)")
        customerServiceId = newestMsg.ID
        customerServiceName = newestMsg.Nick
      }
      return (
        <div
          className={`broadcast-module customer-service-msg ${this.props.className || ""}`}
          onClick={() => {
            this.goChat(customerServiceId, customerServiceName)
          }}
        >
          <div className="service-icon"></div>
          <div className="marquee">
            <span className="name">客服消息</span>:&nbsp;<span className="msg" dangerouslySetInnerHTML={{ __html: content }}></span>
          </div>
          <Icon className="subfix-icon" icon="ion-ios-arrow-forward" />
        </div>
      )
    }
  }
)
