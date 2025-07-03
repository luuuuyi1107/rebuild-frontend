import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import * as action from "@/action"
import "../friendMessage/style.scss"
import { ListItem } from "react-onsenui"
import AvatarImg from "@/components/AvatarImg"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"
import * as apiNotification from "@/magic/ApiNotification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        data: props.data || null,
        loading: true,
        apiLoading: false,
      }
    }
    componentDidMount() {
      if (!this.props.data && this.props.userId) {
        action.get("User/GetUserData", { id: this.props.userId }).then((res) => {
          if (res.Code != 1) {
            apiNotification.alert(res, {}, this.props)
          } else {
            this.setState({ data: res.Data, loading: false })
          }
        })
      } else {
        this.setState({ loading: false })
      }
    }
    async addFriend() {
      let data = this.state.data
      this.setState({ apiLoading: true })
      alert(3344)
      let res = await action.post("User/AddFriend", { uid: data.ID, note: "" })
      this.setState({ apiLoading: false })
      if (res.Code != 1) {
        notificationAsync.alert(res.Message, { title: "操作提示", class: "broadcast" }, this.props)
      } else {
        notificationAsync.alert(res.Message, { title: "已发送请求", class: "broadcast" })
      }
    }

    async betRecord(item, userID) {
      let data = this.state.data
      if (data.BetXian == 3) {
        notificationAsync.alert("对方设置仅自己可见!", { title: "操作提示", class: "broadcast" })
        return
      } else if (data.BetXian == 1 && !data.IsFriend) {
        notificationAsync.alert("对方设置仅好友可见!", { title: "操作提示", class: "broadcast" })
        return
      }
      switch (item.LotteryID) {
        case 11:
          this.props.router.isLoginToOrRedirect(`/interaction/baccaratBetRecord`, { userID })
          break
        default:
          this.props.router.isLoginToOrRedirect(`/lottery/betRecord`, { id: item.LotteryID, userID })
          break
      }
    }

    render() {
      let data = this.state.data || {}
      let user = util.cache.get("user")
      let rowIndex = 0
      return (
        <LayoutPage center="玩家资料" right={null} className="friend-page" loading={this.state.loading} apiLoading={this.state.apiLoading}>
          <ListItem className="user-info friend-record-item">
            <div className="left">
              {Object.keys(data).length != 0 && <AvatarImg UID={data.ID} avatarLink={data.Avatar} width={"0.8rem"} height={"0.8rem"} />}
            </div>
            <div className="center">
              <div>
                <p className="tl">{data.NickName}</p>
                <p className="dd">ID: {data.ID}</p>
              </div>
            </div>
            <div className="right">
              {data.ID != user.ID &&
                (data.IsFriend ? (
                  <span
                    className="btn"
                    onClick={() => {
                      this.props.router.isLoginToOrRedirect(`/interaction/friendChat`, { id: data.ID, name: data.NickName })
                    }}
                  >
                    发送消息
                  </span>
                ) : (
                  <span className="btn" onClick={this.addFriend.bind(this, data)}>
                    添加好友
                  </span>
                ))}
            </div>
          </ListItem>
          {data.BetCount && (
            <div className="box last-bet">
              <div className="hd">近期战报</div>
              <div className="bd">
                <table cellSpacing="0">
                  <thead>
                    <tr>
                      <th>游戏名称</th>
                      <th>投注数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.BetCount &&
                      data.BetCount.map((item, index) => {
                        if (
                          item.Num > 0 &&
                          item.LotteryID != 43 &&
                          item.LotteryID != 45 &&
                          item.LotteryID != 46 &&
                          item.LotteryID != 47 &&
                          item.LotteryID != 48 &&
                          item.LotteryID != 53
                        ) {
                          rowIndex++
                          return (
                            <tr
                              key={item.Name}
                              className={rowIndex % 2 == 1 ? "odd" : "even"}
                              onClick={() => {
                                this.betRecord(item, data.ID)
                              }}
                            >
                              <td>{item.Name}</td>
                              <td>{item.Num}</td>
                            </tr>
                          )
                        }
                      })}
                    {rowIndex == 0 && (
                      <tr className={rowIndex % 2 == 1 ? "odd" : "even"}>
                        <td colSpan="2">暂无投注</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </LayoutPage>
      )
    }
  }
)
