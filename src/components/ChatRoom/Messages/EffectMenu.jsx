import util from "@/magic/util"
import React, { useEffect, useState, useRef } from "react"

export default ({ messageEffect, onClose, onScroll }) => {
  const menuRef = useRef(null)
  // const [isFullyVisible, setIsFullyVisible] = useState(true)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [onClose])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          const { boundingClientRect, intersectionRatio } = entry
          onScroll?.(-90 * (1 - intersectionRatio) - 10)
        }
        if (menuRef.current) {
          observer.unobserve(menuRef.current)
        }
      },
      {
        root: null, // 视口
        threshold: 1.0, // 完全可见时触发
      }
    )

    if (menuRef.current) {
      observer.observe(menuRef.current)
    }

    return () => {
      if (menuRef.current) {
        observer.unobserve(menuRef.current)
      }
    }
  }, [])

  return (
    <div className="effect-menus" ref={menuRef}>
      <div
        className="effect-menu ta"
        onClick={(e) => {
          messageEffect(1)
        }}
      >
        <img className="mb-0.75" src={util.buildAssetsPath("/assets/icons/ic_ta.svg")} />
        @ta
      </div>
      <div
        className="effect-menu"
        onClick={(e) => {
          messageEffect(2)
        }}
      >
        <img className="mb-0.75" src={util.buildAssetsPath("/assets/icons/ic_quote.svg")} />
        引用
      </div>
      <div
        className="effect-menu"
        onClick={(e) => {
          messageEffect(3)
        }}
      >
        <img className="mb-0.75" src={util.buildAssetsPath("/assets/icons/ic_copy.svg")} />
        复制
      </div>
    </div>
  )
}
