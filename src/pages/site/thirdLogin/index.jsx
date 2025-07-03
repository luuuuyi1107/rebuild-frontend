import { getPush } from "@/action/apis"
import LayoutPage from "@/components/LayoutPage"
import LoginForm from "@/components/LoginForm"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import React from "react"
import "./style.scss"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        needVerify: false,
        userSet: {},
        verifyed: false,
        userName: util.cache.getCookie("loginUser") || "",
        password: "",
        apiLoading: false,
        AnswerRecMoney: null,
        EnableDevice: null,
        key: 0,
        answer: "",
        clientid: "",
        RedirectUri: "",
      }
    }

    handleUnload = () => {
      util.cache.removeStartsWith("YD0", "all")
    }

    componentWillUnmount() {
      window.removeEventListener("beforeunload", this.handleUnload)
    }

    componentDidMount() {
      const _clientId = this.props.route.query.client_id || this.props.route.query.client_Id || ""
      const _redirectUri = this.props.route.query.redirect_uri || this.props.route.query.Redirect_Uri || ""
      const _loginGuid = this.props.route.query.login_guid || this.props.route.query.Login_Guid || ""
      const _loginSecrt = util.getUrlParam("login_secret") || util.getUrlParam("Login_Secret") || ""

      if (!_clientId || !_redirectUri || !_loginGuid || !_loginSecrt) {
        notificationAsync.alert("缺少参数").then(() => {
          window.history.back()
        })
        return
      }
      this.setState({
        clientid: _clientId,
        RedirectUri: _redirectUri,
        loginGuid: _loginGuid,
        loginSecrt: _loginSecrt,
      })

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

    oauthCodeBuilder(url, code) {
      const decodeUrl = decodeURIComponent(url)
      const parsedUrl = new URL(decodeUrl)
      if (parsedUrl.href.includes("#")) {
        const hashParts = parsedUrl.hash.split("?")
        const searchParams = hashParts.length > 1 ? hashParts[1] : ""

        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.append("Oauth_Code", code)

        return `${parsedUrl.origin}${parsedUrl.pathname}#/?${newSearchParams.toString()}`
      } else {
        parsedUrl.searchParams.set("Oauth_Code", code)
        return parsedUrl.href
      }
    }

    render() {
      const showYidunButton = this.state.needVerify && !this.state.verifyed
      return (
        <LayoutPage onBack={null} apiLoading={this.state.apiLoading} className="site-third-login" center="登录" right={null}>
          <LoginForm
            needCheckBindEmail={false}
            showYidunButton={showYidunButton}
            apiLoading={this.state.apiLoading}
            userSet={this.state.userSet}
            userName={this.state.userName}
            password={this.state.password}
            verifyed={this.state.verifyed}
            clientid={this.state.clientid}
            loginGuid={this.state.loginGuid}
            loginSecrt={this.state.loginSecrt}
            updateState={(data) => {
              this.setState({ ...this.state, ...data })
            }}
            loginResult={(res) => {
              window.location.href = this.oauthCodeBuilder(this.state.RedirectUri, res.Oauth_Code)
            }}
          />
        </LayoutPage>
      )
    }
  }
)
