import React from "react"
import util from "@/magic/util"
import { Icon } from "react-onsenui"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
    }

    render() {
      return (
        <div className="home-navigator-bar">
          <div
            className={`download-app tab ${this.props.active == "home" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect(`/${this.props.PKGame}/home`)
            }}
          >
            <div className="icon">
              <Icon icon="ion-flag" />
            </div>
            <div className="text">大厅</div>
          </div>
          <div
            className={`download-app tab ${this.props.active == "allBet" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect(`/${this.props.PKGame}/allBetRecord`)
            }}
          >
            <div className="icon">
              <Icon icon="ion-cube" />
            </div>
            <div className="text">历史擂台</div>
          </div>
          <div
            className={`shop tab ${this.props.active == "mybet" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect(`/${this.props.PKGame}/myBetRecord`)
            }}
          >
            <div className="icon">
              <Icon icon="ion-navicon-round" />
            </div>
            <div className="text">我的记录</div>
          </div>
          <div
            className={`user-center tab ${this.props.active == "create" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect(`/${this.props.PKGame}/createTable`)
            }}
          >
            <div className="icon">
              <Icon icon="ion-ios-game-controller-b" />
            </div>
            <div className="text">摆放擂台</div>
          </div>
        </div>
      )
    }
  }
)
