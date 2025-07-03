// import LayoutPage from '@/components/LayoutPage';
import React from "react"
import * as action from "@/action"

import "./style.scss"
import { Icon } from "react-onsenui"
import util from "@/magic/util"
import EmptyView from "@/components/EmptyView"
import { getMyFollow, addFollowById, removeFollowById } from "@/action/apis"
// import ClipboardJS from "clipboard";
import CustomIcon from "@/components/CustomIcon"
import AvatarImg from "@/components/AvatarImg"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        myfollows: [],
        isFollowing: false,
      }
    }
    isPc = !/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)
    componentDidMount() {
      this.setMyFollows()
    }

    setMyFollows() {
      getMyFollow().then((res) => {
        if (res.Code !== 1) return
        this.setState({ myfollows: res.Data, isFollowing: false })
      })
    }

    getBetPage() {
      const id = util.getUrlParam("id")
      const game = util.findGames(id)
      this.props.router.push("/lottery/home", { id, lotteryType: game.type })
    }

    goAction(action, allowDonate) {
      if (!util.isLoginOrNoti(this.props)) return
      switch (action) {
        case 1:
          //判定是否有-被打赏资格，去里面判定
          this.props.router.push("/site/forumDonateList")
          break
        case 2:
          this.props.updateModalState("FOLLOW", true, false)
          break
        case 3:
          if (!allowDonate) {
            notificationAsync.alert("版主权限不足，还无法接收打赏")
            return
          }
          this.props.updateModalState("DONATE", true, false)
          break
        case 4:
          if (!allowDonate) {
            notificationAsync.alert("版主权限不足，还无法接收打赏")
            return
          }
          this.props.updateModalState("DONATE", true, false)
          break
        case 5:
          //自己点选打赏的情
          notificationAsync.alert("不能打赏给自己")
          break
      }
    }

    onHistoryItemClick(tid) {
      //目前不要可以跳转
      return
    }

    onLikePress(likeOrDis) {
      this.setState({
        loading: true,
      })
      var tid = util.getUrlParam("tid")
      let d = action.post("betpost/like", {
        id: tid,
        like: likeOrDis ? 1 : -1,
      })
      d.then((res) => {
        this.setState({
          loading: false,
        })
        if (res.Code !== 1) {
          notificationAsync.alert(res.Message)
        } else {
          this.props.reloadDetails()
          // if (this.isPc) {
          //     const _data = JSON.parse(util.cache.get('forum_home'));
          //     _data.list.forEach(item => {
          //         console.log(item);
          //     })
          //     // util.cache.set('forum_home', JSON.stringify(_data));
          // }
        }
      })
    }

    goHistoryList(postDetails, myOwn) {
      if (!util.isLogin()) {
        this.props.router.push("/site/login", { redirect: this.props.route.pathname + this.props.route.search })
        return
      }

      if (myOwn) {
        this.props.router.push("/site/forumTicketList")
      } else {
        this.props.router.push("/site/forumTicketList", {
          tid: postDetails.ID,
          uid: postDetails.UID,
        })
      }
    }

    renderBetContent(str) {
      const items = str.replace(/\|/g, "").split(",")
      return items.reduce((result, item, idx) => {
        result.push(<span key={item + "_" + idx}>{item + (idx === items.length - 1 ? "" : ",")}</span>)
        // if ((idx + 1) % 8 === 0) result.push(<br />)
        return result
      }, [])
    }

    checkBetContentHasChinese(str) {
      return /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(str)
    }

    followEvent(detail, isFollowed) {
      if (!util.isLoginOrNoti(this.props)) return
      if (!detail || !detail.UID || this.state.isFollowing) return
      this.setState({ isFollowing: true })
      // getMyFollow, addFollowById

      const followApi = isFollowed ? removeFollowById : addFollowById
      util.cache.removeStartsWith("betpost/MyFollow", "session")
      followApi(detail.UID).then((res) => {
        if (res.Code !== 1) return
        notificationAsync.alert(res.Message).then((res) => {
          this.setMyFollows()
        })
      })
    }

    render() {
      var emptyDetails = this.props.ticket_details == null
      if (emptyDetails) {
        return <div />
      }

      let user = util.cache.get("user") || {}
      var ticket = this.props.ticket_details

      var postDetails = this.props.ticket_details.PostDetail

      var totalCount = ticket.WinCount + ticket.LoseCount
      var winRate = Math.floor((ticket.WinCount / totalCount) * 100)

      var Like = ticket.IsLike === 1
      var DisLike = ticket.IsLike === -1

      var TicketState = postDetails.BetStatus
      var isCurIssue = util.compareIssue(this.props.cur_issue, postDetails.GameID)
      var shortIssue = util.shortIssue(postDetails.GameID)

      // var donateStateBtn = null;
      var cannotDonate = ticket.IsDonate === -1
      var isDonate = ticket.IsDonate > 0
      //TODO 这边 增加一个 不能打赏的原因
      var myOwn = user.ID === postDetails.UID

      //输赢的结果，状态已中奖，然后 中奖金额》买彩金额
      var isWin = postDetails.BetStatus === 1 && postDetails.Bonus > postDetails.BetCount
      var isTie = postDetails.BetStatus === 1 && postDetails.Bonus == postDetails.BetCount
      var profitPrice = postDetails.Bonus - postDetails.BetCount

      //精华帖
      var isBestPost = ticket.Featured > 0
      // if (myOwn) {
      //     //自己的注单，只显示打赏明细
      //     donateStateBtn = (
      //         <div className="ticket_action_btn getlist"
      //              onClick={this.goAction.bind(this, 1, false)}>
      //             <CustomIcon style={{width: 24, height: 24}}
      //                         type={require("../icons/action_state_donate.svg")}/>
      //             <div>打赏明细</div>
      //         </div>)
      // } else {

      // 一键跟投-常驻！
      const donateStateBtn = (
        <div className="ticket_action_btn follow" onClick={this.goAction.bind(this, 2, true)}>
          <CustomIcon style={{ width: 24, height: 24 }} type={require("../icons/action_state_follow.svg")} />
          <div>一键跟投</div>
        </div>
      )

      // const returnBetPage = (
      //     <div className="ticket_action_btn return"
      //          onClick={this.getBetPage.bind(this)}>
      //         <CustomIcon style={{width: 16, height: 16, transform: 'rotate(90deg)'}} type={require("../icons/caret-down.svg")} />
      //         <div>返回投注</div>
      //     </div>)
      // }

      const isFollowed = this.state.myfollows.some((follow) => follow.FollowID === postDetails.UID)

      return (
        <div>
          {/* 彩种+奖期+胜率- 面板 */}

          <div className="top_bar">
            {/*<div className="game-icon FFC5-icon"/>*/}
            <div className="left">
              <AvatarImg
                avatarLink={!!ticket.PostDetail.Avatar && ticket.PostDetail.Avatar.startsWith("http") ? ticket.PostDetail.Avatar : null}
                width={"48px"}
                height={"48px"}
                icSize={"36px"}
                shape={"round"}
              />
            </div>

            <div className="center">
              <div className="lotto_title" onClick={this.goHistoryList.bind(this, postDetails, myOwn)}>
                {postDetails.NickName}

                <div className="history_list">历史帖子</div>
              </div>
              {/*<div className="lotto_issue">第 {postDetails.GameID}期</div>*/}

              <div className="lotto_lower">
                <Icon icon="ion-trophy" className="trophy_win_ic" />
                <div className="top">胜率 {isNaN(winRate) ? 0 : util.numberRoundedFix(winRate, 2)}%</div>
                <div className="bottom">
                  最新 {ticket.WinCount}胜 {ticket.LoseCount}负
                </div>
              </div>
            </div>
            {/*自己不能打赏自己*/}
            <div className="right">
              <img
                onClick={this.goAction.bind(this, myOwn ? 5 : 3, true)}
                src={util.buildAssetsPath("images/forumDetailsNew/donate_him.png")}
                className="donate_btn"
                alt=""
              />

              <div className={`follow${isFollowed ? " subscribed" : ""}`} onClick={this.followEvent.bind(this, postDetails, isFollowed)}>
                {isFollowed ? "已" : ""}关注
              </div>
            </div>
          </div>

          <div className="block_lv " />
          {/* 玩法 + 标题 面板 */}
          <div className="second_bar">
            <div className="lotto_method">
              <div className="issue">{shortIssue}</div>
              <div className="play-type">{postDetails.PlayType}</div>
            </div>
            <div className="divider_vertical" />
            <div className="ticket_desc"> {postDetails.Title}</div>

            {isBestPost && <CustomIcon style={{ width: 33, height: 33 }} className="mark_top_view" type={require("../icons/tag_best.svg")} />}
          </div>
          <div className="divider_horizon" />

          <div className="title_bar_row">
            <div className="title_bg">
              <CustomIcon style={{ height: 12, width: 12 }} type={require("../icons/star.svg")} />
              <div className="recommend_title">本期推荐</div>
            </div>

            {
              <div className={`bet_result ${TicketState === 0 ? "waiting" : isTie ? "tie" : isWin ? "win" : "lose"}`}>
                {TicketState === 0 ? "-" : isTie ? "和" : isWin ? "胜" : "负"}
              </div>
            }
          </div>

          {/* 当期推荐面板 */}
          <div className="recommend_area">
            {/*黄色box*/}
            <div className="recommend_box">
              {/*这边用 relative */}
              <div className="bet_content">
                <div className={`bet-content-list ${this.checkBetContentHasChinese(postDetails.BetText) ? "text" : "number"}`}>
                  {this.renderBetContent(postDetails.BetText)}
                </div>
              </div>
              <div className="bonus">
                {/* { TicketState == 0 && <span className="waiting">待开奖</span> } */}
                {TicketState == 1 ? (
                  <span className="hit">{util.numberRoundedFix(profitPrice, 2)}元</span>
                ) : (
                  <span className="amount">{util.numberRoundedFix(postDetails.BetCount, 2)}元</span>
                )}
                {/* 这边已中奖的金额 = Bonus-BetCount ->盈利金额*/}
              </div>
            </div>
          </div>
          <div className="random_comment_box">
            <CustomIcon style={{ width: 12, height: 12 }} className="emoji-icon" type={require("../icons/msg.svg")} />
            <div className="recommend_title">本期预言</div>
          </div>
          <div className="random_comment_box-desc">{postDetails.Desc}</div>
          {/* 按赞 面板 */}
          <div className="reaction_box">
            <div className="button_liked" onClick={this.onLikePress.bind(this, true)}>
              <CustomIcon
                style={{ width: 19, height: 19 }}
                type={Like ? require("../icons/btn_liked.svg") : require("../icons/btn_liked_none.svg")}
              />
              <div>{postDetails.LikeCount}</div>
            </div>
            <div className="divider_vertical" />
            <div className="button_disliked" onClick={this.onLikePress.bind(this, false)}>
              <CustomIcon
                style={{ width: 19, height: 19 }}
                type={DisLike ? require("../icons/btn_disliked.svg") : require("../icons/btn_disliked_none.svg")}
              />
              <div>{postDetails.DisLikeCount}</div>
            </div>
          </div>

          <div className="block_lv " />
          {/* 跟单 跟投 面板*/}
          <div className="follow_panel">
            <div className="bet_follow_person">
              <div className="title">跟投人数</div>
              <div className="value">{postDetails.FollowCount}</div>
            </div>
            <div className="bet_follow_amount">
              <div className="title">跟投金额</div>
              <div className="value">{postDetails.FollowMoney}</div>
            </div>
            {donateStateBtn}
            {/* { returnBetPage } */}
          </div>
          <div className="block_lv " />

          {/* 历史推荐 */}
          <div className="history_record">
            <div className="title">历史推荐</div>

            {this.props.history.length <= 0 && <EmptyView imgId={1} desc={"暂无数据"} />}

            {/* 历史投注注单 */}
            {this.props.history.length > 0 && (
              <div>
                {this.props.history.map((item, key) => {
                  var tState = item.BetStatus
                  var isOpenDraw = tState || tState === 1
                  //输赢的结果，状态已中奖，然后 中奖金额》买彩金额
                  var isWin = tState === 1 && item.Bonus > item.BetCount
                  var isTie = tState === 1 && item.Bonus == item.BetCount
                  return (
                    <div className="row" key={item.ID + "_" + key} onClick={this.onHistoryItemClick.bind(this, item.ID)}>
                      <span className="issue">{item.GameID.slice(4)} 期</span>
                      {/*<span*/}
                      {/*    className={`draw_bet ${!isOpenDraw ? "not_yet" : isWin ? "win" : "lose"}`}>{!isOpenDraw ? '【-】' : `【${item.OpenCode}】`}</span>*/}
                      <span className="draw_open_details">[{item.BetText}]</span>

                      <div className={`result ${!isOpenDraw ? "not_yet" : isTie ? "tie" : isWin ? "win" : "lose"}`}>
                        {!isOpenDraw ? "-" : isTie ? "和" : isWin ? "胜" : "负"}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )
    }
  }
)
