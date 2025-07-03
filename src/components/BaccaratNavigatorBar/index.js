import React from "react"
import util from "@/magic/util"
import { Icon, ActionSheet, ActionSheetButton } from "react-onsenui"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        showRecordSwitch: false,
      }
    }

    render() {
      return (
        <div className="home-navigator-bar">
          <div
            className={`download-app tab ${this.props.active == "home" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect("/baccarat/home")
            }}
          >
            <div className="icon">
              <Icon icon="ion-flag" />
            </div>
            <div className="text">大厅</div>
          </div>
          <div
            className={`download-app tab ${this.props.active == "create" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect("/baccarat/createTable")
            }}
          >
            <div className="icon">
              <Icon icon="ion-ios-game-controller-b" />
            </div>
            <div className="text">马上开庄</div>
          </div>
          <div
            className={`shop tab ${this.props.active == "mybet" ? "active" : ""}`}
            onClick={() => {
              this.setState({ showRecordSwitch: true })
            }}
          >
            <div className="icon">
              <Icon icon="ion-navicon-round" />
            </div>
            <div className="text">我的下注</div>
          </div>
          <div
            className={`user-center tab ${this.props.active == "my-table" ? "active" : ""}`}
            onClick={() => {
              this.props.router.isLoginToOrRedirect("/baccarat/myTable")
            }}
          >
            <div className="icon">
              <Icon icon="ion-cube" />
            </div>
            <div className="text">我的台面</div>
          </div>
          <ActionSheet
            onCancel={() => {
              this.setState({ showRecordSwitch: false })
            }}
            visible={this.state.showRecordSwitch}
            animation="default"
            isCancelable={true}
          >
            <ActionSheetButton
              key={1}
              onClick={() => {
                this.setState({ showRecordSwitch: false })
                this.props.router.isLoginToOrRedirect("/baccarat/myBetRecord")
              }}
            >
              金臂百家乐
            </ActionSheetButton>
            <ActionSheetButton
              key={2}
              onClick={() => {
                this.setState({ showRecordSwitch: false })
                this.props.router.isLoginToOrRedirect("/baccarat/myHXBetRecord")
              }}
            >
              哈希百家乐
            </ActionSheetButton>
            <ActionSheetButton
              onClick={() => {
                this.setState({ showRecordSwitch: false })
              }}
              icon={"md-close"}
            >
              取消
            </ActionSheetButton>
          </ActionSheet>
        </div>
      )
    }
  }
)
