import { getPinnedChats, postPinnedChats, leaveGroup, removeChat, deleteFriend } from "@/action/apis"
import { useEffect, useState, useMemo, useRef } from "react"
import { Switch } from "react-onsenui"

import AvatarIcon from "@/components/AvatarIcon"
import SimpleLayout from "@/components/SimpleLayout"
import util from "@/magic/util"
import ModalPage from "@/components/ModalPage"
import { notificationAsync } from "@/magic/notification"

export default (props) => {
  const groupImgs = [
    ...new Array(6).fill(1).map((value, index) => `girl0${index + 1}`),
    ...new Array(4).fill(1).map((value, index) => `boy0${index + 1}`),
  ].map((img) => `https://76shangchuan.com/touxiang/${img}.png`)
  const storedPinnedChats = util.cache.get("pinnedChats", "session")
  const [managers, setManagers] = useState([])
  const [pinned, setPinned] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [isRemove, setIsRemove] = useState(true)
  const pinnedChatsRef = useRef(storedPinnedChats?.data ?? [])
  const [isAddressed, setIsAddressed] = useState(true)
  const [showAnnounce, setShowAnnounce] = useState(false)
  const groupId = +(props.roomData?.groupId || "0")
  const toId = +(props.roomData?.toId || "0")
  const isGroup = toId === 0
  const groupName = props.roomData?.title || "群组"
  const announce = props.roomData?.announce ?? { text: "", time: "" }
  const managerList = props.roomData?.managerList ?? []
  useEffect(() => {
    const unbookedList = util.cache.get("unbooked")
    if (unbookedList && unbookedList.includes(groupId)) {
      setIsAddressed(false)
    }
    if (storedPinnedChats?.timestamp && Date.now() - storedPinnedChats.timestamp < 1000 * 60 * 3) return
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
      // setPinnedChats(_list)
      pinnedChatsRef.current = _list
      const roomId = isGroup ? groupId : +(util.getUrlParam("toId") || "0")
      if (!_list.some(({ id, type }) => roomId === id && (isGroup ? 1 : 0) === type)) {
        setPinned(false)
      } else {
        setPinned(true)
      }
    })
  }, [])

  function onPinned() {
    const id = isGroup ? groupId : toId
    const type = isGroup ? 1 : 0
    setPinned((prev) => {
      const _pinnedChats = (!prev ? [{ id, type }] : []).concat(pinnedChatsRef.current.filter((chat) => !(chat.id === id && chat.type === type)))
      postPinnedChats(_pinnedChats.map(({ id, type }) => `${id}|${type}`).join(","))
      util.cache.set("pinnedChats", { data: _pinnedChats, timestamp: Date.now() }, "session")
      return !prev
    })
  }

  async function deleteRoom() {
    const index = +(props.roomData?.chatId || 0)
    try {
      await Promise.all([deleteFriend(toId), removeChat(groupId, toId, index)])
      setShowModal(false)
      setShowResultModal(true)
      setTimeout(() => {
        setShowResultModal(false)
        props.onPageBack?.()
        props.onRemovePrivateById(toId)
      }, 1200)
    } catch (error) {
      console.error(error)
    }
  }

  async function onLeaveGroup() {
    try {
      const index = +(props.roomData?.chatId || 0)
      const res = await leaveGroup(groupId, isRemove ? 1 : 0, index)
      if (res.Code !== 1) {
        throw res.Message
      }
      setShowModal(false)
      setShowResultModal(true)
      setTimeout(() => {
        setShowResultModal(false)
        props.onPageBack?.()
        props.onRemoveGroupById(groupId)
      }, 1200)
    } catch (error) {
      console.log(error)
    }
  }

  function showRemoveDialog() {
    if (isGroup && groupId === 0) {
      notificationAsync.alert("网站广播禁止退出群组", { title: "操作提示", class: "broadcast" })
      return
    }
    setShowModal(true)
  }

  return (
    <>
      <ModalPage className="bg-white flex flex-col text-black" isOpen={props.isOpen} animation="lift" timeout={0}>
        <SimpleLayout
          headerClassName="bg-[#EDEDEC] h-[44px] px-[15px] -translate-y-[1px]"
          className="bg-[#EDEDED] h-svh"
          center={managerList?.length > 0 ? `聊天资讯(${managerList?.length})` : "聊天资讯"}
          onBack={() => {
            props.onClose?.()
          }}
        >
          {isGroup && (
            <>
              {managerList.length > 0 && (
                <div className="bg-white p-[16px] grid grid-cols-5 gap-2">
                  {managerList.map((manager) => (
                    <div className="w-[48px] sm:w-full" key={manager.UID}>
                      <AvatarIcon className="rounded-[8px]" src={groupImgs[manager.UID % 10]} />
                      <div className="text-center text-[10px] text-[#737373] py-0.5">{manager.NickName}</div>
                    </div>
                  ))}
                </div>
              )}

              {isGroup && (
                <div className={`bg-white mt-[8px] p-[15px] text-[16px] text-[#737373] ${!announce ? "" : "flex justify-between items-center"}`}>
                  <div className="flex-1">
                    <div className="font-[400] text-black text-left">群组公告</div>
                    {!!announce.text && (
                      <>
                        <div onClick={() => setShowAnnounce(true)} className="flex items-start mt-[4px]">
                          <div className="flex-1 h-2 relative">
                            <div className="inset-0 truncate absolute">{announce?.text}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <img className="ml-1 mt-0.25 h-[18px]" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
                  {!announce && (
                    <div className="flex items-center">
                      未设定
                      <img className="ml-1 h-[18px]" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className={`bg-white p-1.25 ${isGroup ? "mt-[8px]" : ""} text-[16px]`}>
            <div className="flex justify-between items-center">
              对话置顶
              <Switch
                className="custom-switch"
                checked={pinned}
                onClick={() => {
                  onPinned()
                }}
              />
            </div>

            {isGroup && (
              <>
                <div className="border-t border-b-0 border-x-0 border-gray-100 border-solid my-1.25" />
                <div className="flex justify-between items-center mt-1">
                  储存至通讯录
                  <Switch
                    checked={isAddressed}
                    onClick={() => {
                      setIsAddressed((prev) => {
                        let unbookedList = util.cache.get("unbooked") || []
                        if (prev) {
                          unbookedList.push(groupId)
                        } else {
                          unbookedList = unbookedList.filter((id) => id !== groupId)
                        }
                        util.cache.set("unbooked", unbookedList)
                        return !prev
                      })
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div onClick={showRemoveDialog} className="bg-white p-1.5 mt-[8px] text-[16px] text-[#F35543] text-center active:opacity-80">
            {isGroup ? "退出群组" : "删除好友"}
          </div>
        </SimpleLayout>
      </ModalPage>

      <ModalPage isOpen={showModal} onClose={() => setShowModal(false)}>
        {isGroup && (
          <div className="h-svh flex flex-col justify-end text-black text-[16px]">
            <div className="rounded-t-[20px] bg-white p-[50px] pt-[40px]">
              <div className="text-center font-[500] mb-[92px]">即将退出群组「{groupName}」</div>
              <div className="flex items-center justify-center font-[400]" onClick={() => setIsRemove((prev) => !prev)}>
                {/* <div className="mr-0.5">
                  {isRemove ? (
                    <img className="w-[20px] h-[20px] block" src={util.buildAssetsPath("/assets/icons/circle-ticks.svg")} />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border border-solid border-[#B2B2B2]"></div>
                  )}
                </div> */}
                退出并清除纪录
              </div>
              <div className="flex items-center justify-center mt-2 font-[500]">
                <div onClick={() => setShowModal(false)} className="rounded-[8px] w-10 py-1 bg-[#f2f2f2]">
                  取消
                </div>
                <div className="w-1" />
                <div onClick={onLeaveGroup} className="rounded-[8px] w-10 py-1 bg-[#FA5151] text-white">
                  退出
                </div>
              </div>
            </div>
          </div>
        )}
        {managerList.length === 0 && !isGroup && (
          <div className="h-svh flex flex-col justify-end text-black text-[16px]">
            <div className="rounded-t-[12px] bg-white">
              <div className="flex flex-col items-center justify-center font-[400]">
                <div onClick={deleteRoom} className="h-[52px] flex items-center justify-center text-[#FA5151] w-full">
                  删除好友
                </div>
                <div className="w-full h-[8px] bg-[#f7f7f7]"></div>
                <div onClick={() => setShowModal(false)} className="rounded-[8px] h-[52px] flex items-center justify-center w-full">
                  取消
                </div>
                <div className="w-1" />
              </div>
            </div>
          </div>
        )}
      </ModalPage>

      <ModalPage isOpen={showResultModal} animation="lift">
        <div className="bg-black/70 rounded w-9 h-9 text-[14px] flex justify-center items-center absolute left-1/2 top-1/2  -translate-x-1/2 -translate-y-1/2">
          <div className="text-center">
            <img className="block mx-auto mb-1 brightness-200 grayscale" src={util.buildAssetsPath("assets/icons/ic-tick.svg")} />已
            {managerList?.length === 0 ? "删除好友" : "退出群组"}
          </div>
        </div>
      </ModalPage>

      <ModalPage className="bg-white flex flex-col text-black" isOpen={showAnnounce} animation="lift">
        <SimpleLayout
          headerClassName="bg-broadcast"
          className="bg-white"
          center="群组公告"
          onBack={() => {
            setShowAnnounce(false)
          }}
        >
          <div className="p-2 text-left">
            <div className="flex items-center mb-1 border-b border-b-[#f6f6f6] border-solid border-x-0 border-t-0 pb-1">
              <AvatarIcon
                color="#FF8F8F"
                className="rounded-[5px] w-[46px] h-[46px] mr-1 font-[400]"
                src={util.buildAssetsPath("/images/HttpChatPage/service.png")}
              />
              <div className="flex-1 text-[14px]">
                <div className="text-[#E10004]">管理员</div>
                <div className="text-[#737373]">{announce?.time}</div>
              </div>
            </div>
            <div className="text-[16px] whitespace-pre-wrap">{announce?.text}</div>
          </div>
        </SimpleLayout>
      </ModalPage>
    </>
  )
}
