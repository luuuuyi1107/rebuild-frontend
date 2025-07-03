import * as action from "@/action"
import { notificationAsync } from "@/magic/notification"
import * as apiNotification from "@/magic/ApiNotification"
import { useState, useRef, useEffect, useLayoutEffect, useMemo, createRef } from "react"
import { uploadFiletoServer } from "@/action/apis"
import _ from "lodash"
import gameConfigs from "@/magic/gameConfigs"
import ClipboardJS from "clipboard"
import util from "@/magic/util"
import Bus from "@/magic/EventBus"
import dayjs from "dayjs"

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

const MEDIA_TYPE = {
  IMAGE: 3,
  AUDIO: 4,
  VIDEO: 5,
}

const getImagesLastOnload = (images) => {
  return new Promise((resolve) => {
    let loadedCount = images.length

    const handleImage = () => {
      loadedCount -= 1
      if (loadedCount === 0) {
        console.log("所有图片加载完成")
        resolve()
      }
    }

    images.forEach((img) => {
      if (img.complete) {
        loadedCount -= 1
        return
      }
      img.onload = () => {
        handleImage()
      }
      img.onerror = () => {
        handleImage()
      }
    })

    if (loadedCount === 0) {
      // console.log("缓存所有图片已经加载完成")
      resolve()
    }
  })
}

