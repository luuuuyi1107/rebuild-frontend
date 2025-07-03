import { useState, useRef, useEffect } from "react"

const SwipeableItem = ({ children, isOpen, onToggle, onClick, onDelete, onPinned, isPinned, onReaded }) => {
  const swipeWidth = 240 // 滑动的最大距离
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0) // 记录起始的 Y 坐标
  const [currentX, setCurrentX] = useState(0)
  const [moveDistance, setMoveDistance] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [startTime, setStartTime] = useState(0) // 记录滑动开始时间
  const itemRef = useRef(null)

  const handleDragStart = (e) => {
    const clientX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX
    const clientY = e.type === "mousedown" ? e.clientY : e.touches[0].clientY

    // 如果滑动起点在屏幕左侧 20px 内，认为是手势返回，忽略
    if (clientX < 20) {
      return
    }

    setIsDragging(true)
    setStartX(clientX + currentX)
    setStartY(clientY) // 记录起始的 Y 坐标
    setMoveDistance(0)
    setStartTime(Date.now()) // 记录滑动开始时间
  }

  const handleDragMove = (e) => {
    if (!isDragging) return

    e.preventDefault()
    const clientX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX
    const clientY = e.type === "mousemove" ? e.clientY : e.touches[0].clientY

    const diffX = startX - clientX
    const diffY = Math.abs(startY - clientY) // 计算垂直方向的滑动距离

    // 如果垂直滑动距离大于水平滑动距离，则认为是垂直滑动，忽略
    if (diffY > Math.abs(diffX)) {
      return
    }

    // 限制滑动范围，只允许向左滑动
    if (diffX > 0) {
      setCurrentX(Math.min(diffX, swipeWidth)) // 限制最大滑动距离
    } else {
      setCurrentX(0) // 禁止向右滑动
    }

    setMoveDistance(Math.abs(diffX)) // 更新滑动距离
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const endTime = Date.now() // 记录滑动结束时间
    const elapsedTime = endTime - startTime // 计算滑动时间
    const velocity = moveDistance / elapsedTime // 计算滑动速度

    // 判断滑动方向和速度
    if (currentX > swipeWidth / 2 || (velocity > 0.5 && currentX > 0)) {
      // 如果滑动超过一半或速度足够快，并且是向左滑动，则滑动到目标位置
      setCurrentX(swipeWidth)
      onToggle?.()
    } else {
      // 否则回到原位

      setCurrentX(0) // 如果当前是打开状态，则回到原位，否则滑动到目标位置
    }
  }

  const handleClick = (e) => {
    // 如果移动距离小于 5px，视为点击
    if (moveDistance < 5) {
      if (currentX > 0) {
        setCurrentX(0)
      } else {
        onClick?.()
      }
    }
    setConfirmDelete(false)
  }

  const resetSwipe = () => {
    setCurrentX(0)
    setConfirmDelete(false)
  }

  const handleEdit = () => {
    onReaded?.()
    resetSwipe()
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete()
      resetSwipe()
    }
    setConfirmDelete((prev) => !prev)
  }

  const handleToTop = () => {
    onPinned()
    resetSwipe()
  }

  useEffect(() => {
    if (!isOpen) {
      // 如果不是当前打开的 SwiperItem，自动关闭
      setCurrentX(0)
    }
  }, [isOpen])

  return (
    <div className="relative overflow-hidden select-none">
      <div
        ref={itemRef}
        className="bg-white shadow cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(-${currentX}px)`, transition: !isDragging ? `transform 0.45s ease-out` : "" }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onClick={handleClick}
      >
        {children}
      </div>

      <div
        className="absolute right-0 top-0 h-full flex items-center"
        style={{
          width: swipeWidth + "px",
          transform: `translateX(calc(100% - ${currentX}px))`,
          transition: !isDragging ? `transform 0.45s ease-out` : "",
        }}
      >
        {!confirmDelete && (
          <>
            <button onClick={handleEdit} className="h-full flex-1 bg-[#1485EE] text-white border-0">
              标记已读
            </button>
            <button onClick={handleToTop} className="h-full flex-1 bg-[#FA9D3B] text-white border-0">
              置顶{isPinned ? "取消" : "对话"}
            </button>
          </>
        )}
        <button onClick={handleDelete} className="h-full flex-1 bg-[#FA5151] text-white border-0">
          删除
          {confirmDelete && "并清除纪录"}
        </button>
      </div>
    </div>
  )
}

export default SwipeableItem
