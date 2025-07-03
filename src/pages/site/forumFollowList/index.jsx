import React, { useEffect, useState } from "react"

import LayoutPage from "@/components/LayoutPage"

import util from "@/magic/util"
import { getMyFollow, addFollowById, removeFollowById } from "@/action/apis"
import AvatarImg from "@/components/AvatarImg"
import { Icon } from "react-onsenui"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter((props) => {
  const [follows, setFollows] = useState([])
  const [followIds, setFollowIds] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    getMyFollow().then((res) => {
      if (res.Code !== 1) return
      setFollows(res.Data)
      setFollowIds(res.Data.map((item) => item.FollowID))
    })

    // getMyFansList().then(FansRes => {
    //   console.log({ FansRes })
    // })
  }, [])

  const getUserForumHistory = (item) => {
    props.router.push("/site/forumTicketList", {
      // tid: item.UID,
      // tid: item.FollowID,
      uid: item.FollowID,
    })
  }

  function toggleFollow(id) {
    // addFollowById, removeFollowById
    if (isFollowing) return
    setIsFollowing(true)
    const followApi = followIds.includes(id) ? removeFollowById : addFollowById
    followApi(id).then((res) => {
      if (res.Code !== 1) return
      notificationAsync.alert(res.Message)
      util.cache.removeStartsWith("betpost/MyFollow", "session")
      getMyFollow().then((res) => {
        if (res.Code !== 1) return
        setFollowIds(res.Data.map((item) => item.FollowID))
      })
      setIsFollowing(false)
    })
  }

  return (
    <LayoutPage className="forum-follow" title="我的关注">
      {follows.map((follow) => (
        <div className="user" key={follow.ID}>
          <AvatarImg avatarLink={follow.FollowAvatar} width={"48px"} height={"48px"} icSize={"48px"} shape={"round"} />
          <div className="base-info">
            <div className="data-info">
              <span className="name">{follow.FollowNick}</span>
              <span onClick={getUserForumHistory.bind(null, follow)} className="history">
                历史帖子
              </span>
            </div>
            <div className="data-info">
              <div className="win_rate">
                <Icon icon="ion-trophy" className="title_win_ic" />
                <span className="txt">胜率 {follow.WinRate}%</span>
              </div>
              <span className="recently">
                最近{follow.HitCount}胜{follow.LoseCount}负
              </span>
            </div>

            {/* FollowID: { follow.FollowID }<br />
          NickName: { follow.NickName }<br />
          UID: { follow.UID }<br />
          ID: { follow.ID }<br /> */}
          </div>
          <div className={`follow${followIds.includes(follow.FollowID) ? " subscribed" : ""}`} onClick={toggleFollow.bind(null, follow.FollowID)}>
            {followIds.includes(follow.FollowID) ? "已" : ""}关注
          </div>
        </div>
      ))}
    </LayoutPage>
  )
})
