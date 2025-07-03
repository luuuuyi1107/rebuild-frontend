import React, { useState } from "react"
import "./style.scss"
import classNames from "classnames"

export default function Slider({ min = 0, max = 100, step = 1, value = 0, onChange, disabled = false }) {
  const [isActive, setIsActive] = useState(false) // 用于跟踪是否正在拖动
  const handleChange = (e) => {
    if (!isActive) setIsActive(true)
    onChange?.(e.target.value)
  }

  const textClass = {
    "text-gray-300": disabled,
    "text-theme": !disabled,
  }

  const handleMouseDown = (e) => {
    if (disabled) return
    if (!isActive) setIsActive(true)
    const slider = e.target.closest(".relative")
    const sliderRect = slider.getBoundingClientRect()

    const onMouseMove = (e) => {
      const newValue = Math.min(Math.max(min, ((e.clientX - sliderRect.left) / sliderRect.width) * max), max)
      onChange?.(parseFloat((Math.round(newValue / step) * step).toFixed(2)))
    }

    const onMouseUp = () => {
      // setIsActive(false) // 停止拖动
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const handleContainerClick = (e) => {
    if (disabled) return

    const slider = e.target.closest(".relative")
    const sliderRect = slider.getBoundingClientRect()

    // 计算点击位置对应的值
    const clickValue = Math.min(Math.max(min, ((e.clientX - sliderRect.left) / sliderRect.width) * max), max)
    onChange?.(parseFloat((Math.round(clickValue / step) * step).toFixed(2))) // 更新值
  }

  const handleTouchStart = (e) => {
    if (disabled) return
    if (!isActive) setIsActive(true)
    const slider = e.target.closest(".relative")
    const sliderRect = slider.getBoundingClientRect()

    const updateValue = (clientX) => {
      const newValue = Math.min(Math.max(min, ((clientX - sliderRect.left) / sliderRect.width) * max), max)
      onChange?.(parseFloat((Math.round(newValue / step) * step).toFixed(2))) // 更新值
    }

    const onTouchMove = (e) => {
      const touch = e.touches[0]
      updateValue(touch.clientX) // 实时更新值
    }

    const onTouchEnd = () => {
      // setIsActive(false) // 停止拖动
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
    }

    document.addEventListener("touchmove", onTouchMove)
    document.addEventListener("touchend", onTouchEnd)

    // 初始化值
    const touch = e.touches[0]
    updateValue(touch.clientX)
  }

  return (
    <div className="flex items-center text-[14px]">
      <div className={classNames("px-0.5", { "text-gray-300": disabled })}>{min}%</div>
      <div
        className={classNames("relative flex-grow translate-y-[-3px]", { active: isActive })} // 动态添加 dragging 类
        // onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <input
          type="range"
          step={step}
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          className={classNames("w-full select-none appearance-none h-[2px] rounded-xl range-slider bg-gradient-to-r from-theme to-gray-300", {
            disabled,
          })}
          style={{
            background: disabled
              ? "#d9d9d9"
              : `linear-gradient(to right, #F77E04, #F77E04 ${(value / max) * 100}%, #D9D9D9 ${(value / max) * 100}%, #D9D9D9 100%)`,
          }}
          onMouseDown={() => setIsDragging(true)}
          // onMouseUp={() => (isHolding.value = false)}
        />
        <div
          className={classNames("absolute -translate-x-[8px]  py-[10px] text-[12px] whitespace-nowrap w-[36px] text-center", textClass)}
          style={{ left: `calc(${(value / max) * 100}% - ${(value / max) * 16}px)`, top: isActive ? "-28px" : "-23px" }}
          onMouseDown={handleMouseDown}
        >
          {value}%
        </div>
      </div>
      <div className={classNames("px-0.5 mt-1.25 ", textClass)}>{max}%</div>
    </div>
  )
}
