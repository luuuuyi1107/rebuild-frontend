import React, { useState, useRef, useEffect } from "react"

export default ({ children, content, placement = "bottom" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && !triggerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const getPopoverPosition = () => {
    switch (placement) {
      case "top":
        return "bottom-full mb-2"
      case "bottom":
        return "top-full"
      case "left":
        return "right-full mr-2"
      case "right":
        return "left-full ml-2"
      default:
        return "top-full mt-2"
    }
  }

  return (
    <div
      onClick={() => {
        setIsOpen(!isOpen)
      }}
      onMouseLeave={() => {
        setIsOpen(false)
      }}
    >
      {/* Trigger */}
      <div ref={triggerRef} onMouseMove={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </div>

      {/* Popover Content */}
      {isOpen && (
        <>
          <div className="absolute z-50 w-8 h-5 p-1 right-0"></div>
          <div className="absolute top-full -translate-y-1/2 -translate-x-1/2 right-[9px] w-1 h-1 rotate-45 bg-[#4C4C4C] border-t border-l "></div>
          <div ref={popoverRef} className={`absolute z-50 right-0 min-w-max ${getPopoverPosition()}`}>
            <div className="bg-[#4C4C4C] text-white rounded-[4px] shadow-lg border border-gray-200 p-[16px] pt-[14px] w-8 text-center  box-content">
              {content}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
