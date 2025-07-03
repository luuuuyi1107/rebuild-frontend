import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import { getBetPostList } from "@/action/apis"

import "@/pages/site/forum/style.scss"
import "./style.scss"
import util from "@/magic/util"

import EmptyView from "@/components/EmptyView"
import forumGames from "@/config/forum"
// import ForumListItems from "../forumListContent";
import ForumListItems from "@/components/ForumPoint"
import AvatarImg from "@/components/AvatarImg"
import DonateOwnerModal from "../forumDetailsNew/donateOwnerModal"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      const supportList = Object.values(forumGames).filter((item, key) => forumGames["specific"].some((id) => item.id == id))
      this.state = {
        supportList,
        loading: true,
        list: [],
        cur_issue: "---",
        cur_game: supportList[0],
        cur_tab: 0,
        cur_page: 1,
        showDonateOwnerModal: false,
        ticket_details: null,
        allowDonate: true,
        user: util.cache.get("user"),
        isEnd: false,
      }
    }
    pageSize = 6
    isPc = !/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)
    componentDidMount() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login", { redirect: "/site/forum" })
        return
      }

      this.scrollContent = document.getElementById("scrollContent")
      this.scrollContent.onscroll = () => {
        if (this.scrollContent.scrollTop + this.scrollContent.clientHeight >= this.scrollContent.scrollHeight - 50) {
          if (!this.state.isEnd && !this.state.loading) {
            this.setState({ cur_page: this.state.cur_page + 1, loading: true })
            this.loadData()
          }
        }
      }
      this.handlePageShow()

      if (this.isPc) {
        //pc的话要存缓存
        // util.cache.set('forum_home', JSON.stringify({ list: this.state.list, cur_tab: this.state.cur_tab, cur_game: this.state.cur_game, scrollTop: this.scrollContent.scrollTop }));
        const forumCacheStr = util.cache.get("forum_ticket")
        if (!!forumCacheStr) {
          const _data = JSON.parse(forumCacheStr)
          this.setState(
            {
              list: _data.list,
              cur_tab: _data.cur_tab,
              cur_game: _data.cur_game,
              cur_page: _data.cur_page,
              isEnd: _data.isEnd,
              loading: false,
            },
            () => {
              this.setScrollPositionAsBefore(_data.scrollTop)
            }
          )
          util.cache.remove("forum_ticket")
          return
        }
      }

      const tid = util.getUrlParam("tid")

      if (!!tid) this.loadDetails(tid)

      this.loadData().then(() => {
        if (!tid && this.state.list.length > 0) {
          this.loadDetails(this.state.list[0].ID)
        }
      })
    }

    setScrollPositionAsBefore(scrollTop, time) {
      setTimeout(() => {
        this.scrollContent.scrollTop = scrollTop
        if (this.scrollContent.scrollTop === 0 && this.scrollLimit > 0) {
          this.scrollLimit -= 1
          this.setScrollPositionAsBefore(scrollTop, 5)
        } else {
          this.scrollLimit = 3
        }
      }, time || 0)
    }

    handlePageShow() {
      const prevData = util.cache.get("forum_prevData")
      if (!!prevData) {
        // 表示是从上页返回来的
        const list = this.state.list.slice()
        let shouldChange = false
        list.some((item) => {
          const isExist = item.ID === prevData.ID
          if (isExist && item.LikeCount !== prevData.LikeCount) {
            item.LikeCount = prevData.LikeCount
            shouldChange = true
          }

          if (isExist) {
            item.WinRate = prevData.WinRate
            Object.keys(prevData).forEach((key) => {
              if (item.hasOwnProperty(key) && item[key] != prevData[key]) {
                shouldChange = true
                item[key] = prevData[key]
              }
            })
          }
          return isExist // 用来跳脱廻圈
        })
        if (shouldChange) {
          this.setState({ list: [] })
          this.setState({ list })
        }
        util.cache.remove("forum_prevData")
      }
      // if (this.state.list.length > 0) this.onTabFilterClick(0);
    }

    loadData(changeType) {
      return new Promise((resolve) => {
        const uid = util.getUrlParam("uid")
        const map = {
          lotteryID: this.state.cur_game.id,
          cur_page: this.state.cur_page,
          page_size: this.pageSize,
          ...(uid != null ? { uid } : { owner: 1 }),
        }
        getBetPostList(map)
          .then((res) => {
            if (res.Code != 1) {
              notificationAsync.alert(res.Message)
              return
            }

            if (res.Data.length === 0 || res.Data.length < this.pageSize) {
              this.setState({ loading: false, isEnd: true })
              if (res.Data.length === 0) return
            }

            const list = changeType ? res.Data : [...this.state.list, ...res.Data]

            if (changeType) this.setState({ list: [] })
            this.setState({ list, loading: false })
          })
          .finally(resolve)
      })
    }

    loadDetails(tid) {
      if (tid != null) {
        action.post("betpost/detail", { id: tid }).then((res) => {
          if (res.Code != 1) {
            this.setState({
              loading: false,
            })
            apiNotification.alert(res, {}, this.props)
            return
          }

          var withoutMe = res.Data.History.filter((e) => {
            return e.ID != tid
          })

          this.setState({
            ticket_details: res.Data,
            allowDonate: res.Data.AllowDonate,
          })
        })
      }
    }

    goPostDetails(tid) {
      this.props.router.push("/site/forumDetailsNew", { tid: tid, id: this.state.cur_game.id })
    }

    onGameClick(cur_tab) {
      if (this.state.loading || this.state.cur_tab === cur_tab) return
      this.setState({
        cur_tab,
        cur_game: this.state.supportList[cur_tab],
        cur_page: 1,
        isEnd: false,
        loading: true,
      })
      setTimeout(() => {
        this.setState({ list: [] })
        this.loadData(true)
      }, 200)
    }

    updateModalState(modal, onOff, reload) {
      switch (modal) {
        case "DONATE":
          if (onOff) {
            if (!this.state.allowDonate) {
              notificationAsync.alert("版主权限不足，还无法接收打赏")
              return
            }
          }
          //TODO 增加被打赏的额度-限制，后端增加限制
          this.setState({
            showDonateOwnerModal: onOff,
          })
          if (reload) {
            this.loadData()
          }
          break
      }
    }

    getDetailPageEvent() {
      if (this.isPc) {
        //pc的话要存缓存
        util.cache.set(
          "forum_ticket",
          JSON.stringify({
            list: this.state.list,
            cur_tab: this.state.cur_tab,
            cur_game: this.state.cur_game,
            scrollTop: this.scrollContent.scrollTop,
            isEnd: this.state.isEnd,
            cur_page: this.state.cur_page,
          })
        )
      }
    }

    render() {
      var uid = util.getUrlParam("uid")
      return (
        <LayoutPage className="forum_center forum_ticket_record_list" center="发帖记录" right={null}>
          {!!uid && this.state.ticket_details && (
            <div className="user_area">
              {/* <AvatarImg UID={uid} avatarLink={tavatarLink={this.state.ticket_details.PostDetail.Avatar.startsWith('http') ? this.state.ticket_details.PostDetail.Avatar : null} } width={"48px"} height={"48px"} icSize={"36px"} shape={"round"}/> */}
              <AvatarImg
                avatarLink={
                  !!this.state.ticket_details.PostDetail.Avatar && this.state.ticket_details.PostDetail.Avatar.startsWith("http")
                    ? this.state.ticket_details.PostDetail.Avatar
                    : null
                }
                UID={uid}
                width={"48px"}
                height={"48px"}
                icSize={"36px"}
                shape={"round"}
              />
              <div className="name">
                {this.state.ticket_details.PostDetail.NickName}[ID: {uid}]
              </div>
              <div className="block" />
              <img
                src={util.buildAssetsPath("images/forumTicketList/donate_him.png")}
                className="donate_btn"
                alt=""
                onClick={() => {
                  this.updateModalState("DONATE", true, false)
                }}
              />
            </div>
          )}
          <div className="block_horizon" />
          <div className="list_filter">
            {this.state.supportList.map((game, idx) => (
              <div key={game.name} className={`tab_main ${this.state.cur_tab === idx ? "sel" : ""}`} onClick={this.onGameClick.bind(this, idx)}>
                {game.name}
              </div>
            ))}
          </div>
          {this.state.list.length <= 0 && <EmptyView imgId={2} desc={"暂无帖子"} />}
          <div className="content" id="scrollContent">
            {/* 数据列表 - 第一组*/}
            {this.state.list.map((item, key) => (
              <ForumListItems
                key={key}
                item={item}
                cur_issue={this.state.cur_issue}
                cur_game={this.state.cur_game}
                onGetDetailPageEvent={this.getDetailPageEvent.bind(this)}
              />
            ))}
            {this.state.isEnd && this.state.list.length > 0 && <div className="end py-[15px] text-center">到底了</div>}
          </div>
          {this.state.showDonateOwnerModal && this.state.ticket_details != null && (
            <ModalPage
              isOpen={this.state.showDonateOwnerModal}
              className="donate_owner_modal"
              animation="fade"
              onClose={() => {
                this.setState({
                  showDonateOwnerModal: false,
                })
              }}
            >
              {/*/!* 弹框 - 打赏版主 的 弹框*!/*/}
              <DonateOwnerModal
                ticket_details={this.state.ticket_details}
                updateModalState={this.updateModalState.bind(this)}
                // onClose={this.onModalClose.bind(this, 2)}
              />
            </ModalPage>
          )}
        </LayoutPage>
      )
    }
  }
)
