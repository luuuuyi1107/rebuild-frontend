import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"

import "./style.scss"
import util from "@/magic/util"
import config from "@/config/config"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        text: "",
        serviceLink: null,
      }
    }
    componentDidMount() {
      getPush().then((User) => {
        if (User.Code == 1) {
          this.props.router.push("/site/home")
        }
        this.setState({ text: User.Message, serviceLink: User.Data.ServiceLink })
      })
    }

    render() {
      return (
        <LayoutPage
          apiLoading={this.state.apiLoading}
          className="site-login-matain"
          center="维护说明"
          onBack={async () => {
            let User = await getPush()
            if (User.Code == 1) {
              this.props.router.push("/site/home")
            }
          }}
          right={null}
        >
          <div className="top-box">
            <div className="logo"></div>
          </div>
          <div className="content">
            {this.state.text}
            <div className="link">
              如有疑问，请
              <a
                onClick={() => {
                  const serviceLink = config.serviceLink || this.state.serviceLink
                  const prev = serviceLink.startsWith("http") ? "" : "/"
                  util.open(prev + serviceLink, "_self")
                }}
                target="_blank"
              >
                联系客服
              </a>
            </div>
          </div>
        </LayoutPage>
      )
    }
  }
)
