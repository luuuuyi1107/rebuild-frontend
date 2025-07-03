import { useMemo, Fragment } from "react"
import { groupBy, uniqBy, orderBy } from "lodash"
import { refuseFriendRequest } from "@/action/apis"
import dayjs from "dayjs"
import FriendItem from "./FriendItem"
import SwiperItem from "@/components/SwiperItem"
import util from "@/magic/util"
import Bus from "@/magic/EventBus"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

export default withRouter(({ friendList, checkingFriend, router }) => {
  const groupImgs = [
    ...new Array(6).fill(1).map((value, index) => `girl0${index + 1}`),
    ...new Array(4).fill(1).map((value, index) => `boy0${index + 1}`),
  ].map((img) => `https://76shangchuan.com/touxiang/${img}.png`)

  const timedFriends = useMemo(() => {
    const now = dayjs()
    const base = {
      最近三天: [],
      三天前: [],
      十天前: [],
    }

    const sortedFriendList = orderBy(
      friendList,
      (friend) => {
        const match = friend.Time.match(/\/Date\((\d+)\)\//)
        return match ? parseInt(match[1], 10) : 0
      },
      ["desc"]
    )

    // Remove duplicates based on From_UID and To_UID, keeping the latest Time
    const uniqueFriendList = uniqBy(sortedFriendList, (friend) => `${friend.From_UID}_${friend.To_UID}`)
    return {
      ...base,
      ...groupBy(uniqueFriendList, (friend) => {
        const match = friend.Time.match(/\/Date\((\d+)\)\//)
        const addTime = match ? dayjs(parseInt(match[1], 10)) : dayjs()
        const diffDays = now.diff(addTime, "days")
        if (diffDays <= 3) {
          return "最近三天"
        } else if (diffDays <= 10) {
          return "三天前"
        } else {
          return "十天前"
        }
      }),
    }
  }, [friendList])

  return Object.entries(timedFriends)
    .filter(([_, list]) => list.length > 0)
    .map(([key, list]) => {
      return (
        <Fragment key={key}>
          <div id={`captal-${key}`} className="text-[#737373] text-[14px] py-0.5">
            {key}
          </div>
          {list.map((friend, index) => {
            const isAsking = util.getUserId() === friend.From_UID
            const NickName = isAsking ? friend.To_NickName : friend.From_NickName
            const UID = isAsking ? friend.To_UID : friend.From_UID
            const Avatar = friend.Avatar

            const friendItem = (
              <FriendItem
                key={friend.From_UID + "_" + friend.To_UID + "_" + index}
                showSubName
                UID={UID}
                Avatar={Avatar}
                NickName={NickName}
                SubContent={friend.Note}
                onClick={(e) => {
                  if (e.target.closest(".swiper-dragging")) {
                    // 如果事件来源是 SwiperItem，则阻止冒泡)
                    return
                  }

                  router.isLoginToOrRedirect("/interaction/FriendData", {
                    IsGroup: false,
                    ID: util.getUserId() === friend.To_UID ? friend.From_UID : friend.To_UID,
                    NickName,
                    AddTime: friend.Time,
                    Avatar,
                    isExistFriend: friend.Status === 3,
                    Status: friend.Status,
                    isAsking,
                    Note: friend.Note || "",
                    RID: friend.RID,
                    selectedMenu: "address",
                    subWork: "newFriend",
                  })
                  return

                  if (friend.Status === 0) {
                    setTimeout(() => {
                      Bus.emit("broadcast.showToolBar", false)
                    }, 10)
                  }
                  checkingFriend({
                    IsGroup: false,
                    UID: util.getUserId() === friend.To_UID ? friend.From_UID : friend.To_UID,
                    NickName,
                    AddTime: friend.Time,
                    Avatar,
                    IsExisted: false,
                    Status: friend.Status,
                    isAsking,
                    Note: friend.Note || "",
                    RID: friend.RID,
                  })
                }}
              >
                {
                  // friend.Status 0未处理，1忽略，2拒绝，3通过
                  friend.Status === 0 && <div className="bg-[#F1F1F1] text-[14px] py-[6px] px-1 rounded-[6px] ml-auto font-[400]">查看</div>
                }

                {friend.Status === 2 && <div className="ml-auto text-[14px] text-[#808080]">已拒绝</div>}

                {friend.Status === 3 && (
                  <div className="ml-auto text-[14px] text-[#808080]">
                    {isAsking && <img className="mr-0.5" src={util.buildAssetsPath("assets/icons/ic_arrow_rt.svg")} />}
                    已新增
                  </div>
                )}
              </FriendItem>
            )

            // 如果 isAsking 为 false，则用 SwiperItem 包裹 FriendItem
            return !isAsking && friend.Status === 0 ? (
              <SwiperItem
                buttons={["删除"]}
                colors={["#FA5151"]}
                onClick={(text) => {
                  if (text !== "删除") return
                  refuseFriendRequest(friend.RID).then((res) => {
                    if (res.Code !== 1) return
                    notificationAsync.alert(res.Message).then(() => {
                      friend.Status = 2
                      Bus.emit("broadcast.onUpdateFriend", friend)
                    })
                  })
                }}
              >
                {friendItem}
              </SwiperItem>
            ) : (
              friendItem
            )
          })}
        </Fragment>
      )
    })
})
