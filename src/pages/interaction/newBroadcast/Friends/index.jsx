import { useState, useEffect, useCallback, useMemo } from "react"
import AddFriend from "./add"
import * as action from "@/action"
import util from "@/magic/util"
import Bus from "@/magic/EventBus"
import { notificationAsync } from "@/magic/notification"

export default ({
  text,
  setText,
  myId,
  onChat,
  passFriend,
  setPassChat,
  setSubWork,
  sendMessage,
  onAddress,
  friendList,
  onPreloadUserData,
  cacheQuery,
}) => {
  const [existFriend, setExistFriend] = useState(null)
  const [newFriend, setNewFriend] = useState(null)
  const startSearchId = useCallback(
    (value) => {
      const id = (value && typeof value === "string" ? value : text).trim()
      if (id == myId) {
        notificationAsync.alert("不能添加自己", { cancelable: true, class: "broadcast" })
        return
      }

      if (!id) {
        notificationAsync.alert("请输入ID", { cancelable: true, class: "broadcast" })
        return
      }

      action
        .get("User/GetUserData", { id })
        .then((res) => {
          if (res.Code != 1) {
            throw res.Message
            return
          }
          if (res.Data.ID === myId) {
            throw "用户不存在"
            return
          }
          if (friendList.find((friend) => friend.UID === res.Data.ID)) {
            setExistFriend(res.Data)
          } else {
            setNewFriend(res.Data)
          }
          // setText("")
          Bus.emit("broadcast.showToolBar", false)
        })
        .catch((Message) => {
          notificationAsync.alert(Message, { cancelable: true, class: "broadcast" })
        })
    },
    [text]
  )

  useEffect(() => {
    if (!text && !!existFriend) {
      setExistFriend(null)
    }
  }, [text, existFriend])

  useEffect(() => {
    if (!passFriend) return
    if (passFriend.IsExisted) {
      setTimeout(() => {
        Bus.emit("broadcast.showToolBar", false)
      }, 10)
      setNewFriend(passFriend)
      onPreloadUserData(passFriend.UID)
    } else {
      setNewFriend(passFriend)
    }
  }, [passFriend, friendList])

  useEffect(() => {
    Bus.on("inputText.enter", (value) => {
      startSearchId(value + "")
    })

    return () => {
      Bus.off("inputText.enter")
      passFriend && setPassChat(null)
    }
  }, [])

  return (
    <div className={`h-full ${existFriend ? "bg-broadcast" : ""}`}>
      {!text && <div className="bg-broadcast text-center pt-[2px] pb-[32px] text-[14px]">我的ID: {myId}</div>}

      {!!text && !existFriend && (
        <div
          onClick={startSearchId}
          className="flex items-center text-[16px] bg-white p-0.5 border-b border-gray-200 border-x-0 border-t-0 border-solid font-bold"
        >
          <div className="bg-[#07C160] p-1 rounded-sm mr-1 ml-0.5">
            <img className="mx-[2px]" src={util.buildAssetsPath("assets/icons/ic_search.svg")} />
          </div>
          搜索: <span className="text-[#06AE56] ml-0.5">{text}</span>
        </div>
      )}

      {!!existFriend && (
        <div className="bg-white mb-2">
          <div className="border-b border-solid border-gray-200 border-x-0 border-y-0 p-1 mx-1">联络人</div>
          <div
            onClick={() => {
              setNewFriend(existFriend)
            }}
            className="flex items-center p-1"
          >
            <img className="w-4 mr-1" src={existFriend.Avatar} />
            <div className="text-[16px]">{existFriend.NickName}</div>
          </div>
        </div>
      )}

      {!!newFriend && (
        <div className="fixed inset-0 w-full max-w-[600px] left-1/2 -translate-x-1/2">
          <AddFriend
            ID={passFriend?.UID}
            {...Object.assign(newFriend, passFriend ? passFriend : {})}
            onChat={onChat}
            onBack={() => {
              setNewFriend(null)
              setExistFriend(null)
            }}
            onSetSubWork={(subWork) => {
              setSubWork(subWork)
            }}
            onUpdatedData={(data) => {
              setPassChat((prev) => ({ ...prev, ...data }))
            }}
            sendMessage={sendMessage}
            onAddress={onAddress}
            friendList={friendList}
            cacheQuery={cacheQuery}
          />
        </div>
      )}
    </div>
  )
}
