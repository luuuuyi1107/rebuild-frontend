import { useState, useRef, useEffect } from "react"

const SwipeableItem = ({ children, onClick, buttons, swipeWidth = null, swipeFull = false, colors = ["#1485EE", "#FA9D3B", "#FA5151"] }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [moveDistance, setMoveDistance] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const itemRef = useRef(null)
  const buttonWidth = 80
  const buttonsWidth = swipeWidth ?? buttonWidth * buttons.length

  const handleDragStart = (e) => {
    setIsDragging(true)
    const clientX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX
    setStartX(clientX)
    setMoveDistance(0)
  }

  const handleDragMove = (e) => {
    if (!isDragging) return

    e.preventDefault()
    const clientX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX
    const diff = startX - clientX
    setMoveDistance(Math.abs(diff))

    if (diff > 0) {
      setCurrentX(Math.min(diff, buttonsWidth))
    } else {
      setCurrentX(0)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (currentX > buttonsWidth / 2.25) {
      setCurrentX(buttonsWidth)
    } else {
      setCurrentX(0)
    }
  }

  const handleClick = (e) => {
    // 如果移動距離小於 5px，視為點擊
    if (currentX > 0) {
      if (moveDistance < 5) {
        resetSwipe()
      }
    }
  }

  const resetSwipe = () => {
    setCurrentX(0)
    setConfirmDelete(false)
  }

  useEffect(() => {
    if (currentX === 0) {
      setTimeout(() => {
        setIsOpening(false)
      }, 500)
    } else {
      setIsOpening(true)
    }
  }, [currentX])

  return (
    <div onClick={handleClick} className={"relative overflow-hidden select-none" + (isOpening ? " swiper-dragging" : "")}>
      <div
        ref={itemRef}
        className="bg-white shadow cursor-grab active:cursor-grabbing transition-transform duration-200 ease-out"
        style={{ transform: `translateX(-${currentX}px)` }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {children}
      </div>

      <div
        className="absolute right-0 top-0 h-full flex justify-end items-center transition-transform duration-200"
        style={{ width: buttonsWidth + "px", transform: `translateX(${currentX < 10 ? "100%" : "0"})` }}
      >
        {buttons.map((text, index) => (
          <button
            style={{ backgroundColor: colors[index % 3], width: swipeFull ? buttonsWidth / buttons.length : buttonWidth }}
            key={index}
            onClick={() => {
              onClick(text)
              resetSwipe()
            }}
            className="h-full text-white border-0"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SwipeableItem
