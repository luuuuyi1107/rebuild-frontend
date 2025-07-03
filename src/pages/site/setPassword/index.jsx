import * as action from "@/action"
import { userLogout } from "@/action/apis"
import InputBox from "@/components/InputBox"
import LayoutPage from "@/components/LayoutPage"
import { withRouter } from "@/magic/withRouter"
import React from "react"
import { Button } from "react-onsenui"
import "./style.scss"
import { notificationAsync } from "@/magic/notification"

@withRouter
export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      oldPassword: "",
      newPassword: "",
      conformPassword: "",
      apiLoading: false,
    }
  }
  componentDidMount() {}

  changePassword() {
    let validate = this.check()
    if (validate) {
      notificationAsync.alert(validate)
      return
    }

    this.setState({ apiLoading: true })
    action.post(
      "User/ModifyPass",
      {
        oldPassword: this.state.oldPassword,
        password: this.state.newPassword,
      },
      (res) => {
        this.setState({ apiLoading: false })
        if (res.Code == 1) {
          userLogout()
          notificationAsync.alert(res.Message, { title: "成功" }).then(() => {
            this.props.router.replace("/site/securityCenter")
          })
        } else {
          notificationAsync.alert(res.Message, { title: "错误" })
        }
      }
    )
  }

  check() {
    if (!this.state.oldPassword) {
      return "原密码不能为空!"
    }
    if (!this.state.newPassword) {
      return "新密码不能为空!"
    }
    if (this.state.newPassword != this.state.conformPassword) {
      return "确认密码与新密码不相符"
    }

    return ""
  }

  render() {
    return (
      <LayoutPage className="site-set-pwd" center="密码设置" right={null} apiLoading={this.state.apiLoading}>
        <div className="content">
          <InputBox
            placeholder="请输入当前所使用的密码"
            icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
            type="password2"
            name="oldPassword"
            onChange={(value) => {
              this.setState({ oldPassword: value })
            }}
            value={this.state.oldPassword}
          />
          <InputBox
            placeholder="请输入新密码"
            icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
            type="password2"
            name="newPassword"
            onChange={(value) => {
              this.setState({ newPassword: value })
            }}
            value={this.state.newPassword}
          />
          <InputBox
            placeholder="请再次输入新密码"
            icon={<img src={util.buildAssetsPath("assets/icons/ic_lock.svg")} />}
            type="password2"
            name="conformPassword"
            onChange={(value) => {
              this.setState({ conformPassword: value })
            }}
            value={this.state.conformPassword}
          />

          <div className="submit ">
            <Button
              className="text-[16px] rounded-[6px] h-[44px] flex items-center justify-center"
              onClick={() => {
                this.changePassword()
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
