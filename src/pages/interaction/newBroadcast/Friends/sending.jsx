import { useState } from "react"
import * as action from "@/action"
import util from "@/magic/util"
import { notificationAsync } from "@/magic/notification"

export default ({ NickName, ID, onClose }) => {
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
      <div className="px-1.5 bg-white h-full">
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
