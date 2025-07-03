import { useEffect, forwardRef, createContext, useContext, useRef, useState, useCallback } from "react"

import { useConnect } from "@/magic/HubConnect"

import { menuList, groupImgs, icons, defaultRoom } from "@/components/BroadcastWork/constants.ts"
import { useMessageManager, preloadMessageList } from "./MessageManager"
import { useChatRoomManager } from "./ChatRoomManager"
import { useWebSocketManager } from "./WebSocketManager"
import { setMessageAsRead, getUserDataById } from "@/action/apis"

import Bus from "@/magic/EventBus"
import util from "@/magic/util"

const SocketContext = createContext()

export const withBroadcastContext = (Component) => {
  return forwardRef((props, ref) => {
    const data = useContext(SocketContext)
    return <Component ref={ref} broadcastData={data} {...props} />
  })
}

export default (props) => {
  const { currentPath } = props
  const [recentChats, setRecentChats] = useState(util.cache.get("recentChats")?.data ?? [])
  const shouldPreLoadMessages = useRef(false)
  const [messages, setMessages] = useState([])
  const { paths, hubRef, closeRef, isConnected, setIsConnected, isConnecting, setIsConnecting, cacheTimes } = useWebSocketManager(props)

  const disconnectTimeoutRef = useRef(null) // 用于存储定时器
  const lastDisconnectTimeRef = useRef(null) // 用于存储上次断开时间戳
  const usersRecordData = useRef({})

  const chatData = {
    recentChats,
    setRecentChats,
  }

  const {
    fetchMessageList,
    clearMessageList,
    removeMessageByIDs,
    mergeMessage,
    hasData,
    hasNewMessage,
    setHasNewMessage,
    getStorageKey,
    sendingMessage,
    getStorageData,
    updateStorageMessageList,
  } = useMessageManager(
    props,
    { hubRef, reconnecting, isConnected, isConnecting },
    { recentChats, setRecentChats },
    { messages, setMessages },
    cacheTimes
  )

  const {
    groups,
    setGroups,
    toId,
    groupId,
    chatRooms,
    currentChat,
    currentGroup,
    removeChatRoom,
    removeGroupRoomById,
    removePrivateRoomById,
    fetchBroadcastGroups,
    fetchRecentChats,
  } = useChatRoomManager(props, { hubRef, reconnecting, isConnected, isConnecting }, chatData, { messages, setMessages }, cacheTimes)

  const setMessageAsReaded = (gid, tid) => {
    const _gid = gid ?? groupId.current
    const _tid = tid ?? toId.current
    const isGroup = _tid === 0

    setRecentChats((prev) =>
      prev.map((chat) => {
        if (chat.UnreadCount > 0 && (isGroup ? chat?.GroupID === _gid : chat?.FID === _tid)) {
          setMessageAsRead(_gid, _tid)
          return { ...chat, UnreadCount: null }
        }
        return chat
      })
    )
  }

  useEffect(() => {
    if (recentChats.length === 0 || !shouldPreLoadMessages.current) return
    recentChats.forEach((chat) => {
      const IsGroup = !chat.UID
      const groupId = chat.GroupID || 0
      const toId = IsGroup ? 0 : util.getUserId() === chat.UID ? chat.FID : chat.UID
      // 检查缓存数据
      const cacheKey = getStorageKey(groupId, toId)
      const cachedData = util.cache.get(cacheKey, "session")
      if (cachedData && cachedData.time && Date.now() - cachedData.time < 3 * 60 * 1000) {
        // console.log(`缓存有效，跳过预加载: ${cacheKey}`)
        return
      }
      console.log(`缓存无效或不存在，获取新数据: ${cacheKey}`)
      preloadMessageList(groupId, toId) // 预加载消息列表
    })
    shouldPreLoadMessages.current = false
  }, [recentChats, shouldPreLoadMessages.current])

  useEffect(() => {
    Bus.on("broadcast.disconnect", (data) => {
      closeRef.current?.()
      setIsConnected(false)
      hubRef.current = null
      closeRef.current = null

      util.cache.remove("pinnedChats", "session")
      util.cache.remove("requestMembers", "session")
    })

    preloadImages(groupImgs)
    preloadImages(icons.map((img) => util.buildAssetsPath(`assets/icons/${img}`)))
    preloadImages([util.buildAssetsPath("/images/Broadcast/alert.svg")])

    return () => {
      Bus.off("broadcast.disconnect")
    }
  }, [])

  useEffect(() => {
    if (!util.isLogin()) return
    const shouldConnect = paths.some((path) => currentPath.includes(path))
    if (shouldConnect) {
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current)
        disconnectTimeoutRef.current = null
        console.log("用户在 3分钟内返回，取消断开操作")
      }
      establishSocketConnection() // 建立连接
      fetchBroadcastGroups() // 获取广播组
      fetchRecentChats() // 获取最近聊天记录
      return
    }

    // 如果用户离开，启动 3分钟的定时器
    if (hubRef.current !== null && closeRef.current !== null) {
      lastDisconnectTimeRef.current = Date.now() // 记录断开时间
      disconnectTimeoutRef.current = setTimeout(() => {
        closeRef.current?.()
        setIsConnected(false)
        hubRef.current = null
        closeRef.current = null
        console.log("Disconnected due to path change:", currentPath)
      }, 3 * 60 * 1000) // 3分钟后断开连接
    }
  }, [currentPath])

  useEffect(() => {
    if (!hasNewMessage) return
    setRecentChats((prev) =>
      prev.map((chat) => {
        const IsGroup = !chat.UID
        const message = IsGroup
          ? messages.find((msg) => msg.GroupID === chat.GroupID && msg.ToID === 0)
          : messages.find((msg) => msg.ToID !== 0 && msg.UID === chat.FID)
        if (!message || message.ID <= chat.ID) return chat
        const isSelfMessage = !!message.UID && util.getUserId() === message.UID
        const Title = isSelfMessage ? chat.FIDName : chat.GroupName || chat.NickName
        const Avatar = chat.Avatar || groupImgs[(IsGroup ? chat.GroupID : chat[isSelfMessage ? "FID" : "UID"]) % groupImgs.length]
        const _unreadBase = isSelfMessage || (message.GroupID === groupId.current && message[isSelfMessage ? "ToID" : "UID"] === toId.current) ? 0 : 1
        const UnreadCount = parseInt(chat.UnreadCount || 0) + _unreadBase
        return {
          ...chat,
          Title,
          Avatar,
          IsGroup,
          LastTime: "0秒前",
          Time: message.Time,
          Content: message.Content,
          IsReaded: UnreadCount > 0,
          UnreadCount,
          TimeStamp: Date.now(),
        }
      })
    )

    setHasNewMessage(false)
  }, [hasNewMessage])

  function establishSocketConnection() {
    if (hubRef.current !== null || isConnected || isConnecting) return Promise.resolve()

    return new Promise((resolve) => {
      const { chatHub, disconnect } = useConnect("broadcastHub", {
        ReceiveMessage: (msgList) => {
          const isGroup = toId.current <= 0 || groupId.current > 0
          // console.log({ isGroup, toId: toId.current, groupId: groupId.current })
          const _list =
            toId.current === -1
              ? msgList
              : msgList.filter((msg) => {
                  if (isGroup) {
                    return msg.GroupID === groupId.current
                  } else {
                    const msgID = msg.UID || msg.ToID
                    return msgID === toId.current
                  }
                })
          if (_list.length === 0) return

          setMessages((prev) => {
            const _msgs = [..._list, ...prev].filter((msg) => +msg.ID > 0)
            updateStorageMessageList(_list)
            return _msgs
          })
          setHasNewMessage(true)
        }, // 用于接收服务端推送消息
        onMsg: (data) => {
          // console.log(data)
        },
        onConnect: (data) => {
          console.log("context onConnect", data)
          cacheTimes.current.connection = Date.now()
          setIsConnected(true)
          resolve()
        },
        onDisconnect: (data) => {
          console.log("context onDisconnect", data)
          cacheTimes.current.connection = 0
          setIsConnected(false)
        },
      })
      closeRef.current = disconnect
      hubRef.current = chatHub
    })
  }

  async function reconnecting() {
    setIsConnecting(true)
    if (hubRef.current === null) {
      await establishSocketConnection()
    } else {
      await hubRef.current.connection.start()
    }
    setIsConnecting(false)
    if (currentPath.includes("newBroadcast")) {
      await fetchRecentChats()
    } else if (currentPath.includes("chatchannel")) {
      const newMessages = await fetchMessageList({ groupId: groupId.current, toId: toId.current, type: "merge" })
      if (newMessages.length > 0) setHasNewMessage(true)
    }
    console.log("Reconnected, state: " + hubRef.current.connection.state + ", toId: " + toId.current + ", groupId: " + groupId.current)
  }

  async function preLoadAllMessages() {
    shouldPreLoadMessages.current = true
  }

  function preloadImages(imageUrls) {
    imageUrls.forEach((url) => {
      const img = new Image()

      img.src = url
      img.style.visibility = "hidden" // 隐藏图片元素
      img.style.height = 0
      document.body.appendChild(img) // 将图片添加到文档中以触发加载
      img.onload = () => {
        document.body.removeChild(img) // 加载完成后移除图片元素
      }
    })
  }

  function preloadUserData(userId) {
    if (usersRecordData.current[userId]) return
    usersRecordData.current[userId] = {}
    const { Time } = util.cache.get(`UserRecordData_${userId}`) ?? {}
    if (Time && Date.now() - Time < 1000 * 60 * 5) return

    getUserDataById(userId).then((res) => {
      if (res.Code !== 1) return
      usersRecordData.current[userId] = { Data: res.Data, Time: Date.now() }
      util.cache.set(`UserRecordData_${userId}`, usersRecordData.current[userId], "session")
    })
  }

  return (
    <SocketContext.Provider
      value={{
        setToId: (id) => {
          toId.current = id
        },
        setGroupId: (id) => {
          groupId.current = id
        },
        getStorageData,
        clearMessageList,
        fetchMessageList,
        mergeMessage,
        removeMessageByIDs,
        hubRef,
        closeRef,
        hasData,
        messages,
        hasNewMessage,
        isConnected,
        establishSocketConnection,
        sendingMessage,
        fetchBroadcastGroups,
        groups,
        currentGroup,
        chatRooms,
        fetchRecentChats,
        removeChatRoom,
        removeGroupRoomById,
        removePrivateRoomById,
        preLoadAllMessages,
        setMessageAsReaded,
        reconnecting,
        cacheTimes,
        preloadUserData,
      }}
    >
      {props.children}
    </SocketContext.Provider>
  )
}
