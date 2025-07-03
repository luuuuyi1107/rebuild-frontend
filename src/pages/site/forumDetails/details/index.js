import React from "react"
import * as action from "@/action"

import "./style.scss"
import { Icon } from "react-onsenui"
import util from "@/magic/util"
import EmptyView from "@/components/EmptyView"
import GameIcon from "@/components/GameIcon"
import CustomIcon from "@/components/CustomIcon"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
    }

    goAction(action, allowDonate) {
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
        }
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

      var donateStateBtn = null
      var cannotDonate = ticket.IsDonate === -1
      var isDonate = ticket.IsDonate > 0
      //TODO 这边 增加一个 不能打赏的原因
      var myOwn = user.ID === postDetails.UID

      //输赢的结果，状态已中奖，然后 中奖金额》买彩金额
      var isWin = postDetails.BetStatus === 1 && postDetails.Bonus > postDetails.BetCount
      var isTie = postDetails.BetStatus === 1 && postDetails.Bonus == postDetails.BetCount
      var profitPrice = postDetails.Bonus - postDetails.BetCount
      var allowDonate = ticket.AllowDonate

      if (myOwn) {
        //自己的注单，只显示打赏明细
        donateStateBtn = (
          <div className="ticket_action_btn getlist" onClick={this.goAction.bind(this, 1)}>
            <CustomIcon style={{ width: 24, height: 24 }} type={require("../icons/action_state_donate.svg")} />
            <div>打赏明细</div>
          </div>
        )
      } else {
        switch (TicketState) {
          case 0:
            if (isCurIssue) {
              //待开奖
              donateStateBtn = (
                <div className="ticket_action_btn follow" onClick={this.goAction.bind(this, 2, true)}>
                  <CustomIcon style={{ width: 24, height: 24 }} type={require("../icons/action_state_follow.svg")} />
                  <div>一键跟投</div>
                </div>
              )
            } else {
              donateStateBtn = (
                <div
                  className={`ticket_action_btn ${isDonate || cannotDonate ? "disable" : ""}`}
                  onClick={isDonate || cannotDonate ? null : this.goAction.bind(this, 3, allowDonate)}
                >
                  <CustomIcon style={{ width: 24, height: 24 }} type={require("../icons/action_state_donate.svg")} />
                  <div>打赏版主</div>
                </div>
              )
            }
            break
          case 1:
            donateStateBtn = (
              <div
                className={`ticket_action_btn ${isDonate || cannotDonate ? "disable" : ""}`}
                onClick={isDonate || cannotDonate ? null : this.goAction.bind(this, 3, allowDonate)}
              >
                <CustomIcon style={{ width: 24, height: 24 }} type={require("../icons/action_state_donate.svg")} />
                <div>打赏版主</div>
              </div>
            )
            //中奖
            break
          case 2:
            donateStateBtn = (
              <div
                className={`ticket_action_btn ${isDonate || cannotDonate ? "disable" : ""}`}
                onClick={isDonate || cannotDonate ? null : this.goAction.bind(this, 4, allowDonate)}
              >
                <CustomIcon style={{ width: 24, height: 24 }} type={require("../icons/action_state_donate.svg")} />
                <div>打赏版主</div>
              </div>
            )
            //没中奖
            break
        }
      }

      return (
        <div>
          {/* 彩种+将其+胜率- 面板 */}
          <div className="top_bar">
            {/*<div className="game-icon FFC5-icon"/>*/}
            <div className="left">
              {/* 这边置换 ID */}
              <GameIcon id={this.props.cur_game.logo} />
            </div>

            <div className="center">
              <div className="lotto_title">{this.props.cur_game.name}</div>
              <div className="lotto_issue">第 {postDetails.GameID}期</div>
            </div>
            <div className="right">
              <Icon icon="ion-trophy" className="trophy_win_ic" />
              <div className="win_rate">
                <div className="top">胜率 {isNaN(winRate) ? 0 : winRate}%</div>
                <div className="bottom">
                  最新 {ticket.WinCount}胜 {ticket.LoseCount}负
                </div>
              </div>
            </div>
          </div>

          <div className="block_lv " />
          {/* 玩法 + 标题 面板 */}
          <div className="second_bar">
            <div className="lotto_method"> {postDetails.PlayType}</div>
            <div className="divider_vertical" />
            <div className="ticket_desc"> {postDetails.Title}</div>
          </div>
          <div className="divider_horizon" />

          <div className="title_bar_row">
            <div className="title_bg">
              <Icon className="recommend_box_ic" icon="ion-star" />
              <span className="recommend_title">本期推荐</span>
            </div>

            {TicketState !== 0 && <div className={`bet_result ${isTie ? "tie" : isWin ? "win" : "lose"}`}>{isTie ? "和" : isWin ? "胜" : "负"}</div>}
          </div>

          {/* 当期推荐面板 */}
          <div className="recommend_area">
            {/*黄色box*/}
            <div className="recommend_box">
              {/*这边用 relative */}
              <div className={`bet_content ${isTie || isWin ? "win" : ""}`}>
                {
                  // .replace(/,/g, " ")
                  postDetails.BetText
                }
              </div>
              <div className="bonus">
                {TicketState == 0 && <span className="waiting">待开奖</span>}
                {/* {
                            TicketState == 2 && <span className="unhit">未中奖</span>
                        } */}
                {/* 这边已中奖的金额 = Bonus-BetCount ->盈利金额*/}
                {TicketState == 1 && <span className="hit">{profitPrice}元</span>}

                {/* {
                            TicketState == 3 && <span className="unhit">打和退款</span>
                        }
                        {
                            TicketState == 4 && <span className="unhit">已撤销</span>
                        } */}
                {TicketState != 1 && <span className="amount">{postDetails.BetCount}元</span>}
              </div>
            </div>

            <div className="random_comment_box">
              <CustomIcon style={{ width: 17, height: 17 }} className="emoji-icon" type={require("../icons/msg.svg")} />
              <div className="text">{postDetails.Desc}</div>
            </div>
          </div>

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
                    <div className="row" key={key} onClick={this.onHistoryItemClick.bind(this, item.ID)}>
                      <span className="issue">第 {item.GameID}期</span>
                      {/*<span*/}
                      {/*    className={`draw_bet ${!isOpenDraw ? "not_yet" : isWin ? "win" : "lose"}`}>{!isOpenDraw ? '【-】' : `【${item.OpenCode}】`}</span>*/}
                      <span className="draw_open_details">{item.BetText}</span>

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
