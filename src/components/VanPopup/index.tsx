import React, { useEffect, useState, useRef } from "react"
import ReactDom from "react-dom"
import styles from "./style.module.scss"
import classNames from "classnames"

// 全局计数器，追踪显示的 VanPopup 数量
let popupCount = 0

// 定义 VanPopup 的 props 类型
interface VanPopupProps {
  show: boolean
  position?: "center" | "top" | "bottom" | "left" | "right"
  onOverlayClick?: () => void
  children?: React.ReactNode
  className?: string
  overlayClassName?: string
  duration?: number
  overlay?: boolean
}

const VanPopup: React.FC<VanPopupProps> = ({
  show,
  position = "center",
  onOverlayClick,
  children,
  className = "",
  overlayClassName = "",
  duration = 500,
  overlay = false,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // 处理 visible 变化，控制显示和隐藏动画
  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setTimeout(() => setIsActive(true))
    } else {
      setIsActive(false)
      const timer = setTimeout(() => setIsVisible(false), duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration])

  // 管理滚动锁定
  useEffect(() => {
    if (show && isVisible) {
      popupCount++
      lockScroll()
    } else if (!show && !isActive) {
      popupCount--
      if (popupCount <= 0) {
        unlockScroll()
        popupCount = 0
      }
    }

    return () => {
      if (!show && !isVisible) {
        popupCount--
        if (popupCount <= 0) {
          console.log(popupCount)
          unlockScroll()
          popupCount = 0
        }
      }
    }
  }, [show, isVisible, isActive])

  // 处理 input 焦点，延迟检查遮挡
  useEffect(() => {
    if (!show || !isVisible) return

    const handleFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement) {
        const input = e.target

        // 延迟 300ms 等待键盘完全弹出
        const timer = setTimeout(() => {
          const rect = input.getBoundingClientRect()
          const visualViewportHeight = window.visualViewport?.height || window.innerHeight
          const viewportHeight = Math.min(visualViewportHeight, window.innerHeight)

          // 检查 input 是否被键盘遮挡
          if (rect.bottom > viewportHeight - 20) {
            // 20px 缓冲
            // 计算 input 相对于文档顶部的位置
            const inputTop = rect.top + window.scrollY
            const inputHeight = rect.height
            const targetScrollTop = inputTop - (viewportHeight - inputHeight - 40) // 40px 确保 input 上方有空间

            // 临时解锁 .page__content 滚动
            const pageContent = document.querySelector(".page__content") as HTMLElement
            if (!pageContent) return

            // 滚动到 input 可见位置
            window.scrollTo({
              top: targetScrollTop,
              behavior: "smooth",
            })
          }
        }, 300) // 键盘弹出约 300ms

        return () => clearTimeout(timer)
      }
    }

    const content = contentRef.current
    if (content) {
      content.addEventListener("focus", handleFocus, true)
    }

    return () => {
      if (content) {
        content.removeEventListener("focus", handleFocus, true)
      }
    }
  }, [show, isVisible])

  // 锁定滚动
  const lockScroll = () => {
    const pageContent = document.querySelector(".page__content") as HTMLElement
    if (!pageContent) return

    // const scrollTop = pageContent.scrollTop
    // pageContent.style.overflow = "hidden"
    // pageContent.style.position = "fixed"
    // pageContent.style.width = "100%"
    // pageContent.style.top = `-${scrollTop}px`

    pageContent.addEventListener("touchmove", preventTouchMove)
  }

  // 解锁滚动
  const unlockScroll = () => {
    const pageContent = document.querySelector(".page__content") as HTMLElement
    if (!pageContent) return

    // const top = parseInt(pageContent.style.top || "0", 10)
    // pageContent.style.overflow = ""
    // pageContent.style.position = ""
    // pageContent.style.width = ""
    // pageContent.style.top = ""
    // pageContent.scrollTop = -top

    pageContent.removeEventListener("touchmove", preventTouchMove)
  }

  // 阻止触控滚动
  const preventTouchMove = (e: Event) => {
    e.preventDefault()
  }

  // 阻止点击内容区域冒泡
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // 动态计算 transition 样式
  const transitionStyle: React.CSSProperties = {
    transitionDuration: `${duration}ms`,
  }

  return (
    <>
      {isVisible &&
        ReactDom.createPortal(
          <div className={classNames("antialiased", styles.wrapper, { [styles.noOverlay]: !overlay })}>
            {overlay && (
              <div
                className={classNames(styles.overlay, overlayClassName, "test-overlay", { [styles.active]: isActive })}
                style={transitionStyle}
                onClick={() => onOverlayClick?.()}
              />
            )}
            <div
              ref={contentRef}
              className={classNames(
                styles.content,
                styles[position],
                className,
                { [styles.active]: isActive },
                "md:overflow-visible overflow-y-auto"
              )}
              style={{ ...transitionStyle }}
              onClick={handleContentClick}
            >
              {children}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default VanPopup
