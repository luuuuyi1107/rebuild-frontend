import MemberData from "./MemberData"

export default ({ Status, onBetInfo, isAsking, onFriendEvent, NickName, ID, Avatar, isExistFriend, Note }) => {
  return (
    <>
      <div className="px-1.5 bg-white">
        <MemberData iconSize="w-[62px]" Avatar={Avatar} NickName={NickName} ID={ID} />
        {Note && (
          <div className="text-[14px] bg-[#F7F7F7] text-[#737373] p-[15px] rounded-sm mt-0 mb-[24px] border border-[#eee] border-solid">{Note}</div>
        )}
        <div
          onClick={onBetInfo}
          className="text-[16px] text-black py-[14px] mt-[14px] flex justify-between items-center border-b-0 border-solid border-[#E5E5E5] border-x-0 border-t-[0.5px] font-[400]"
        >
          下注记录
          <img className="mx-[2px]" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
        </div>
      </div>

      <div onClick={onFriendEvent} className="text-center p-[14.5px] mt-[8px] bg-white text-[#576B95] text-[16px] font-[500]">
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
}
