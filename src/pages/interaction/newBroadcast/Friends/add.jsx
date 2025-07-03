import BackArrow from "@/assets/icons/ic_back_btn.svg"
import { useState, useEffect, useMemo } from "react"
import { acceptFriendRequest } from "@/action/apis"
import { preloadMessageList } from "@/contexts/BroadcastContext/MessageManager"
import * as action from "@/action"
import util from "@/magic/util"
import MemberData from "./MemberData"
import FriendRecords from "./records"
import Bus from "@/magic/EventBus"
import { withRouter } from "@/magic/withRouter"
import { notificationAsync } from "@/magic/notification"

const FriendData = withRouter(
  ({
    Avatar,
    NickName,
    ID,
    onClick,
    isExistFriend = false,
    onBetRecord,
    Status,
    Note,
    AddTime,
    IsExisted,
    isAsking,
    RID,
    IsGroup,
    router,
    cacheQuery,
    ...props
  }) => (
    <>
      <div className="px-1.5 bg-white">
        <MemberData iconSize="w-[62px]" Avatar={Avatar} NickName={NickName} ID={ID} />
        {Note && <div className="text-[16px] bg-[#F7F7F7] text-[#737373] p-1.5 rounded-sm mt-1 border border-[#eee] border-solid">{Note}</div>}

        <div
          onClick={() => {
            router.isLoginToOrRedirect(`/interaction/userBetInfo`, {
              ID,
              Name: NickName,
              Avatar,
              NickName,
              AddTime,
              IsExisted,
              RID,
              Note,
              isAsking,
              IsGroup,
              ...cacheQuery,
            })
          }}
          className="text-[16px] text-black py-1.5 font-[500] flex justify-between items-center"
        >
          下注记录
          <img className="mx-[2px]" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
        </div>
      </div>

      <div onClick={onClick} className="text-center p-1.5  mt-[8px] bg-white text-[#576B95] text-[16px] font-bold">
        {isExistFriend ? (
          <div className="flex items-center justify-center">
            <img className="mr-0.25" src={util.buildAssetsPath("assets/icons/ic_dialog.svg")} />
            发消息
          </div>
        ) : Status === 0 && isAsking ? (
          <div className="text-[#B2B2B2]">等待对方验证</div>
        ) : Status === 0 && !isAsking ? (
          <div className="text-[#576B95]">前往验证</div>
        ) : (
          "添加到通讯录"
        )}
      </div>
    </>
  )
)

const AcceptFriendRequest = ({ NickName, RID, ID, callback, sendMessage, Note }) => {
  function onAcceptFriendRequest() {
    acceptFriendRequest(RID)
      .then((res) => {
        if (res.Code !== 1) {
          throw res.Message
        }
        // sendMessage({ text: Note }, ID)
        notificationAsync.alert(res.Message).then(callback)
      })
      .catch((err) => {
        notificationAsync.alert(err).then(callback)
      })
  }
  return (
    <div className="p-2">
      <div className="text-[#737373] text-[14px] px-0.5">好友昵称</div>
      <div className="text-[#ACACAC] text-[16px] bg-[#F7F7F7] px-1 py-1.5 rounded-[5px] mt-0.5 mb-2">{NickName}</div>
      <button onClick={onAcceptFriendRequest} className="text-white bg-[#07C160] rounded-[5px] py-1 px-5 border-0 table mx-auto text-[16px]">
        完成
      </button>
    </div>
  )
}

