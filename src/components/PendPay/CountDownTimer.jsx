import classNames from "classnames"
import util from "@/magic/util"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"

export default ({ counterKey, targetTime }) => {
  const [hours, setHours] = useState("00")
  const [minutes, setMinutes] = useState("00")
  const [seconds, setSeconds] = useState("00")
  const [timesup, setTimesup] = useState(false)

  useEffect(() => {
    const CACHE_KEY = "countdown"
    const countdown = util.cache.get(CACHE_KEY) ?? {}
    if (typeof countdown[counterKey] == "undefined" || countdown[counterKey] !== targetTime) {
      countdown[counterKey] = countdown[counterKey] || targetTime
      util.cache.set(CACHE_KEY, countdown)
    }
    const expireTime = dayjs(countdown[counterKey])
    const now = dayjs()

    setTimesup(!now.isBefore(expireTime))
    const timer = now.isBefore(expireTime)
      ? setInterval(() => {
          const diffSeconds = expireTime.diff(dayjs(), "seconds")
          setHours(
            Math.floor(diffSeconds / 3660)
              .toString()
              .padStart(2, "0")
          )
          setMinutes(
            Math.floor(diffSeconds / 60)
              .toString()
              .padStart(2, "0")
          )
          setSeconds((diffSeconds % 60).toString().padStart(2, "0"))
          if (diffSeconds <= 0) {
            clearInterval(timer)
            setTimesup(true)
            setHours("00")
            setSeconds("00")
            setSeconds("00")
          }
        }, 1000)
      : null

    return () => {
      timer && clearInterval(timer)
    }
  }, [])
  const text = !timesup ? "取消倒计时" : "订单已过期，请重新下单"
  const timesupTextCss = { "text-[#E14138] font-bold": !timesup, "text-gray-400": timesup }
  const timesupBgCss = { "bg-[#E14138]": !timesup, "bg-[#D3D3D3]": timesup }
  return (
    <div className="countdown-box bg-theme-half relative flex justify-center w-full">
      <div className="bg-white w-full mx-1 py-0.75 flex justify-center items-center rounded text-1.25">
        <span className={classNames("mr-1", timesupTextCss)}>{text}</span>
        <span className={classNames("p-0.5 mr-0.5 rounded-sm text-white", timesupBgCss)}>{hours}</span>
        <span className={classNames("mr-0.5", timesupTextCss)}>:</span>
        <span className={classNames("p-0.5 mr-0.5 rounded-sm text-white", timesupBgCss)}>{minutes}</span>
        <span className={classNames("mr-0.5", timesupTextCss)}>:</span>
        <span className={classNames("p-0.5 rounded-sm text-white", timesupBgCss)}>{seconds}</span>
      </div>
    </div>
  )
}
