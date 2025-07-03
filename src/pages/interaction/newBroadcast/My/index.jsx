import util from "@/magic/util"
import Personal from "./Personal"
import Headshots from "./Headshots"
import Modify from "./Modify"
import Bus from "@/magic/EventBus"
import { changeNickName, setAvatar } from "@/action/apis"
import { useEffect } from "react"
import { notificationAsync } from "@/magic/notification"

export default ({ subWork, setSubWork }) => {
  useEffect(() => {
    if (subWork == "" || subWork === ("personal" || "headshots")) {
      Bus.emit("broadcast.showToolBar", true)
    } else if (subWork === "nickname") {
      Bus.emit("broadcast.showToolBar", false)
    }
  }, [subWork])

  const userInfo = util.cache.get("user")
  if (!userInfo) return null
  const onChangeNickName = (nickName) => {
    changeNickName(nickName)
      .then((res) => {
        notificationAsync.alert(res.Message).then(() => {
          util.cache.set("user", { ...userInfo, NickName: nickName })
          setSubWork("personal")
        })
      })
      .catch((err) => {
        notificationAsync.alert(err.message)
      })
  }

  const changeHeadShot = (data) => {
    setAvatar(data).then((res) => {
      notificationAsync.alert(res.Message).then(() => {
        util.cache.set("user", { ...userInfo, Avatar: data })
        setSubWork("personal")
      })
    })
  }

  return (
    <div className="h-full bg-broadcast">
      {!subWork && <Personal userInfo={userInfo} onClick={setSubWork} />}
      {subWork === "personal" && <Personal userInfo={userInfo} onClick={setSubWork} />}
      {subWork === "nickname" && <Modify text={userInfo.NickName} onClick={setSubWork} onChange={onChangeNickName} />}
      {subWork === "headshots" && <Headshots onChange={changeHeadShot} current={userInfo?.Avatar.FilePath} onClick={setSubWork} />}
    </div>
  )
}
