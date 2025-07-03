import React from "react"

import "../ForumArticle/style.scss"
import util from "@/magic/util"
import BasicInfo from "@/components/UserBasicInfo"
import { withRouter } from "@/magic/withRouter"
// import { Icon } from 'react-onsenui';
// import AvatarImg from "@/components/AvatarImg";
// import ReactDOM from 'react-dom';
// import CustomIcon from "@/components/CustomIcon";

export default withRouter((props) => {
  const goPostDetails = (tid, item_json) => {
    props.onGetDetailPageEvent()
    props.router.push(`/site/forumDetailsNew?tid=${tid}&id=${props.cur_game.id}`)
  }

  if (props.item == null) return <div />
  const item = props.item
  const shortIssue = util.shortIssue(item.GameID)
  // const isLikeByMe = item.Like == 1;

  return (
    <div className="article point" onClick={goPostDetails.bind(null, item.ID, item)}>
      <BasicInfo
        image={!!item.Avatar && item.Avatar.startsWith("http") ? item.Avatar : null}
        userName={item.NickName}
        time={util.date.format(util.date.toDate(item.AddTime), "YYYY-MM-DD hh:mm", 8)}
        winRate={item.WinRate}
        featured={item.Featured}
      />

      <div className="content-info">
        <div className="point-sign">
          <div className="activity">{shortIssue}</div>
          <div className="method">{item.PlayType}</div>
        </div>
        <div className="inner">
          <div className="title left">{item.Title}</div>
          <div className="desc">{item.Desc}</div>
        </div>
      </div>

      <div className="count-info">
        <div className="like_amount">
          <img style={{ width: 12, height: 12 }} className="emoji-icon" src={util.buildAssetsPath("assets/icons/ic_like.svg")} />
          {item.LikeCount}
        </div>

        <div className="view_amount">
          <img style={{ width: 12, height: 12 }} className="emoji-icon" src={util.buildAssetsPath("assets/icons/ic_view.svg")} />
          {item.WatchCount}
        </div>

        <div className="follow_amount">
          <img style={{ width: 12, height: 12 }} className="emoji-icon" src={util.buildAssetsPath("assets/icons/ic_money.svg")} />
          {item.FollowMoney}
        </div>
      </div>
    </div>
  )
})
