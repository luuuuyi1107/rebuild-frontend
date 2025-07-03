import { getPinnedChats, postPinnedChats, getManagerList, getRequestFriendList2, setMessageAsRead, removeChat, getFriendList } from "@/action/apis"
import { useState, useEffect, useMemo, useRef } from "react"
import { orderBy, uniqBy, set } from "lodash"
import { notificationAsync } from "@/magic/notification"
import { menuList, MENU_MAP, MY_OPTIONS } from "./constants"
import IcAdd from "@/assets/icons/ic_add.svg"
import Bus from "@/magic/EventBus"
import util from "@/magic/util"
import Popover from "@/components/Popover"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

function getInitalMenu() {
  const _selectedMenu = util.getUrlParam("selectedMenu")
  const _subWork = util.getUrlParam("subWork")
  const top = util.getUrlParam("top") || 0
  return {
    main: _selectedMenu === MENU_MAP.ADDRESS || _selectedMenu === MENU_MAP.MY ? _selectedMenu : MENU_MAP.WECHAT,
    sub: _subWork || "",
    top,
  }
}

export const useBroadcastWork = (props) => {
  const initMenu = getInitalMenu()
  const storedPinnedChats = util.cache.get("pinnedChats", "session")
  const storedRequestMembers = util.cache.get("requestMembers", "session")
  const [selectedMenu, setSelectedMenu] = useState(initMenu.main)
  const [passChat, setPassChat] = useState(null)
  const [filterText, setFilterText] = useState("")
  const [friendText, setFriendText] = useState("")
  const [myOption, setMyOption] = useState(MY_OPTIONS.NORMAL)
  const [pinnedChats, setPinnedChats] = useState(storedPinnedChats?.data ?? [])
  const [subWork, setSubWork] = useState(initMenu.sub)
  const [showToolBar, setShowToolBar] = useState(true)
  const [requestMembers, setRequestMembers] = useState(storedRequestMembers?.data ?? [])
  const [isLoading, setIsLoading] = useState(true)
  const [friendList, setFriendList] = useState([])
  const roomsRef = useRef(null)
  const isInitialRender = useRef(true)
  const getDiffTIme = (time) => {
    const now = dayjs()
    return dayjs.duration(now.diff(time))
  }

  const getDiffTImeByText = (time) => {
    const now = dayjs()
    const [hour, min, sec] = time.split(":").map((textNum) => +textNum)
    const targetTime = dayjs().hour(hour).minute(min).second(sec)
    return dayjs.duration(now.diff(targetTime))
  }

  const convertToTimestamp = (relativeTime) => {
    const now = dayjs()
    let timestamp

    if (relativeTime.includes("秒前")) {
      const seconds = parseInt(relativeTime.replace("秒前", ""), 10)
      timestamp = now.subtract(seconds, "second").valueOf()
    } else if (relativeTime.includes("分钟前")) {
      const minutes = parseInt(relativeTime.replace("分钟前", ""), 10)
      timestamp = now.subtract(minutes, "minute").valueOf()
    } else if (relativeTime.includes("小时前")) {
      const hours = parseInt(relativeTime.replace("小时前", ""), 10)
      timestamp = now.subtract(hours, "hour").valueOf()
    } else if (relativeTime.includes("天前")) {
      const days = parseInt(relativeTime.replace("天前", ""), 10)
      timestamp = now.subtract(days, "day").valueOf()
    }

    return timestamp
  }

  const chatRoomsFilteredRanked = useMemo(() => {
    console.log(props.broadcastData?.chatRooms)

    const chatRoomsFiltered = props.broadcastData?.chatRooms
      .filter((item) => {
        if (!filterText) return true
        const keyWords = filterText.toLowerCase()
        return item.Title.toLowerCase().includes(keyWords)
      })
      .map((item) => {
        const type = item.IsGroup ? 1 : 0
        const id = getRoomId(item)
        const IsPinned = pinnedChats.some((chat) => chat.id === id && chat.type === type)
        return {
          ...item,
          IsPinned,
        }
      })

    // 分组 pinned 和非 pinned
    const pinnedGroup = chatRoomsFiltered.filter((item) => item.IsPinned)
    const nonPinnedGroup = chatRoomsFiltered.filter((item) => !item.IsPinned)

    // 排序规则
    const sortByLastTimeAndUnreadCount = (group) => {
      console.log({ group })

      return orderBy(
        group,
        [
          (item) => item.TimeStamp,
          // (item) => -(item.UnreadCount ? 1 : 0), // 按未读消息数降序排列
          // (item) => item.GroupName || item.Title,
        ],
        ["desc"]
      )
    }

    // 对每组进行排序
    const sortedPinnedGroup = sortByLastTimeAndUnreadCount(pinnedGroup)
    const sortedNonPinnedGroup = sortByLastTimeAndUnreadCount(nonPinnedGroup)

    // 合并两组
    return [...sortedPinnedGroup, ...sortedNonPinnedGroup]
  }, [pinnedChats, props.broadcastData?.chatRooms, filterText])

  const unreadTotalCount = useMemo(() => {
    return chatRoomsFilteredRanked.reduce((acc, cur) => {
      return acc + parseInt(cur.UnreadCount ?? "0")
    }, 0)
  }, [chatRoomsFilteredRanked, isLoading])

  const headTitle = useMemo(() => {
    return selectedMenu === MENU_MAP.FRIEND
      ? "新增好友"
      : subWork === "newFriend"
      ? "新的朋友"
      : subWork === "group"
      ? "群组"
      : subWork === "headshots"
      ? "个人大头贴"
      : selectedMenu === MENU_MAP.ADDRESS
      ? "通讯录"
      : selectedMenu === MENU_MAP.MY
      ? "个人资讯"
      : "微信聊室"
  }, [selectedMenu, subWork])

  const newRequestFriendLength = useMemo(() => {
    if (!util.isLogin()) return 0
    const selfId = util.getUserId()
    const sortedFriendList = orderBy(
      requestMembers,
      (friend) => {
        const match = friend.Time.match(/\/Date\((\d+)\)\//)
        return match ? parseInt(match[1], 10) : 0
      },
      ["desc"]
    )
    const uniqueFriendList = uniqBy(sortedFriendList, (friend) => `${friend.From_UID}_${friend.To_UID}`)
    return uniqueFriendList.filter((friend) => {
      return friend.Status === 0 && selfId !== friend.From_UID
    }).length
  }, [requestMembers])

  function selectRoom(room) {
    if (!util.isLogin()) {
      return notificationAsync.confirm("请先登录", { class: "broadcast" }).then(() => {
        props.router.push("/site/login")
      })
    }
    props.broadcastData?.clearMessageList()
    let groupId = 0
    let toId = 0
    let title = ""

    if (room.IsGroup) {
      groupId = room.GroupID
      toId = 0
      title = room.Title
    } else {
      const isSelfMessage = util.getUserId() === room.UID
      toId = isSelfMessage ? room.FID : room.UID
      title = isSelfMessage ? room.FIDName : room.NickName
    }
    props.broadcastData?.setToId(toId)
    props.broadcastData?.setGroupId(groupId)
    props.router.replace("/interaction/newBroadcast", { top: roomsRef.current.scrollTop })
    setTimeout(() => {
      props.router.push("/interaction/chatchannel", { groupId, toId, title, subWork, selectedMenu })
    }, 0)
  }

  function deleteRoom(room) {
    const groupId = room.IsGroup ? room.GroupID : 0
    const toId = room.IsGroup ? 0 : util.getUserId() === room.UID ? room.FID : room.UID
    const index = room.ID
    removeChat(groupId, toId, index).then((res) => {
      props.broadcastData?.fetchRecentChats(true)
      props.broadcastData?.removeChatRoom(room)
    })
  }

  function getRoomId(room) {
    return room.GroupID === 0 && room.IsGroup ? 0 : +(room.GroupID || (util.getUserId() === room.UID ? room.FID : room.UID))
  }

  const getAddFriendComps = () =>
    util.isLogin() ? (
      <Popover
        content={
          <div
            className="text-[16px] leading-none"
            onClick={() => {
              setSelectedMenu(MENU_MAP.FRIEND)
            }}
          >
            <img className="mr-0.5 translate-y-[2px]" src={util.buildAssetsPath("assets/icons/ic_addmember.svg")} />
            新增好友
          </div>
        }
      >
        <IcAdd className="absolute right-1 top-[12px]" />
        {/* <img className="absolute right-1 top-[9px]" src={IcAdd} /> */}
      </Popover>
    ) : (
      <IcAdd
        onClick={() => {
          props.router.push("/site/login")
        }}
        className="absolute right-1 top-[12px]"
      />
    )

  function onPinned(room) {
    const id = getRoomId(room)
    const type = room.IsGroup ? 1 : 0
    if (isNaN(id)) return
    setPinnedChats((prevPinnedChats) => {
      const _pinnedChats = (!room.IsPinned ? [{ id, type }] : []).concat(prevPinnedChats.filter((chat) => !(chat.id === id && chat.type === type)))
      postPinnedChats(_pinnedChats.map(({ id, type }) => `${id}|${type}`).join(","))
      util.cache.set("pinnedChats", { data: _pinnedChats, timestamp: Date.now() }, "session")
      return _pinnedChats
    })
  }

  function onReaded(room) {
    const { GroupID = 0, FID = 0, IsGroup, Content } = room
    setMessageAsRead(GroupID, FID).then((res) => {
      if (res.Code !== 1) {
        return notificationAsync.alert("失败")
      }
      setChatGroups((prevChatGroups) =>
        prevChatGroups.map((chatGroup) => (chatGroup.ID === room.ID ? { ...chatGroup, UnreadCount: 0, IsReaded: true } : chatGroup))
      )
    })
  }

  async function sendMessage(msgData, toID, groupId = 0, type = 0) {
    try {
      const res = await props.broadcastData?.hubRef.current.invoke("Speak", type, { text: "", quote: "", ...msgData }, groupId, toID)
      if (res.Code !== 1) throw new Error(res.Message)
      props.broadcastData.mergeMessage(res.Data)
      setTimeout(() => {
        scrollToBottom()
      }, 10)
    } catch (error) {
      notificationAsync.alert(error.message, { class: "broadcast" })
    }
  }

  function requestFriendsData() {
    return new Promise((resolve, reject) => {
      getRequestFriendList2()
        .then((res) => {
          if (res.Code !== 1) throw res.Message
          util.cache.set("requestMembers", { data: res.Data, timestamp: Date.now() }, "session")
          setRequestMembers(res.Data)
          resolve()
        })
        .catch(reject)
    })
  }

  useEffect(() => {
    if (!util.isLogin()) return

    if (!(storedPinnedChats?.timestamp && Date.now() - storedPinnedChats.timestamp < 1000 * 60 * 3)) {
      getPinnedChats().then((res) => {
        if (res.Code !== 1 || !res.Data?.length > 0) return
        const _list = (res.Data ?? [])
          .map(({ SortText }) => SortText)
          .join(",")
          .split(",")
          .reduce((acc, text) => {
            const [id, type] = text.split("|")
            if (!id || !type || isNaN(id) || isNaN(type)) return acc
            return acc.concat({ id: +id, type: +type })
          }, [])
        util.cache.set("pinnedChats", { data: _list, timestamp: Date.now() }, "session")
        setPinnedChats(_list)
      })
    }
    getManagerList().then((res) => {
      if (res.Code !== 1) return
      util.cache.set("ManagerList", res.Data)
    })
    props.broadcastData?.setToId(-1)
    props.broadcastData?.setGroupId(-1)
    props.broadcastData?.preLoadAllMessages()

    Bus.on("broadcast.showToolBar", setShowToolBar)
    Bus.on("broadcast.onUpdateFriend", (friend) => {
      setRequestMembers((prev) => prev.map((f) => (f.RID === friend.RID ? friend : f)))
    })

    const updateFriendList = () => {
      return new Promise((resolve, reject) => {
        getFriendList()
          .then((res) => {
            if (res.Code !== 1) {
              reject(res.Message)
              return
            }
            setFriendList(res.Data)
            resolve(res.Data)
          })
          .catch(() => {
            reject("获取好友列表失败")
          })
      })
    }
    updateFriendList()
    Bus.on("broadcast.updateFriendList", updateFriendList)

    const timer = setInterval(() => {
      requestFriendsData()
    }, 7.5 * 1000)
    requestFriendsData().finally(() => setIsLoading(false))

    getFriendList().then((res) => {
      if (res.Code !== 1) return
      setFriendList(res.Data)
    })

    setTimeout(() => {
      isInitialRender.current = false
    }, 0)

    return () => {
      Bus.off("broadcast.showToolBar")
      Bus.off("broadcast.onUpdateFriends")
      timer && clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (isInitialRender.current) return

    if (selectedMenu === MENU_MAP.WECHAT) {
      props.router.replace("/interaction/newBroadcast")
    } else if (selectedMenu) {
      props.router.replace(`/interaction/newBroadcast?selectedMenu=${selectedMenu}${subWork ? `&subWork=${subWork}` : ""}`)
    }
  }, [selectedMenu, subWork])

  useEffect(() => {
    if (!roomsRef.current || initMenu.top === 0) return
    setTimeout(() => {
      roomsRef.current.scrollTop = initMenu.top
    }, 0)
  }, [roomsRef.current])

  return {
    menuList,
    MENU_MAP,
    selectedMenu,
    filterText,
    chatRoomsFilteredRanked,
    myOption,
    setFilterText,
    setSelectedMenu,
    selectRoom,
    deleteRoom,
    friendText,
    setFriendText,
    pinnedChats,
    setPinnedChats,
    subWork,
    setSubWork,
    headTitle,
    getAddFriendComps,
    onPinned,
    onReaded,
    messages: props.broadcastData?.messages,
    passChat,
    setPassChat,
    sendMessage,
    showToolBar,
    setShowToolBar,
    unreadTotalCount,
    requestMembers,
    newRequestFriendLength,
    isLoading,
    friendList,
    groups: props.broadcastData?.groups,
    currentGroup: props.broadcastData?.currentGroup,
    roomsRef,
  }
}
