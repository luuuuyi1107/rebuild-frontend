import React, { useState, useEffect } from "react"
// import "./style.scss"
import EmptyView from "@/components/EmptyView"
import History from "./history"
import Comment from "./comment"
import Cominput from "./inputarea"
import util from "@/magic/util"
// import { getCommentList, getCommentReplyList, addComment, addReply } from "@/action/apis"
import { Icon } from "react-onsenui"
import AvatarImg from "@/components/AvatarImg"

export default (props) => {
  const tabs = [
    { title: "全部评论", key: "comment" },
    { title: "历史推荐", key: "history" },
  ]
  const [activeTab, setActiveTab] = useState(tabs[0].key)
  const [comments, setComments] = useState([])
  const [replyItem, setReplyItem] = useState(null)
  const user = util.getUserData()
  function changeActiveTab(key) {
    if (key === activeTab) return
    setActiveTab(key)
  }

  function addMessage(message) {
    if (!!replyItem) {
      return
    }
  }

  function fetchData() {
    // getCommentList(props.id).then((res) => {
    //   if (res.Code !== 1) return
    //   const _comments = res.Data
    //   Promise.all(res.Data.map((item) => getCommentReplyList(item.ID))).then((result) => {
    //     _comments.forEach((_comment, index) => {
    //       _comment.replyList = result[index].Code == 1 ? result[index].Data : []
    //       _comment.replyList.forEach((reply) => {
    //         reply.isHost = reply.UID === _comment.UID
    //       })
    //     })
    //     setComments(_comments)
    //   })
    // })
  }

  function commentTime(time) {
    const timeNumber = parseInt(time.match(/\d+/g)[0])
    const difference = Date.now() - timeNumber
    return difference > 24 * 60 * 60 * 1000 ? util.date.format(new Date(timeNumber), "YYYY-MM-DD hh:mm", 8) : lessOneDayText(difference)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="switch-session">
      <div className="tabs">
        {tabs.map((tab) => (
          <div className={"tab" + (tab.key === activeTab ? " active" : "")} key={tab.key} onClick={changeActiveTab.bind(null, tab.key)}>
            {tab.title}
          </div>
        ))}
      </div>
      <Comment
        id={props.id}
        hostID={user.ID}
        key={comments.length}
        items={comments}
        active={activeTab === tabs[0].key}
        update={setComments}
        setPushComment={(item) => {
          setReplyItem(item)
          document.getElementById("commentMessageInput").focus()
        }}
        isLogin={util.isLogin()}
        loginEvent={() => {
          util.isLogin()
        }}
      />
      <History items={props.history} active={activeTab === tabs[1].key} />

      {((activeTab === tabs[1].key && props.history.length === 0) || (activeTab === tabs[0].key && comments.length === 0)) && <EmptyView />}

      {activeTab === tabs[0].key && comments.length === 0 && <div className="h-8"></div>}

      {activeTab === tabs[0].key && (
        <Cominput avatar={user.Avatar.FilePath} sendingMessage={addMessage}>
          {replyItem && (
            <div className="reply-info">
              <Icon icon="ion-arrow-return-left" />
              <div className="reply-content">
                <AvatarImg width={"21px"} height={"21px"} shape={"round"} UID={replyItem.UID} />
                <div className="inner-content">
                  <div className="comment">{replyItem.Comment}</div>
                  <div>
                    {replyItem.NickName}, {commentTime(replyItem.AddTime)}
                  </div>
                </div>
              </div>
              <Icon
                icon="ion-close-round"
                onClick={() => {
                  setReplyItem(null)
                }}
              />
            </div>
          )}
        </Cominput>
      )}
    </div>
  )
}
