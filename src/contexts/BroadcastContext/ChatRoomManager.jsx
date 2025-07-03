import { useState, useRef, useMemo } from "react"
import { getBroadcastGroups, getRecentChats } from "@/action/apis"
import { groupImgs, defaultRoom } from "@/components/BroadcastWork/constants.ts"
import dayjs from "dayjs"

export const useChatRoomManager = (props, connection, chatData, messageData, cacheTimes) => {
  const [groups, setGroups] = useState([])
  const groupId = useRef(props.groupId || 0)
  const toId = useRef(props.toId || 0)

  const currentGroup = useMemo(() => {
    if (toId.current > 0) return null // 个人聊天不需要获取组信息
    return groups.find((g) => g.ID === groupId.current)
  }, [groupId.current, toId.current, groups])

  const isGroup = useMemo(() => {
    if (toId.current < 0 || groupId.current < 0) return null
    if (groupId.current > 0 || toId.current === 0) {
      return true
    }
    return false
  }, [groupId.current, toId.current])

  const currentChat = useMemo(() => {
    return isGroup
      ? chatData.recentChats.find((room) => room.GroupID === groupId.current)
      : chatData.recentChats.find((room) => (room.UID === util.getUserId() ? room.FID === toId.current : room.UID === toId.current))
  }, [groupId.current, toId.current, isGroup, chatData.recentChats])

  const chatRooms = useMemo(() => {
    if (chatData.recentChats.length === 0 || !util.isLogin()) return [defaultRoom]
    const defaultData = chatData.recentChats.some((chat) => chat.GroupID === 0 && !chat.hasOwnProperty("FID")) ? [] : [defaultRoom]
    const _recentChats = defaultData.concat(chatData.recentChats).map((room) => {
      const isSelfMessage = !!room.UID && util.getUserId() === room.UID
      const Title = isSelfMessage ? room.FIDName : room.GroupName || room.NickName
      const Avatar = room.Avatar || groupImgs[room.GroupID % groupImgs.length]
      const IsGroup = !room.UID
      // const message = IsGroup
      //   ? messageData.messages.find((msg) => msg.GroupID === room.GroupID)
      //   : messageData.messages.find((msg) => msg.ToID !== 0 && msg.UID === room.FID)
      return {
        ...room,
        Title,
        Avatar,
        IsGroup,
        IsReaded: !room.UnreadCount,
      }
    })

    return _recentChats
  }, [chatData.recentChats])

  function removeChatRoom(room) {
    chatData.setRecentChats((prev) => prev.filter((chat) => chat.ID !== room.ID))
    fetchRecentChats(true)
  }

  function removeGroupRoomById(groupId) {
    chatData.setRecentChats((prev) => {
      return prev.filter((chat) => {
        if (chat.GroupID && chat.GroupID === groupId) {
          return false
        }
        return true
      })
    })
    fetchRecentChats(true)
    util.cache.remove(`messageList_${groupId}_0`, "session")
  }

  function removePrivateRoomById(toId) {
    chatData.setRecentChats((prev) => {
      return prev.filter((chat) => {
        if (chat.hasOwnProperty("GroupID")) {
          return true
        }
        const Id = chat.UID === util.getUserId() ? chat.FID : chat.UID
        return Id !== toId
      })
    })
    fetchRecentChats(true)
    util.cache.remove(`messageList_0_${toId}`, "session")
  }

  function fetchBroadcastGroups() {
    if (cacheTimes.current.groups && Date.now() - cacheTimes.current.groups < 1000 * 60) return // 3分钟内不重复请求
    getBroadcastGroups().then((res) => {
      if (res.Code !== 1) return
      cacheTimes.current.groups = Date.now()
      setGroups(res.Data)
    })
  }

  function fetchRecentChats(force = false) {
    if (!util.isLogin()) return
    return new Promise((resolve, reject) => {
      if (!force && cacheTimes.current.chats && Date.now() - cacheTimes.current.chats < 1000 * 60) return // 3分钟内不重复请求
      getRecentChats()
        .then((res) => {
          if (res.Code !== 1) {
            reject()
            return
          }
          cacheTimes.current.chats = Date.now()
          if (messageData.messages.length > 0) {
            const message = messageData.messages.slice(-1)[0]

            res.Data.forEach((newChat) => {
              const isGroup = !newChat.FID
              const toId = isGroup ? 0 : message.UID === util.getUserId() ? message.FID : message.UID
              newChat.TimeStamp = Date.now()
              if (newChat.UnreadCount > 0) {
                if (isGroup && newChat.GroupID === message.GroupID) {
                  newChat.UnreadCount = null
                } else if (!isGroup && (newChat.FID === toId || newChat.UID === toId)) {
                  newChat.UnreadCount = null
                }
              }
            })
          }
          chatData.setRecentChats(res.Data)
          util.cache.set("recentChats", { data: res.Data, time: Date.now() })
          resolve(res.Data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const convertToTimeStamp = (LastTime) => {
    if (LastTime.includes("秒前")) {
      const seconds = parseInt(LastTime.replace("秒前", ""), 10)
      return dayjs().subtract(seconds, "second").valueOf()
    } else if (LastTime.includes("分钟前")) {
      const minutes = parseInt(LastTime.replace("分钟前", ""), 10)
      return dayjs().subtract(minutes, "minute").valueOf()
    } else if (LastTime.includes("小时前")) {
      const hours = parseInt(LastTime.replace("小时前", ""), 10)
      return dayjs().subtract(hours, "hour").valueOf()
    }
  }

  const convertToLastTime = (TimeStamp) => {
    const lastSeconds = dayjs().diff(TimeStamp, "second")

    if (lastSeconds < 60) return `${lastSeconds}秒前`

    if (lastSeconds / 60 < 60) return `${Math.floor(lastSeconds / 60)}分钟前`

    if (lastSeconds / (60 * 60) < 24) return `${Math.floor(lastSeconds / (60 * 60))}小时前`

    return "1天前"
  }

  return {
    groups,
    setGroups,
    toId,
    groupId,
    chatRooms,
    currentGroup,
    currentChat,
    removeChatRoom,
    removeGroupRoomById,
    removePrivateRoomById,
    fetchBroadcastGroups,
    fetchRecentChats,
    isGroup,
  }
}
