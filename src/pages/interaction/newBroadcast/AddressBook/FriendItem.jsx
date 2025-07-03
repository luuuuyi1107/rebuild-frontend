import AvatarIcon from "@/components/AvatarIcon"
export default ({ UID, Avatar, NickName, onClick, children, SubContent }) => (
  <div key={UID} onClick={onClick} className="border-b-[0.5px] border-[#E5E5E5] border-t-0 border-x-0 border-solid  py-1 px-0 flex items-center">
    <AvatarIcon className="w-[38px] h-[38px] mr-1 rounded-[5px]" src={Avatar} />
    <div className="text-[16px]">
      <div>{NickName}</div>
      {SubContent && <div className="text-[14px] text-[#808080]">{SubContent}</div>}
    </div>
    {children}
  </div>
)
