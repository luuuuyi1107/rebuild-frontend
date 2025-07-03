import React from "react"

import "./style.scss"
import { Icon } from "react-onsenui"
import util from "@/magic/util"
import CustomIcon from "@/components/CustomIcon"
import AvatarImg from "../../../components/AvatarImg"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
    }

    /**
     * 前往帖子详情
     * @param tid
     */
    goPostDetails(tid, item_json) {
      this.props.onGetDetailPageEvent()

      this.props.router.push("/site/forumDetailsNew", {
        tid: tid,
        id: this.props.cur_game.id,
      })
    }

    render() {
      var item = this.props.item
      if (item == null) {
        return <div></div>
      }

      // var ticketDate = util.date.format(util.date.toDate(item.AddTime), "YYYY-MM-DD", 8);
      // var ticketTime = util.date.format(util.date.toDate(item.AddTime), "hh:mm", 8);
      // var isToday = util.date.format(new Date(), "YYYY-MM-DD", 8) === ticketDate;
      // var isCurrentIssue = util.compareIssue(this.props.cur_issue, item.GameID);
      var ticketDateTime = util.date.format(util.date.toDate(item.AddTime), "YYYY-MM-DD hh:mm", 8)
      var shortIssue = util.shortIssue(item.GameID)
      var isLikeByMe = item.Like == 1
      var isBestPost = item.Featured > 0

      return (
        <div className="forum-card_layer" onClick={this.goPostDetails.bind(this, item.ID, item)}>
          <div className="first_lv">
            <AvatarImg
              avatarLink={!!item.Avatar && item.Avatar.startsWith("http") ? item.Avatar : null}
              width={"60px"}
              height={"60px"}
              icSize={"24px"}
              shape={"round"}
            />

            <div className="name">{item.NickName}</div>
            <div className="post_time">{ticketDateTime}</div>

            <div className="win_rate">
              <Icon icon="ion-trophy" className="title_win_ic" />
              <div className="txt">胜率 {item.WinRate}%</div>
            </div>
            <div className="mark_area">
              {isBestPost && <CustomIcon style={{ width: 26, height: 26 }} className="mark_top_view" type={require("./icon/tag_best.svg")} />}
              {/*目前没有置顶功能*/}

              {/*<CustomIcon style={{width: 26, height: 26}} className="mark_best"*/}
              {/*            type={require("./icon/tag_pin.svg")}/>*/}
            </div>
          </div>
          <div className="bet_layer">
            <div className="left_area">
              <div className="issue_box">{shortIssue}</div>
              <div className="method">{item.PlayType}</div>
            </div>
            <div className="right_area">
              <div className="title_area">{item.Title}</div>
              <div className="desc">{item.Desc}</div>
            </div>
          </div>
          <div className="divider_h" />
          <div className="record_layer">
            <div className="like_amount">
              {isLikeByMe ? (
                <CustomIcon style={{ width: 12, height: 12 }} className="emoji-icon" type={require("./icon/ic_like_sel.svg")} />
              ) : (
                <CustomIcon style={{ width: 12, height: 12 }} className="emoji-icon" type={require("./icon/ic_like.svg")} />
              )}

              <div className="txt">{item.LikeCount}</div>
            </div>

            <div className="divider_v" />
            <div className="view_amount">
              <CustomIcon style={{ width: 12, height: 12 }} className="emoji-icon" type={require("./icon/ic_view.svg")} />
              <div className="txt">{item.WatchCount}</div>
            </div>

            <div className="divider_v" />
            <div className="follow_amount">
              <CustomIcon style={{ width: 12, height: 12 }} className="emoji-icon" type={require("./icon/ic_money.svg")} />
              <div className="txt">{item.FollowMoney}</div>
            </div>
          </div>
        </div>
      )
    }
  }
)
