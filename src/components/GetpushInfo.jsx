import Bus from "@/magic/EventBus"

import { useState } from "react"
export default () => {
  const [userData, setUserData] = useState({})
  const [serverTime, setServerTime] = useState("")
  const [pushCount, setPushCount] = useState(0)
  Bus.on("getPush.trigger", (data) => {
    setUserData(data.UserData)
    setServerTime(util.date.format(util.date.toDate(data.ServerTime), "HH:mm:ss"))
    setPushCount(pushCount + 1)
  })
  return (
    <div className="fixed left-1/2 z-50 -translate-x-1/2 bottom-3.5 bg-black/80 text-white w-full max-w-[600px]">
      測試:
      {userData && (
        <>
          count: {pushCount}, name: {userData.NickName}, money: {userData.Money}, serverTime: {serverTime}, UpTime:{" "}
          {userData?.UpTime !== undefined ? util.date.format(util.date.toDate(userData.UpTime), "HH:mm:ss") : ""}
        </>
      )}
    </div>
  )
}
