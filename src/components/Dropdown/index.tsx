import React, { useEffect, useState, useRef } from "react"
import "./style.scss"
import classNames from "classnames"

export default function Dropdown({
  options,
  value,
  onChange,
  disabled = false,
  onClickDisabled,
  placeholder = "",
}: {
  options: { value: string; label: string; icon?: string; disabled?: boolean; className?: string }[]
  value: string | number
  onChange: (value: string) => void
  disabled?: boolean
  onClickDisabled?: ({ value, label }: { value: string; label: string }) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)

  const currentLabel = options.find((x) => x.value == value)?.label
  const currentIcon = options.find((x) => x.value == value)?.icon
  const dropdownRef = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    const checkAndHide = (e: MouseEvent) => {
      if (open && !dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener("click", checkAndHide, true)
    return () => {
      window.removeEventListener("click", checkAndHide)
    }
  })

  const triggerOpen = () => {
    setOpen(!open)
  }

  return (
    <div ref={dropdownRef} className={classNames("dropdown", { active: open }, { disabled })} onClick={triggerOpen}>
      <button type="button" className="display">
        <div className="w-full h-[20px] relative">
          <div className="absolute left-0 top-0 bottom-0 right-0 truncate flex items-center">
            {currentIcon && <img src={currentIcon} className="icon mr-[4px] w-[20px]" />}
            {currentLabel || placeholder}
          </div>
        </div>
      </button>
      {open && (
        <ul className="menu">
          {options.map(({ value: v, label, icon, className, disabled }, index) => (
            <li key={index} className={classNames("menu-item", { disabled })}>
              <button
                type="button"
                className={classNames("menu-button", className)}
                onClick={(e) => {
                  if (disabled) {
                    onClickDisabled?.({ value: v, label })
                    e.stopPropagation()
                  }
                  if (!disabled && value !== v) {
                    onChange(v)
                  }
                }}
              >
                {/* {label} */}
                <div className="w-full h-[20px] relative ">
                  <div className="relative left-1 top-0 bottom-0 right-2 truncate flex items-center">
                    {icon && <img src={icon} className="icon mr-[4px] w-[20px]" />}
                    {label}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
