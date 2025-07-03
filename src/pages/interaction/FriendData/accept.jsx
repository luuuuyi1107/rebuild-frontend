import { acceptFriendRequest } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"

export default ({ NickName, RID, callback }) => {
  function onAcceptFriendRequest() {
    acceptFriendRequest(RID)
      .then((res) => {
        if (res.Code !== 1) {
          throw res.Message
        }
        notificationAsync.alert(res.Message, {}).then(callback)
      })
      .catch((err) => {
        notificationAsync.alert(err, {})
      })
  }
  return (
    <div className="p-2 bg-white min-h-svh">
      <div className="text-[#737373] text-[14px] px-0.5">好友昵称</div>
      <div className="text-[#ACACAC] text-[16px] bg-[#F7F7F7] px-1 py-1.5 rounded-[5px] mt-0.5 mb-2">{NickName}</div>
      <button onClick={onAcceptFriendRequest} className="text-white bg-[#07C160] rounded-[5px] py-1 px-5 border-0 table mx-auto text-[16px]">
        完成
      </button>
    </div>
  )
}
