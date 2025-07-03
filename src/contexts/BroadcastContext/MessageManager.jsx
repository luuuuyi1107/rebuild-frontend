import { useState } from "react"
import { uniqBy } from "lodash"
import { getBroadcastList, getRecentChats } from "@/action/apis"
import util from "@/magic/util"
import { notificationAsync } from "@/magic/notification"

export const preloadMessageList = async (groupId, toId) => {
  getBroadcastList({ groupId, toId }).then((res) => {
    if (res.Code !== 1) return
    util.cache.set(`messageList_${groupId}_${toId}`, { messages: res.Data, time: Date.now() }, "session")
  })
}

export const useMessageManager = (props, connection, chatData, messageData, cacheTimes) => {
  const [hasData, setHasData] = useState(true)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const MAX_RETRIES = 3 // 最大重试次数

  async function ensureConnected() {
    if (!util.isLogin()) return Promise.reject("请先登录")
    if (connection.hubRef.current !== null && connection.hubRef.current.connection.state === 1) return Promise.resolve()
    console.log("正在连接中，等待连接完成...")
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        // console.log(connection.hubRef.current)
        if (connection.hubRef.current !== null && connection.hubRef.current.connection.state === 1) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
    // 如果未连接且未在连接中，重新连接
  }

  async function fetchMessageList({ groupId, toId = 0, page = 1, pageSize = 10, storage = false, type = "merge" }) {
    if (!hasData) return
    let retryCount = 0 // 初始化重试计数

    try {
      if (connection.hubRef.current === null) {
        console.log("等待 WebSocket 连接...")
        await ensureConnected()
        console.log("WebSocket 连接成功")
      }
      if (connection.hubRef.current.connection.state !== 1) {
        await connection.reconnecting() // 尝试重新连接
      }

      // 封装一个函数来执行 invoke 调用
      const invokeGetList = async () => {
        return await connection.hubRef.current.invoke("GetList", groupId, toId, page, pageSize)
      }

      let res = await invokeGetList()
      if ((!res || res.Code !== 1) && util.isLogin()) {
        // console.log(connection.hubRef.current.connection.state)
        if (connection.hubRef.current.connection.state !== 1) {
          await connection.reconnecting()
        }
        // 如果调用失败且满足条件（连接状态为 1 且用户已登录），尝试重新调用
        while ((!res || res.Code !== 1) && retryCount < MAX_RETRIES) {
          console.log(
            `获取消息列表失败，尝试重新调用...（当前重试次数：${retryCount + 1}）, 连线状态: ${
              connection.hubRef.current.connection.state
            }, 登录状态: ${util.isLogin()}`
          )
          retryCount++
          res = await invokeGetList()
        }
      }
      if (!res || res.Code !== 1) {
        throw new Error(res?.Message || "获取消息列表失败")
      }

      if (storage) {
        savingMessageList(res.Data, groupId, toId)
      }

      if (!type) return Promise.resolve(res.Data)

      const _list = res.Data.filter((msg) => (!toId && msg.ToID === 0) || msg.UID === toId || msg.ToID === toId)
      if (_list.length < pageSize) setHasData(false)

      if (type === "merge") {
        mergeMessage(_list)
      } else if (type === "replace") {
        messageData.setMessages(_list)
      }

      return Promise.resolve(res.Data)
    } catch (error) {
      setHasData(false)
      if (!error.message.includes("Connection was disconnected before invocation result was received" && util.isLogin())) {
        await notificationAsync.alert(error.message, { class: "broadcast" })
      }
      return Promise.reject()
    }
  }

  function clearMessageList() {
    messageData.setMessages([])
    setHasData(true)
  }

  function removeMessageByIDs(GroupID, ToID) {
    messageData.setMessages((prev) => prev.filter((msg) => !(msg.GroupID === GroupID && msg.UID === ToID)))
  }

  function mergeMessage(_list) {
    messageData.setMessages((prev) => uniqBy([...prev, ..._list], "ID"))
  }

  function mergeMessageAndRemoveTemps(_list) {
    messageData.setMessages((prev) => {
      return uniqBy(
        [...prev, ..._list].filter((msg) => msg.ID > 0),
        "ID"
      )
    })
  }

  function mergeMessageAndRemoveTempsAndSaving(_list, groupId, toId) {
    messageData.setMessages((prev) => {
      const mergedMessages = uniqBy(
        [...prev, ..._list].filter((msg) => msg.ID > 0),
        "ID"
      )
      savingMessageList(mergedMessages.slice(-10), groupId, toId)

      return mergedMessages
    })
  }

  function getStorageKey(groupId, toId) {
    return `messageList_${groupId}_${toId}`
  }

  function savingMessageList(messages, groupId, toId) {
    const _groupId = groupId ?? (props.groupId || 0)
    const _toId = toId ?? (props.toId || 0)
    util.cache.set(getStorageKey(_groupId, _toId), { messages, time: Date.now() }, "session")
  }

  async function sendingMessage(msgData, type, groupId, toID, retryCount = 0) {
    const MAX_RETRIES = 3
    if (connection.isConnecting) return
    if (!connection.isConnected || !connection.hubRef.current || connection.hubRef.current.connection.state !== 1) await connection.reconnecting() //
    try {
      const res = await connection.hubRef.current.invoke("Speak", type, { text: "", quote: "", ...msgData }, groupId, toID)

      if (toID > 0) {
        if (!chatData.recentChats.filter((chat) => !chat.GroupID).find((chat) => toID === (chat.UID === util.getUserId() ? chat.FID : chat.UID))) {
          storageChatRooms()
        }
      } else {
        if (!chatData.recentChats.filter((chat) => !!chat.GroupID).find((chat) => chat.GroupID === groupId)) {
          storageChatRooms()
        }
      }
      if (!res || res.Code !== 1) throw new Error(res?.Message || "发送失败")
      const isGroup = (groupId === 0 && toID === 0) || groupId > 0
      if (isGroup) {
        mergeMessageAndRemoveTemps(res.Data)
      } else {
        cacheTimes.current.chats = Date.now()
        chatData.setRecentChats((prev) => {
          return prev.map((_chat) => {
            if (_chat.hasOwnProperty("GroupID") || _chat.FID !== toID) return _chat
            return {
              ..._chat,
              Content: msgData.text || res.Data[0].Content || "",
              LastTime: "0秒前",
              UnreadCount: null,
              TimeStamp: Date.now(),
            }
          })

          return prev
        })
        mergeMessageAndRemoveTempsAndSaving(res.Data, groupId, toID)
      }
      return res.Data
    } catch (error) {
      if (!util.isLoginOrNoti(props)) {
        return
      }

      // 检查是否达到最大重试次数
      if (retryCount >= MAX_RETRIES) {
        console.error("达到最大重试次数，停止重试")
        return Promise.reject(error)
      }

      await notificationAsync.alert(error.message, { class: "broadcast" }).then(async () => {
        if (error.message.includes("Connection was disconnected before invocation result was received")) {
          await connection.reconnecting()
          console.warn(`重试发送消息，当前重试次数：${retryCount + 1}`)
          return sendingMessage(msgData, type, groupId, toID, retryCount + 1) // 递归调用并增加重试计数
        }
      })
      return Promise.reject(error)
    }
  }

  function getStorageData(gid = null, tid = null) {
    const _groupId = gid ?? (props.groupId || 0)
    const _toId = tid ?? (props.toId || 0)
    return util.cache.get(getStorageKey(_groupId, _toId), "session") || { messages: [], time: 0 }
  }

  function updateStorageMessageList(msgs) {
    msgs.forEach((msg) => {
      const isGroup = (msg.GroupID === 0 && msg.ToID === 0) || msg.GroupID > 0
      const GroupID = isGroup ? msg.GroupID : 0
      const ToID = isGroup ? 0 : util.getUserId() === msg.UID ? msg.ToID : msg.UID
      const storeData = getStorageData(GroupID, ToID)
      savingMessageList([...storeData.messages, msg].slice(-10), GroupID, ToID)
    })
  }

  function storageChatRooms() {
    getRecentChats().then((res) => {
      if (res.Code !== 1) return
      cacheTimes.current.chats = Date.now()
      chatData.setRecentChats(res.Data)
      util.cache.set("recentChats", { data: res.Data, time: Date.now() })
    })
  }

  return {
    fetchMessageList,
    clearMessageList,
    removeMessageByIDs,
    mergeMessage,
    hasData,
    setHasData,
    hasNewMessage,
    setHasNewMessage,
    savingMessageList,
    getStorageKey,
    sendingMessage,
    getStorageData,
    updateStorageMessageList,
  }
}
