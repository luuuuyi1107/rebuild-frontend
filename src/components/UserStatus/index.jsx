import React from "react"
import util from "@/magic/util"
import { Icon } from "react-onsenui"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import { apiHandler } from "@/action"
import { userLogout } from "@/action/apis"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
    }

    logout() {
      apiHandler(() => userLogout()).then(() => this.props.router.push("/site/login"))
    }

    render() {
      let isLogin = util.isLogin()

      return (
        <div className="user-status">
          {!isLogin && (
            <div
              className="register"
              onClick={() => {
                this.props.router.push("/site/login")
              }}
            >
              <div>
                <Icon icon="ion-android-person-add" />
                注册
              </div>
            </div>
          )}
          {!isLogin ? (
            <div
              className="login"
              onClick={() => {
                this.props.router.push("/site/login")
              }}
            >
              <div>
                <Icon icon="ion-android-person" />
                登陆
              </div>
            </div>
          ) : (
            <>
              <div
                className="logout"
                onClick={() => {
                  this.props.router.push("/site/favorites")
                }}
              >
                <div>
                  收藏
                  <img className="w-[15px] h-[15px] ml-0.5 translate-y-[2px]" src={util.buildAssetsPath("assets/icons/ic_star.svg")} />
                </div>
              </div>
              <div className="logout" onClick={this.logout.bind(this)}>
                <div>
                  退出
                  <Icon className="-translate-y-[2px]" icon="ion-power" />
                </div>
              </div>
            </>
          )}
        </div>
      )
    }
  }
)
