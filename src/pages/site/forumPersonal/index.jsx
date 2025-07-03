import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"

import "./style.scss"
import AvatarImg from "@/components/AvatarImg"
import util from "@/magic/util"
import CustomIcon from "@/components/CustomIcon"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        agent: null,
        loading: false,
        amount: 0,
        user: util.cache.get("user"),
      }
    }

    componentDidMount() {
      this.loadData()
    }

    loadData() {
      let res = action.post("betpost/try")
      res.then((res) => {
        if (res.Data != null) {
          util.cache.set("default_forum_info", JSON.stringify(res.Data))
          this.setState({
            //被打赏金额DonateTo
            //打赏给金额DonateFrom
            amount: res.Data.DonateReceive,
          })
        }
      })
    }

    onItemClick(key) {
      const path = key === 0 ? "forumTicketList" : key === 1 ? "forumDonateList" : key === 2 ? "forumFollowList" : ""
      if (!path) return

      this.props.router.push(`/site/${path}`)
    }

    render() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login", { redirect: "/site/forum" })
        return null
      }

      let user = util.cache.get("user") || {}

      return (
        <LayoutPage loading={this.state.loading} className="forum_personal" center="个人中心" right={null}>
          <div className="top_area">
            {/*    relative*/}

            {/* <div className="avatar">
                    <Icon icon="ion-person" className="avatar_ic"/>
                </div> */}
            <AvatarImg avatarLink={user.Avatar.FilePath} UID={user.ID} width={75} height={75} />
            <div className="name_info">
              {user.NickName} [ ID:{user.ID} ]
            </div>
            {/* TODO 有接口后打开*/}
            <div className="donate_area">
              <span>打赏金额：</span>
              <span className="price">{this.state.amount} 元</span>
            </div>
          </div>

          <div className="level">
            <div className="item" onClick={this.onItemClick.bind(this, 0)}>
              <CustomIcon style={{ width: 38, height: 38 }} className="icon" type={require("./icons/tab1.svg")} />
              <div className="title">发帖记录</div>
            </div>
            <div className="item" onClick={this.onItemClick.bind(this, 1)}>
              <CustomIcon style={{ width: 38, height: 38 }} className="icon" type={require("./icons/tab2.svg")} />
              <div className="title">打赏明细</div>
            </div>
            <div className="item" onClick={this.onItemClick.bind(this, 2)}>
              <img style={{ width: 38, height: 38 }} className="icon" src={util.buildAssetsPath("assets/icons/follow.svg")} />
              <div className="title">我的关注</div>
            </div>
          </div>
        </LayoutPage>
      )
    }
  }
)
