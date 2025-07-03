import React from "react" //
import AvatarImg from "@/components/AvatarImg"
// import { Icon } from "react-onsenui"
import util from "@/magic/util"
// import { toggleTopComment } from "@/action/apis"
import { orderBy } from "lodash"

{
  /* Comment */
}
export default (props) => {
  const items = props.items.slice()
  function setReplyItems(item, state) {
    item.showAllReplys = state
    updateItems(item)
  }

  function togglePin(item) {
    if (!props.isLogin) {
      props.loginEvent()
      return
    }

    // toggleTopComment(item.ID).then((res) => {
    //   console.log({ res })
    //   if (res.Message !== "操作成功") return
    //   // item.isPin = !item.isPin

    //   const _oldSortItem = items.find((item) => item.Sort === 1)
    //   _oldSortItem.Sort = 0
    //   updateItems(_oldSortItem)
    //   item.Sort = 1
    //   updateItems(item)
    //   sortItems()
    // })
  }

  function toggleItemLike(item) {
    if (!props.isLogin) {
      props.loginEvent()
      return
    }
    item.liked = !item.liked
    item.like += item.liked ? 1 : -1
    updateItems(item)
  }

  function updateItems(item) {
    const idx = items.findIndex(({ ID }) => item.ID === ID)
    if (idx < 0) return
    props.update([...items.slice(0, idx), item, ...items.slice(idx + 1)])
  }

  function sortItems(item) {
    props.update(orderBy(items, (item) => item.Sort === 1, ["desc"]))

    // props.update([...items.slice(0, idx), item, ...items.slice(idx + 1)])
  }

  function lessOneDayText(time) {
    const oneMinuteInMilliseconds = 60 * 1000
    const oneHourInMilliseconds = 60 * oneMinuteInMilliseconds
    const oneDayInMilliseconds = 24 * oneHourInMilliseconds

    if (time >= oneDayInMilliseconds) {
      const days = Math.floor(time / oneDayInMilliseconds)
      return days + "天前"
    } else if (time >= oneHourInMilliseconds) {
      const hours = Math.floor(time / oneHourInMilliseconds)
      return hours + "小时前"
    } else if (time >= oneMinuteInMilliseconds) {
      const minutes = Math.floor(time / oneMinuteInMilliseconds)
      return minutes + "分钟前"
    } else {
      const seconds = Math.floor(time / 1000)
      return seconds + "秒前"
    }
  }

  function convertToNumber(time) {
    return parseInt(time.match(/\d+/g)[0])
  }

  function commentTime(time) {
    const timeNumber = convertToNumber(time)
    const difference = Date.now() - timeNumber
    return difference > 24 * 60 * 60 * 1000 ? util.date.format(new Date(timeNumber), "YYYY-MM-DD hh:mm", 8) : lessOneDayText(difference)
  }

  return (
    <div className="comment_record" style={{ display: props.active ? "block" : "none" }}>
      {items.map((item, itemIdx) => (
        <div key={item.ID} className="comment-item">
          <AvatarImg UID={item.UID} width={"36px"} height={"36px"} icSize={"36px"} shape={"round"} />
          <div className="rest-data">
            <div className="user">
              <div className="detail-info">
                <div className="name">
                  {item.NickName}
                  {/* { item.IsFirstReply == 0 && <span className="host">楼主</span> } */}
                </div>
                <div className="time">{commentTime(item.AddTime)}</div>
              </div>
              <div className="func-btns">
                {/* { itemIdx === 0 && <div className="top">置顶</div> } */}
                {item.PostUID === props.hostID && (
                  <img
                    onClick={() => {
                      togglePin(item)
                    }}
                    className="icon"
                    src={util.buildAssetsPath(`assets/icons/${item.Sort === 1 ? "" : "un"}pin.svg`)}
                  />
                )}
                <div
                  className="like"
                  onClick={() => {
                    toggleItemLike(item)
                  }}
                >
                  <img className="icon" src={util.buildAssetsPath(`assets/icons/like${item.liked ? "-color" : ""}.svg`)} />
                  {item.like > 0 && <div className="count">0</div>}
                </div>
              </div>
            </div>

            <div className="periods">
              <div>{item.Comment}</div>
              {!!item.periods &&
                item.periods.map((period, pidx) => (
                  <div key={period.no + "-" + pidx}>
                    {period.no}期:{period.message}
                  </div>
                ))}
            </div>

            {!!item.replyList && item.replyList.length > 0 && (
              <div className="replay-items">
                <div
                  className="replys-num"
                  onClick={() => {
                    if (!showAll) setShowAll(true)
                  }}
                >
                  {item.replyList.length}回复
                </div>
                <div className="replys-area">
                  {item.replyList
                    .filter((_, index) => index === 0 || item.showAllReplys)
                    .map((reply, ridx) => (
                      <div key={ridx}>
                        <div className="user-info">
                          <AvatarImg UID={reply.UID} width={"20px"} height={"20px"} icSize={"20px"} shape={"round"} />
                          <font className="user-name">{reply.NickName}:</font>
                          {reply.isHost && <div className="host">楼主</div>}
                        </div>
                        <div className="reply-comment">{reply.Comment}</div>
                      </div>
                    ))}
                </div>

                <div
                  onClick={() => {
                    setReplyItems(item, !item.showAllReplys)
                  }}
                  className="show-all-btn"
                >
                  {item.showAllReplys ? "收合" : `展开${item.replyList.length - 1}條`}回复
                </div>

                {/* {!item.showAllReplys && (
                  <div
                    onClick={() => {
                      setReplyItems(item, true)
                    }}
                    className="show-all-btn"
                  >
                    展开 {item.replyList.length - 1} 條回复
                  </div>
                )} */}
              </div>
            )}

            <div
              onClick={() => {
                props.setPushComment(item)
              }}
              className="reply-btn"
            >
              回复
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
