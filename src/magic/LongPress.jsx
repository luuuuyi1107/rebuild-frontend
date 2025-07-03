import { useState, useRef, Fragment } from "react"

export default (props) => {
  const [isLongPress, setIsLongPress] = useState(false)
  const timerRef = useRef(null)

  const handleMouseDown = () => {
    timerRef.current = setTimeout(() => {
      setIsLongPress(true)
      onLongPress()
    }, 500) // 長按時間閾值（毫秒）
  }

  const handleMouseUp = () => {
    clearTimeout(timerRef.current)
    if (!isLongPress) {
      onClick()
    }
    setIsLongPress(false)
  }

  const onClick = () => {
    props.onClick?.()
  }

  const onLongPress = () => {
    props.onLongPress?.()
  }

  return (
    <div
      className={props.className || ""}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {props.children}
    </div>
  )
}
