import { getUserDataById } from "@/action/apis"
import { useState, useEffect } from "react"
import MemberData from "./MemberData"

export default (props) => {
  const [betCount, setBetCount] = useState(props.BetCount || [])
  const [NickName, setNickName] = useState(props.NickName || "")
  const [Avatar, setAvatar] = useState(props.Avatar || "")
  useEffect(() => {
    if (betCount.length > 0) return

    const cachedUserData = util.cache.get(`UserRecordData_${props.ID}`)
    if (cachedUserData) {
      setBetCount(cachedUserData.Data.BetCount)
      !NickName && setNickName(cachedUserData.Data.NickName)
      !Avatar && setAvatar(cachedUserData.Data.Avatar)
      if (Date.now() - cachedUserData.Time < 1000 * 60 * 5) {
        return
      }
    }

    getUserDataById(props.ID).then((res) => {
      if (res.Code !== 1) return
      setBetCount(res.Data.BetCount)
      !NickName && setNickName(res.Data.NickName)
      !Avatar && setAvatar(res.Data.Avatar)
    })
  }, [])

  return (
    <div className="px-1.5 bg-white h-[calc(100svh-44px)] overflow-y-auto">
      <div className="flex items-center">
        {Avatar && NickName && (
          <MemberData
            className="flex-1"
            iconSize="w-4"
            titleSize="text-[16px]"
            idSize="text-[14px]"
            Avatar={Avatar}
            NickName={NickName}
            ID={props.ID}
            hideBorder
          />
        )}
        {props.isExistFriend ? (
          <div className="text-[14px] rounded-sm text-gray-400 bg-gray-200  font-[500] py-0.5 px-[11px]">已是好友</div>
        ) : (
          <div
            onClick={() => props.onInvite({ NickName, ID: props.ID, Avatar })}
            className="text-[14px] rounded-sm text-white bg-[#07C160]  font-[500] px-[10px] py-[6px] active:opacity-80"
          >
            添加好友
          </div>
        )}
      </div>

      <div className="border-t border-x-0 border-b-0 border-solid border-gray-200 text-center">
        <div className="text-[14px] text-[#737373] py-0.75">近期战报</div>
      </div>
      <div className="border-solid border-r-0 border-b-0 border-l border-t border-gray-200 text-center text-[14px] mb-2">
        <div className="grid grid-cols-[3fr_2fr] font-[500]">
          <div className="border-solid border-t-0 border-l-0 border-r border-b border-gray-300 p-0.5">游戏名称</div>
          <div className="border-solid border-t-0 border-l-0 border-r border-b border-gray-300 p-0.5">投注数量</div>
        </div>
        {betCount.map((bet) => (
          <div className="grid grid-cols-[3fr_2fr] bg-[#F6F6F6] odd:bg-white" key={bet.LotteryID}>
            <div
              onClick={() => {
                props.onRecord?.(bet)
              }}
              className="border-solid border-t-0 border-l-0 border-r border-b border-gray-300 p-0.5"
            >
              {bet.Name}
            </div>
            <div className="border-solid border-t-0 border-l-0 border-r border-b border-gray-300 p-0.5">{bet.Num}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
