import FriendItem from "./FriendItem"
import util from "@/magic/util"

export default ({ groups, onChat }) => {
  return (
    <>
      {groups.map((group) => (
        <FriendItem
          onClick={onChat.bind(null, {
            IsGroup: true,
            GroupID: group.ID,
            Title: group.NickName,
            Avatar: group.Avatar,
          })}
          {...group}
        ></FriendItem>
      ))}
      <div className="mt-2 text-center text-[16px] text-[#808080]">{groups.length}个群组</div>
    </>
  )
}
