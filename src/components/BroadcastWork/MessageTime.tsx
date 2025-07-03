import { useState, useEffect, useRef, useMemo } from "react"
import dayjs from "dayjs"

interface MessageTimeProps {
  value: string
  updateTime: number
}

const convertToTimeStamp = (LastTime: string, updateTime: number) => {
  if (LastTime.includes("秒前")) {
    const seconds = parseInt(LastTime.replace("秒前", ""), 10)
    return dayjs(updateTime).subtract(seconds, "second").valueOf()
  } else if (LastTime.includes("分钟前")) {
    const minutes = parseInt(LastTime.replace("分钟前", ""), 10)
    return dayjs(updateTime).subtract(minutes, "minute").valueOf()
  } else if (LastTime.includes("小时前")) {
    const hours = parseInt(LastTime.replace("小时前", ""), 10)
    return dayjs(updateTime).subtract(hours, "hour").valueOf()
  } else if (LastTime === "刚刚") {
    return dayjs(updateTime).valueOf()
  }

  return null
}

export default ({ value, updateTime }: MessageTimeProps) => {
  const timerRef = useRef<number>(0)
  const [timeStr, setTimeStr] = useState(value)
  const [current, setCurrent] = useState(Date.now())
  const timeStamp = useMemo(() => convertToTimeStamp(value, updateTime), [value, updateTime])
  const convertToLastTime = () => {
    const diffUpdateTime = dayjs().diff(updateTime, "second")
    const lastSeconds = dayjs().diff(timeStamp, "second")
    if (lastSeconds < 60) return `${lastSeconds}秒前`
    if (lastSeconds / 60 < 60) return `${Math.floor(lastSeconds / 60)}分钟前`
    if (lastSeconds / (60 * 60) < 24) return `${Math.floor(lastSeconds / (60 * 60))}小时前`
    return ""
  }

  const dispalyTime = useMemo(() => {
    if (!timeStamp) return timeStr
    const convertedTime = convertToLastTime()
    if (convertedTime) return convertedTime
    return timeStr
  }, [timeStamp, current])

  useEffect(() => {
    let timer = null
    if (!(value.includes("天前") || !value)) {
      const during = (value.includes("秒前") || value.includes("刚刚") ? 1 : 30) * 1000
      timer = setInterval(() => {
        setCurrent(Date.now())
      }, during)
    }
    return () => {
      timer && clearInterval(timer)
    }
  }, [value])

  return dispalyTime
}