const SendingInputs = ({ NickName, ID, onClose }) => {
  const userName = util.cache.get("user")?.NickName || "游客"
  const [note, setNote] = useState("我是" + userName)
  const sendingMessage = async () => {
    let res = await action.post("User/AddFriend", { uid: ID, note })

    if (res.Code != 1) {
      notificationAsync.alert(res.Message, { class: "broadcast" })
    } else {
      notificationAsync.alert(res.Message, {
        title: "已发送请求",
        class: "broadcast",
        callback: () => {
          onClose()
        },
      })
    }
  }

  return (
    <>
      <div className="pt-[14px] px-[30px] bg-white h-full">
        <div className="pl-1 py-0.5 text-[14px] text-[#737373] font-[400]">传送新增好友邀请</div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="p-1.5 w-full box-border bg-[#F7F7F7] text-[16px] rounded-sm border-0"
        />
        <div className="h-1" />
        <div className="pl-1 py-0.5 text-[14px] text-[#737373] font-[400]">好友昵称</div>
        <input value={NickName} disabled className="p-1.5 w-full box-border bg-[#F7F7F7] text-[#ACACAC] text-[16px] rounded-sm border-0" />
        <div onClick={sendingMessage} className="bg-[#07C160] text-white rounded-sm w-14 mt-2 text-center py-[12px] mx-auto text-[16px] font-[500]">
          传送
        </div>
      </div>
    </>
  )
}

export default (props) => {
  const AddFriend = {
    SENDING: 0,
    RECORDS: 1,
    FRIEND: 2,
    ACCEPT: 3,
  }

  const [displayMode, setDisplayMode] = useState(AddFriend.FRIEND)
  const isExistFriend = useMemo(() => {
    return props.friendList?.find((friend) => friend.UID === props.ID)
  }, [props.friendList])

  useEffect(() => {
    if (!isExistFriend) return
    preloadMessageList(0, props.ID)
  }, [isExistFriend])

  return (
    <div className={`h-full w-full overscroll-y-auto ${displayMode === AddFriend.ACCEPT ? "bg-white" : "bg-broadcast"}`}>
      <div className="flex items-center px-0.5 bg-white h-[44px]">
        <BackArrow
          className="translate-x-[6px] translate-y-[3px]"
          onClick={() => {
            if (displayMode === AddFriend.RECORDS || displayMode === AddFriend.SENDING) {
              setDisplayMode(AddFriend.FRIEND)
              return
            }

            if (displayMode === AddFriend.ACCEPT) {
              setDisplayMode(AddFriend.FRIEND)
              return
            }

            if (displayMode === AddFriend.FRIEND) {
              props.onAddress(isExistFriend ? "" : "newFriend")
              Bus.emit("broadcast.showToolBar", true)
              return
            }
            Bus.emit("broadcast.showToolBar", true)
            props.onAddress()

            // props.onSetSubWork("")
            // props.onBack?.()
          }}
        />
        <div className="flex-1 text-center text-[16px] font-[500]">
          {displayMode === AddFriend.RECORDS
            ? "玩家资料"
            : displayMode === AddFriend.SENDING
            ? "新增朋友"
            : displayMode === AddFriend.ACCEPT
            ? "通过朋友验证"
            : ""}
        </div>
        <div className="w-2" />
      </div>

      {displayMode === AddFriend.FRIEND && (
        <FriendData
          isExistFriend={isExistFriend}
          onClick={() => {
            if (isExistFriend) {
              // console.log("isExistFriend", isExistFriend)
              props.onChat?.(props.ID, props.NickName)
              return
            }
            if (props.isAsking && props.Status !== 3) return
            if (props.Status === 0 && (!props.isAsking || props.Status === 3)) {
              props.onSetSubWork("accept")
              setDisplayMode(AddFriend.ACCEPT)
              return
            }
            setDisplayMode(AddFriend.SENDING)
          }}
          {...props}
        />
      )}

      {displayMode === AddFriend.SENDING && (
        <SendingInputs
          {...props}
          onClose={() => {
            setDisplayMode(AddFriend.FRIEND)
            props.onBack()
          }}
        />
      )}

      {displayMode === AddFriend.ACCEPT && (
        <AcceptFriendRequest
          {...props}
          callback={async () => {
            Bus.emit("broadcast.updateFriendList")
            setDisplayMode(AddFriend.FRIEND)
          }}
        />
      )}

      {displayMode === AddFriend.RECORDS && (
        <FriendRecords
          onInvite={() => {
            setDisplayMode(AddFriend.SENDING)
          }}
          isExistFriend={isExistFriend}
          {...props}
        />
      )}
    </div>
  )
}
