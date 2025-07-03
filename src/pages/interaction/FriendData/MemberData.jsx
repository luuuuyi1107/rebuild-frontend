import util from "@/magic/util"
import AvatarIcon from "@/components/AvatarIcon"
export default ({
  Avatar,
  NickName,
  ID,
  hideBorder = false,
  onClick,
  iconSize = "w-6",
  titleSize = "text-[22px]",
  idSize = "text-[16px]",
  className = "",
}) => (
  <div onClick={onClick} className={`flex items-center pb-1.5 pt-2 ${className}`}>
    <AvatarIcon className={`${iconSize} mr-[10px] rounded-[8px]`} src={Avatar} />
    {/* <img className={`${iconSize} mr-1.5`} src={Avatar} /> */}
    <div className="flex-1">
      <div className={`${titleSize} font-[500] leading-snug text-left`}>{NickName}</div>
      <div className={`${idSize} text-gray-500 leading-snug flex`}>
        <span>ID: {ID}</span>
        {onClick && <img className="ml-auto" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />}
      </div>
    </div>
  </div>
)
