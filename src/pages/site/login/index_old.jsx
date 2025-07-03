import * as action from "@/action"
import { getPush } from "@/action/apis"
import LayoutPage from "@/components/LayoutPage"
import LoginForm from "@/components/LoginForm"
import * as apiNotification from "@/magic/ApiNotification"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import React from "react"
import Bus from "@/magic/EventBus"
import "./style.scss"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        needVerify: false,
        userSet: {},
        verifyed: false,
        // userName:"",
        userName: util.cache.getCookie("loginUser") || "",
        password: "",
        apiLoading: false,
        AnswerRecMoney: null,
        EnableDevice: null,
        showModal: false,
        showBindModal: false,
        verifyGUID: "",
        key: 0,
        answer: "",
      }
      this.childRef = React.createRef()
    }

    handleUnload = () => {
      util.cache.removeStartsWith("YD0", "all")
    }

    componentWillUnmount() {
      window.removeEventListener("beforeunload", this.handleUnload)
    }

    componentDidMount() {
      window.addEventListener("beforeunload", this.handleUnload)

      FingerprintJS.load()
        .then((fp) => fp.get())
        .then((result) => {
          localStorage.setItem("cur-device-id", result.visitorId)
        })
      getPush({ keys: ["userset"] }).then((userSetRes) => {
        if (userSetRes.Code == 1 && userSetRes.Data.UserSet) {
          this.setState({
            userSet: userSetRes.Data.UserSet,
            needVerify: userSetRes.Data.UserSet.LoginVerification == 2,
            AnswerRecMoney: userSetRes.Data.UserSet.AnswerRecMoney,
            EnableDevice: userSetRes.Data.UserSet.EnableDevice,
          })
        } else {
          apiNotification.alert(userSetRes, {}, this.props)
        }
      })
    }

    loadForumInfo() {
      //需要定期更新
      let res = action.post("betpost/try")
      return res.then((res) => {
        if (res.Data != null) {
          util.cache.set("default_forum_info", JSON.stringify(res.Data))
        }
      })
    }

    render() {
      const showYidunButton = this.state.needVerify && !this.state.verifyed
      return (
        <LayoutPage
          onBack={() => {
            const redirect = util.getUrlParam("redirect")
            if (redirect) {
              this.props.router.replace(redirect)
            } else {
              this.props.router.replace("/site/home")
            }
          }}
          apiLoading={this.state.apiLoading}
          className="site-login"
          center=""
          right={null}
        >
          <LoginForm
            needCheckBindEmail={true}
            showYidunButton={showYidunButton}
            apiLoading={this.state.apiLoading}
            userSet={this.state.userSet}
            userName={this.state.userName}
            password={this.state.password}
            verifyed={this.state.verifyed}
            updateState={(data) => {
              this.setState({ ...this.state, ...data })
            }}
            loginResult={(res) => {
              //检测账号是否绑定 安全问题,不管成功失败，都会进来
              this.loadForumInfo().then(() => {
                Bus.emit("broadcast.disconnect")

                util.cache.setCookie("loginUser", this.state.userName, "tomorrow")
                const redirect = this.props.route.query.redirect
                if (redirect) {
                  let regex = /[?&]token=[^&]+/
                  const reDirectPath = decodeURIComponent(redirect).replace(regex, "")
                  this.props.router.replace(reDirectPath)
                } else {
                  if (!res.Data.Mail) return
                  this.props.router.replace("/site/home")
                }
              })
            }}
          />
        </LayoutPage>
      )
    }
  }
)
