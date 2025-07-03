import SwiperItem from "./SwiperItem"
import AvatarIcon from "@/components/AvatarIcon"
import util from "@/magic/util"
import Badge from "@/components/Badge"
import MessageTime from "@/components/BroadcastWork/MessageTime.tsx"
import { useState, useMemo } from "react"
import { managerSrc } from "@/components/BroadcastWork/constants.ts"

export default ({ chatGroups, onSelect, onDelete, onPinned, isSplit, onReaded, emojiList, updateTime }) => {
  const userName = util.getUserData("NickName")
  const [openIndex, setOpenIndex] = useState(null)
  const getLastContent = (Content) => {
    if (!Content) return ""
    const [content, subContent] = Content.split(",")
    const imageRegex = /\.(jpg|jpeg|png|gif)$/i
    const audioRegex = /\.(wav|mp3|ogg)$/i
    // 判断内容是否以图片格式结尾
    if (imageRegex.test(content)) {
      // return <img src={content} className="h-1" />
      return "分享图片"
    } else if (audioRegex.test(content)) {
      return (
        <div className="flex items-center">
          <img className="rotate-180" src={util.buildAssetsPath("assets/icons/audio-play.svg")} />
          <div className="mx-1">{subContent}”</div>
          <div className="w-5" />
        </div>
      )
    } else if (content.indexOf("interaction/getRedPacket") !== -1) {
      return <span className="font-bold text-red-500">🧧您的专属红包尚未领取🧧</span>
    } else if (Content.includes("{") && Content.includes("fromName") && Content.includes("content") && Content.includes("time")) {
      return Content.slice(Content.indexOf("}") + 1)
    } else if (Content.includes("{") && Content.includes("GameTitle") && Content.includes("}")) {
      const gameData = JSON.parse(Content)
      const { GameTitle, GameID, BetName, BetText, BetMoney, Win } = gameData
      return `【${GameTitle}】 第${GameID}期: ${BetName} (${BetText.split("|")
        .filter((v) => !!v)
        .join(",")})${Win > BetMoney ? "已中奖" : ""},${BetMoney}元`
    } else if (Content.includes("{") && Content.includes("BetMoney") && Content.includes("}")) {
      const historyData = JSON.parse(Content)
      const { BetMoney, EndDay, StartDay, WinMoney, ProfitLoss } = historyData
      return `[${StartDay}] - [${EndDay}]下注:${BetMoney}元，中奖:${WinMoney}元，盈亏:${ProfitLoss}元`
    } else if (Content.includes("@") && Content.includes(userName)) {
      return Content.replace(userName, "我")
    } else if (Content.includes("(strong)")) {
      let rebuildMsg = Content.replace(/\(strong\)(.*?)\(\/strong\)/g, "$1")
      rebuildMsg = rebuildMsg.replace(/\(span=gbzy\)(.*?)\(\/span\)/g, "$1")
      return <span dangerouslySetInnerHTML={{ __html: rebuildMsg }}></span>
    } else if (emojiList?.some((emoji) => emoji.Code === Content)) {
      const emojiData = emojiList?.find((emoji) => emoji.Code === Content)
      return <img src={emojiData.ImagePath} className="h-full object-contain" />
      return Content
    } else {
      return Content
    }
  }

  const getSwiperItem = (className, room, _index) => {
    const Avatar = room.IsGroup ? managerSrc : room.Avatar
    return (
      <SwiperItem
        isPinned={room.IsPinned}
        key={(room.UID || room.GroupID) + "_" + room.Title + _index}
        onToggle={() => setOpenIndex(openIndex === _index ? null : _index)}
        isOpen={openIndex === _index} // 判断是否是当前打开的 SwiperItem
        onClick={() => {
          onSelect(room)
        }}
        onDelete={() => {
          onDelete(room)
        }}
        onPinned={() => {
          onPinned(room)
        }}
        onReaded={() => {
          onReaded(room)
        }}
      >
        <div
          key={(room.IsGroup ? "group_" : "private_") + (room.UID || room.GroupID)}
          className={`py-1 border-b-0 border-x-0 border-solid flex border-gray-200 ${room.IsPinned ? "bg-broadcast" : ""} ${className} ${
            _index === 0 ? "border-t-0" : " border-t"
          }`}
        >
          <Badge count={room.IsReaded ? 0 : room.UnreadCount} className="rounded-full">
            <AvatarIcon className="w-3.5 h-3.5 rounded-[5px]" src={Avatar} />
          </Badge>
          <div className="ml-1 flex-1 w-full">
            <div className="flex justify-between">
              <div className="text-[16px] leading-tight">{room.Title}</div>
              <div className="text-gray-400">
                <MessageTime value={room.LastTime} updateTime={room.TimeStamp || updateTime} />
              </div>
            </div>
            <div className="w-full h-2 relative">
              <div className="text-gray-400 truncate absolute left-0 right-0 bottom-0 top-0.5 leading-none text-[13px]">
                {getLastContent(room.Content)}
              </div>
            </div>
          </div>
        </div>
      </SwiperItem>
    )
  }

  const publicGroups = useMemo(() => (isSplit ? chatGroups.filter((group) => group.IsGroup) : []), [chatGroups])
  const privateGroups = useMemo(() => (isSplit ? chatGroups.filter((group) => !group.IsGroup) : []), [chatGroups])

  if (!isSplit) {
    return chatGroups.map(getSwiperItem.bind(null, "p-1"))
  }

  return (
    <>
      {privateGroups.length > 0 && (
        <div className="bg-white mb-[8px] px-1">
          <div className="border-b border-solid border-gray-200 border-x-0 border-y-0 py-1 text-[14px] text-[#737373]">联络人</div>
          {privateGroups.map(getSwiperItem.bind(null, ""))}
        </div>
      )}

      {publicGroups.length > 0 && (
        <div className="bg-white px-1">
          <div className="border-b border-solid border-gray-200 border-x-0 border-y-0 py-1 text-[14px] text-[#737373]">群组</div>
          {publicGroups.map(getSwiperItem.bind(null, ""))}
        </div>
      )}
    </>
  )
}
