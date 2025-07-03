import React from "react"

import LayoutPage from "@/components/LayoutPage"
import InputBox from "@/components/InputBox"
import * as action from "@/action"

import "./style.scss"
import { Button } from "react-onsenui"
import AvatarImg from "@/components/AvatarImg"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        nickName: null,
        apiLoading: false,
        loading: true,
        userSet: {},
        user: util.cache.get("user"),
      }
    }
    componentDidMount() {
      this.loadData()
    }

    async loadData() {
      let res = await getPush({ keys: "userset" })

      if (res.Code == 1 && res.Data.UserSet) {
        this.setState({ userSet: res.Data.UserSet })
      } else {
        apiNotification.alert(res, {}, this.props)
      }
      this.setState({ loading: false, nickName: res.Data.UserData.NickName })
    }

    changeNick() {
      let userSet = this.state.userSet
      if (!this.state.nickName) {
        notificationAsync.alert("昵称不能为空")
        return
      }
      if (userSet.MaxNickName || userSet.MinNickName) {
        if (this.state.nickName.length > userSet.MaxNickName || this.state.nickName.length < userSet.MinNickName) {
          notificationAsync.alert(`昵称最少${userSet.MinNickName}, 最长${userSet.MaxNickName}`, { title: "长度错误" })
          return
        }
      }

      this.setState({ apiLoading: true })
      action.post("User/CheckNickName", { nickname: this.state.nickName }, (res) => {
        if (res.Data) {
          action.post(
            "User/ModifyNickName",
            {
              nickname: this.state.nickName,
            },
            (res) => {
              this.setState({ apiLoading: false })
              if (res.Code == 1) {
                notificationAsync.alert(res.Message, { title: "成功" }).then(() => {
                  this.props.router.replace("/site/securityCenter")
                })
              } else {
                notificationAsync.alert(res.Message, { title: "操作提示", notificationAsync })
              }
            }
          )
        } else {
          this.setState({ apiLoading: false })
          notificationAsync.alert("昵称已被使用")
        }
      })
    }

    render() {
      let userSet = this.state.userSet || {}
      return (
        <LayoutPage className="site-nike-name" center="修改昵称" right={null} loading={this.state.loading} apiLoading={this.state.apiLoading}>
          <div className="content">
            {this.state.user && <AvatarImg avatarLink={this.state.user.Avatar.FilePath} width={30} height={30} shape="round" />}
            <InputBox
              placeholder="请输入昵称"
              type="text"
              name="phone"
              onChange={(value) => {
                this.setState({ nickName: value })
              }}
              value={this.state.nickName}
            />
            <div className="submit">
              {userSet.EditNickName && (
                <Button
                  className="text-[16px] rounded-[6px] h-[44px] flex items-center justify-center"
                  onClick={() => {
                    this.changeNick()
                  }}
                >
                  确认
                </Button>
              )}
              {userSet.EditNickName == false && <Button disabled={true}>昵称不可修改</Button>}
            </div>
          </div>
        </LayoutPage>
      )
    }
  }
)
