import React, { useState, useEffect, useMemo } from "react"

export default (props) => {
  // CountdownTimer
  const [count, setCount] = useState(props.initialCount)
  const timeData = useMemo(() => {
    const format = (num) => num.toString().padStart(2, "0")

    const hours = format(Math.floor(count / 3600))
    const minutes = format(Math.floor((count % 3600) / 60))
    const seconds = format(count % 60)

    return { hours, minutes, seconds }
  }, [count])

  useEffect(() => {
    if (count === 0) {
      if (!!props.callback) props.callback()
      // console.log("倒计时结束")
    } else {
      const timerId = setInterval(() => {
        setCount((prevCount) => prevCount - 1)
      }, 1000)
      return () => clearInterval(timerId)
    }
  }, [count])
  useEffect(() => {
    setCount(props.initialCount)
  }, [props.initialCount])

  return (
    <>
      <span className="num">{timeData.hours}</span>
      <span className="px-0.5 font-bold">:</span>
      <span className="num">{timeData.minutes}</span>
      <span className="px-0.5 font-bold">:</span>
      <span className="num">{timeData.seconds}</span>
    </>
  )
}