export const useMessageWork = (props, PageSize = 10) => {
  const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const groupId = props.groupId || 0
  const toId = props.toId || 0
  const title = util.getUrlParam("title") || "广播"
  const [isloadMoreMessage, setIsLoadMoreMessage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showShare, setShowShare] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [text, setText] = useState("")
  const [quoteData, setQuoteData] = useState("")
  const [actionData, setActionData] = useState("")
  const messageList = useMemo(() => {
    return _.orderBy(
      _.uniqBy(props.broadcastData?.messages?.map(props.convert), "id"),
      [(item) => (item.id < 0 ? Number.MAX_SAFE_INTEGER - item.id : item.id)], // 自定义排序逻辑
      ["asc"] // 按升序排列
    )
  }, [props.broadcastData?.messages])
  const managerList = useMemo(() => {
    const groups = util.cache.get("ManagerList")
    const groupManagers = groups ? groups.find((item) => item.GroupId === groupId) : null
    if (groupManagers) {
      return groupManagers.Managers
    }
    return []
  }, [groupId])

  const lastChatId = useMemo(
    () => (messageList.length > 0 ? messageList.reduce((max, obj) => (obj.id > max ? obj.id : max), -Infinity) : 0),
    [messageList]
  )

  const [followBetData, setFollowBetData] = useState(null)
  const [followBetModals, setFollowBetModals] = useState(false)
  const [PageIndex, setPageIndex] = useState(1)
  const [followBetMoney, setFollowBetMoney] = useState(0)
  const loadTimer = useRef(null)
  const scrollTimer = useRef(null)
  const timer = useRef(null)
  const timeOutAT = useRef(0)
  const keepPosition = useRef(0)
  const chatContentBoxRef = useRef()
  const chatListRef = useRef()
  const isBottomRef = useRef(false)
  const hasScrolledToBottom = useRef(false)
  const shouldScrollToBottom = useRef(false)
  const moreFuncRef = createRef(null)
  const scrollDistance = useRef(0)

  const menuData = {
    wechat: "微信",
    address: "通讯录",
    six: "六合圈",
    my: "我的",
  }

  const announce = useMemo(() => {
    if (!props.broadcastData?.currentGroup) return null
    const text = _.get(props.broadcastData?.currentGroup, "Announcement", "")
    let time = _.get(props.broadcastData?.currentGroup, "AddTime", "")
    if (!text) return null
    if (time) {
      time = util.date.format(util.date.toDate(time), "YYYY.MM.DD HH:mm:ss")
    }
    return { text, time }
  }, [props.broadcastData?.currentGroup])
  const [showAnnounce, setShowAnnounce] = useState(false)
  const [showManagerModal, setShowManagerModal] = useState(false)
  const [userDetailModal, setUserDetailModal] = useState(false)
  const [userDetailData, setUserDetailData] = useState(null)

  function sendText() {
    let _text = text.trim()
    if (!_text) {
      notificationAsync.alert("不能发送空文本", { class: "broadcast" })
      return
    }

    setText("")
    sendingMessage(_text)
  }

  function sendingMessage(_text, action = "") {
    if (!_text) return
    let quote = quoteData ? JSON.stringify(_.pick(quoteData, ["content", "fromName", "time"])) : ""
    try {
      sendMessage({ text: _text, quote })
      props.broadcastData?.mergeMessage([getTempMessage(quote + _text)])
      shouldScrollToBottom.current = isScrolledToBottom(chatListRef.current, 5)
      setQuoteData("")
      if (props.emojiData?.emojiList?.some((emoji) => emoji.Code === _text)) return Promise.resolve()
      setActionData(action)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  function isScrolledToBottom(element, threshold = 1) {
    if (!element) return false

    const scrollTop = element.scrollTop // 当前滚动条位置
    const clientHeight = element.clientHeight // 可视区域高度
    const scrollHeight = element.scrollHeight // 内容总高度

    // 判断是否滑动到底部
    return Math.abs(scrollHeight - scrollTop - clientHeight) <= threshold
  }

  function getTempMessage(Content) {
    const selfData = util.getUserData()
    const ID = Math.min(...props.broadcastData?.messages.map((message) => message.ID).concat(0)) - 1

    return {
      Avatar: selfData.Avatar.FilePath,
      Content,
      GroupID: groupId,
      ID,
      NickName: selfData.NickName,
      ToID: toId,
      UID: selfData.ID,
      Type: 0,
      Time: dayjs().format("HH:mm:ss"),
      Status: 0,
      OpTime: null,
    }
  }

  function sendMessage(msgData, type = 0, toID = toId) {
    return new Promise(async (resolve, reject) => {
      props.broadcastData
        .sendingMessage(msgData, type, groupId, toID)
        .then((res) => {
          resolve(res)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  function reachBottom() {
    scrollToBottom()
    setTimeout(() => {
      getImagesLastOnload(Array.from(chatContentBoxRef.current.getElementsByTagName("img"))).then(() => {
        scrollToBottom()
      })
    }, 0)
  }

  function scrollToBottom() {
    if (!chatListRef.current) return
    chatListRef.current.scrollTop = chatListRef.current?.scrollHeight
  }

  function scrollByValue(value) {
    if (!chatListRef.current) return
    chatListRef.current.scrollTop += value
  }

  function messageEffect(data) {
    if (!data.content || !data.type) return
    let rebuildMsg = data.content.replace(/\(strong\)(.*?)\(\/strong\)/g, "$1")
    rebuildMsg = rebuildMsg.replace(/\(span=gbzy\)(.*?)\(\/span\)/g, "$1")
    const content = rebuildMsg.split("(quote)")
    switch (data.type) {
      case 1:
        atName(data.fromName)
        break
      case 2:
        let _QuoteData = { ...data }
        if (content.length > 1) {
          _QuoteData.content = content[3]
        } else {
          if (content[0].includes("{") && content[0].includes("fromName") && content[0].includes("content")) {
            const originalString = content[0]
            _QuoteData.content = originalString.substring(originalString.indexOf("}") + 1)
          } else {
            _QuoteData.content = content[0]
          }
        }
        setQuoteData(_QuoteData)
        break
      case 3:
        if (content.length > 1) {
          onCopy(content[3])
        } else {
          onCopy(content[0])
        }
        break
    }
  }

  function setFollowBetModal(shareBet, OpTime, newBetTexts) {
    const isBaccarat = shareBet.GameTitle === "哈希百家乐"
    const config = isBaccarat ? null : util.findGames(shareBet.LoID)
    shareBet.OpTime = OpTime
    setFollowBetMoney(shareBet.BetMoney)
    setTimeout(() => {
      let shareBetLength = newBetTexts.reduce((prev, curr) => prev + curr.length, 0)
      let baseUnit = 1

      if (config) {
        let betLx = shareBet.Lx
        if (betLx == 48 || betLx == 44 || betLx == 49) {
          // config 的内容是用type 来区分的 4, 5, 6 肖中特
          betLx = "48" + (betLx == 48 ? "-4" : betLx == 49 ? "-5" : betLx == 44 ? "-6" : "")
        }

        let gameConfig = gameConfigs[config.type][betLx]
        if (gameConfig) {
          if (!!gameConfig.betCount) {
            shareBetLength = gameConfig.betCount(
              ["选三前直", "选二连直"].some((text) => gameConfig.title === text)
                ? newBetTexts.map((newText) => newText.map((text) => ({ text })))
                : gameConfig.title === "对子直选"
                ? newBetTexts.map((newText) => [newText.join(",")])
                : newBetTexts
            )
          }
          if (!!gameConfig.baseUnit) {
            baseUnit = gameConfig.baseUnit
          }
        }
      }
      setFollowBetData({ ...shareBet, shareBetLength, baseUnit, isBaccarat })
      setFollowBetModals(true)
    }, 100)
  }

  function onCopy(text) {
    return new Promise((resolve, reject) => {
      let fakeElement = document.createElement("button")

      let clipboard = new ClipboardJS(fakeElement, {
        text() {
          return text
        },
        action() {
          return "copy"
        },
        container: typeof container === "object" ? container : document.body,
      })
      clipboard.on("success", (e) => {
        clipboard.destroy()

        notificationAsync.alert("已成功复制到剪贴板", {
          title: "复制成功",
          class: "broadcast",
        })
        resolve(e)
      })
      clipboard.on("error", (e) => {
        clipboard.destroy()
        notificationAsync.alert({
          title: "浏览器不支持，请手动复制",
          messageHTML: `<div class="manual-copy-input-wrap"><input value="${text}" οnfοcus="this.select()"/></div>`,
        })
        reject(e)
      })
      document.body.appendChild(fakeElement)
      fakeElement.click()
      document.body.removeChild(fakeElement)
    })
  }

  async function loadMoreMessage(pageIndex) {
    if (isloadMoreMessage && pageIndex != 1) return
    setIsLoadMoreMessage(true)
    if (!pageIndex) {
      pageIndex = PageIndex + 1
    }
    await props.broadcastData.fetchMessageList({ groupId, toId, page: pageIndex, pageSize: PageSize })
    setPageIndex(pageIndex)
    setIsLoadMoreMessage(false)
  }

  async function confirmFollowBet() {
    const serverTime = util.date.format(util.getServerTime(), "HH:mm:ss")
    if (!serverTime || followBetData.OpTime - serverTime < 0) {
      notificationAsync.alert("投注截止", { class: "broadcast" }).then(() => {
        setFollowBetModals(false)
      })
      return
    }

    let res = null
    if (followBetData.isBaccarat) {
      res = await action.post("Baccarat/HXBet", {
        ID: followBetData.LoID,
        Code: "hxbaccarat",
        betText: `${followBetData.BetText},${followBetMoney}`,
      })
    } else {
      const lx = [44, 49].some((v) => v == followBetData.Lx) ? 48 : followBetData.Lx // 44, 49 分别为六、五肖中特 投注时要转成 48
      res = await action.post("Lottery/Bet", {
        lotteryid: followBetData.LoID,
        lx,
        money: followBetMoney,
        betText: followBetData.BetText,
      })
    }

    if (res.Code != 1) {
      apiNotification.alert(res, { title: "操作提示" }, props).then(() => {
        setFollowBetModals(false)
      })
    } else {
      notificationAsync.alert(res.Message, { title: " 恭喜您!" }).then(() => {
        setFollowBetModals(false)
      })
    }
  }

  function atName(fromName) {
    timeOutAT.current = 0
    setText((prevText) => prevText + "@" + fromName + " ")
  }

  function generateThumbnail(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      video.src = URL.createObjectURL(file)

      video.addEventListener("loadeddata", () => {
        // 设定截图的时间点为影片中间
        video.currentTime = video.duration / 2
      })

      video.addEventListener("seeked", () => {
        // 设定缩略图大小（例如四分之一尺寸）
        canvas.width = video.videoWidth / 4
        canvas.height = video.videoHeight / 4

        // 将影片画面渲染到 Canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], "thumbnail.jpg", { type: "image/jpeg" }))
            } else {
              reject(new Error("Failed to create Blob from Canvas."))
            }
          },
          "image/jpeg",
          0.8
        )
      })
    })
  }

  const MAX_RETRIES = 3 // 最大重试次数

  async function uploadFile(event) {
    const file = event.target.files[0] // 获取选中的文件
    if (!file) {
      console.log("未选择文件")
      event.target.value = ""
      return
    } else if (file.size === 0) {
      notificationAsync.alert("文件无效，请重新选择文件", { class: "broadcast" })
      event.target.value = ""
      return
    } else if (file.size > MAX_FILE_SIZE) {
      notificationAsync.alert("文件大小超过 100MB，请选择较小的文件。", { class: "broadcast" })
      event.target.value = ""
      return
    }

    const type = file.type.startsWith("image/")
      ? MEDIA_TYPE.IMAGE
      : file.type.startsWith("audio/")
      ? MEDIA_TYPE.AUDIO
      : file.type.startsWith("video/")
      ? MEDIA_TYPE.VIDEO
      : 0

    setIsLoading(true)
    try {
      const res = await retryUpload(async () => uploadFiletoServer(file), MAX_RETRIES)
      if (res.data.Code !== 1) {
        apiNotification.alert(res.hasOwnProperty("data") ? res.data : res, { title: "提示" }, props)

        return
      }

      let _text = ""
      if (type === MEDIA_TYPE.VIDEO) {
        const thumbnailRes = await retryUpload(async () => uploadFiletoServer(await generateThumbnail(file)), MAX_RETRIES)
        if (thumbnailRes.data.Code !== 1) {
          apiNotification.alert(thumbnailRes, { title: "提示" }, props)
          return
        }
        const thumbFileName = thumbnailRes.data.Data.FileName.split("/").slice(-1)[0]
        _text = `${res.data.Data.FileName},${thumbFileName}`
      } else if (type === MEDIA_TYPE.AUDIO) {
        _text = `${res.data.Data.FileName},${event.target.recordingTime}`
      } else {
        _text = res.data.Data.FileName
      }

      sendMessage({ text: _text }, type)

      props.broadcastData?.mergeMessage([getTempMessage(_text)])
      shouldScrollToBottom.current = isScrolledToBottom(chatListRef.current, 5)
      setActionData("")
    } catch (error) {
      apiNotification.alert(error, { title: "提示" }, props)
    } finally {
      setIsLoading(false)
      event.target.value = ""
    }
  }

  // 重试逻辑函数
  async function retryUpload(uploadFunction, maxRetries) {
    let attempt = 0
    while (attempt < maxRetries) {
      try {
        return await uploadFunction() // 尝试执行上传函数
      } catch (error) {
        attempt++
        console.warn(`上传失败，正在重试 (${attempt}/${maxRetries})...`)
        if (attempt >= maxRetries) {
          console.error("达到最大重试次数，上传失败")
          throw error // 超过最大重试次数后抛出错误
        }
      }
    }
  }

  function checkIsBottom() {
    if (Math.abs(chatListRef.current?.scrollHeight - chatListRef.current?.scrollTop - chatListRef.current?.clientHeight) > 900) return
    scrollToBottom()
  }

  function startAT(fromName, isMe) {
    if (!isMe) {
      timeOutAT.current = setTimeout(() => {
        longPress(fromName)
      }, 500)
    }
  }

  function moveAT(isMe) {
    if (!isMe) {
      clearTimeout(timeOutAT.current)
    }
  }

  function endAT(isMe, UID) {
    if (!isMe) {
      clearTimeout(timeOutAT.current)
      if (timeOutAT.current != 0 && UID != 0) {
        // props.router.isLoginToOrRedirect(`/interaction/userInfoData`, { id: UID }) // TODO
      }
      timeOutAT.current = 0
    }
  }

  function onEmojiEvent(emoji) {
    if (props.emojiData?.emojiList?.some((_emoji) => _emoji === emoji)) {
      setText((e) => e + emoji)
    } else {
      setText("")
      sendMessage({ text: emoji })
      setActionData("")
    }
  }

  function scrollTopToReadMore() {
    if (!props.broadcastData?.hasData) return
    const list = chatListRef.current
    keepPosition.current = list?.scrollHeight
    loadMoreMessage()
  }

  useEffect(() => {
    if (showModal) return
    setTimeout(() => {
      setShowShare("")
    }, 1000)
  }, [showModal])

  useEffect(() => {
    if (followBetModals) return
    setTimeout(() => {
      setFollowBetData(null)
    }, 1000)
  }, [followBetModals])

  function fetchMessages(type = "replace") {
    return new Promise((resolve, reject) => {
      props.broadcastData
        ?.fetchMessageList({ ...props, storage: true, type })
        .then((res) => {
          resolve()
        })
        .catch(() => {
          util.isLoginOrNoti(props)
          reject()
        })
    })
  }

  function calculateScrollDistance(element) {
    if (!element) return 0
    const scrollTop = element.scrollTop // 当前滚动条位置
    const clientHeight = element.clientHeight // 可视区域高度
    const scrollHeight = element.scrollHeight // 内容总高度
    return scrollHeight - scrollTop - clientHeight
  }

  function setActionDataAndCalculate(key) {
    setActionData((prev) => (prev === key ? "" : key))

    scrollDistance.current = calculateScrollDistance(chatListRef.current)
  }

  function adjustChatListHeight() {
    if (!chatListRef.current) return
    if (scrollDistance.current === 0) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight
    }
    const { clientHeight, scrollHeight } = chatListRef.current
    chatListRef.current.scrollTop = scrollHeight - clientHeight - scrollDistance.current
    scrollDistance.current = 0
  }

  useEffect(() => {
    adjustChatListHeight()
  }, [actionData])

  useEffect(() => {
    if (!props.broadcastData?.hasNewMessage) return
    checkIsBottom()
  }, [props.broadcastData?.hasNewMessage])

  useLayoutEffect(() => {
    if (shouldScrollToBottom.current) {
      scrollToBottom()
      shouldScrollToBottom.current = false
    }

    if (hasScrolledToBottom.current) return
    if (messageList.length > 10 || messageList.length === 0) return
    scrollToBottom()

    if (chatListRef.current) chatListRef.current?.classList?.remove?.("hideMessages")
    hasScrolledToBottom.current = true
  }, [messageList])

  useEffect(() => {
    Bus.on("chatRoom.effectMenu", messageEffect)
    Bus.on("chatRoom.scrollByValue", scrollByValue)
    Bus.on("chatRoom.scrollToBottom", scrollToBottom)
    props.broadcastData?.setToId(props.toId)
    props.broadcastData?.setGroupId(props.groupId)

    const storageData = props.broadcastData?.getStorageData(props.groupId, props.toId)
    if (storageData?.messages?.length > 0) {
      props.broadcastData?.mergeMessage(storageData.messages)
    } else if (storageData?.messages?.length === 0) {
      chatListRef.current.classList.add("hideMessages")
      setIsLoading(true)
    }

    fetchMessages(Date.now() - storageData.time > 3 * 60 * 1000 ? "replace" : "merge").then(() => {
      setIsLoading(false)
      chatListRef.current?.classList.remove("hideMessages")
    })

    const handleVisibilityChange = _.debounce(
      () => {
        if (document.visibilityState !== "visible") return
        if (props.broadcastData.hubRef.current?.connection.state === 1) {
          console.log("still connected, state: " + props.broadcastData.hubRef.current?.connection?.state)
          return
        }
        console.log("start reconnecting")
        props.broadcastData?.reconnecting()
      },
      1000,
      { leading: true, trailing: false }
    )
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      setTimeout(() => {
        props.broadcastData?.setMessageAsReaded(props.groupId, props.toId)
      }, 200)
      props.broadcastData?.clearMessageList()
      Bus.off("chatRoom.effectMenu", messageEffect)
      Bus.off("chatRoom.scrollByValue", scrollByValue)
      Bus.off("chatRoom.scrollToBottom", scrollToBottom)
    }
  }, [])

  return {
    text,
    setText,
    quoteData,
    setQuoteData,
    actionData,
    setActionData,
    setActionDataAndCalculate,
    messageList,
    lastChatId,
    scrollToBottom,
    scrollByValue,
    reachBottom,
    sendText,
    sendingMessage,
    chatContentBoxRef,
    chatListRef,
    loadMoreMessage,
    setIsLoadMoreMessage,
    followBetData,
    setFollowBetData,
    followBetModals,
    PageIndex,
    setPageIndex,
    followBetMoney,
    setFollowBetMoney,
    loadTimer,
    scrollTimer,
    timer,
    timeOutAT,
    keepPosition,
    messageEffect,
    setFollowBetModal,
    setFollowBetModals,
    isloadMoreMessage,
    confirmFollowBet,
    menuData,
    sendMessage,
    isBottomRef,
    uploadFile,
    showShare,
    setShowShare,
    showModal,
    setShowModal,
    managerList,
    checkIsBottom,
    startAT,
    moveAT,
    endAT,
    onEmojiEvent,
    scrollTopToReadMore,
    moreFuncRef,
    roomInfo: {
      groupId,
      toId,
      title,
    },
    announce,
    showAnnounce,
    setShowAnnounce,
    hasScrolledToBottom,
    isLoading,
    setIsLoading,
    showManagerModal,
    setShowManagerModal,
    userDetailModal,
    setUserDetailModal,
    userDetailData,
    setUserDetailData,
    adjustChatListHeight,
  }
}
