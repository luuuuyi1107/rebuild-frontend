import React, { useState, useRef } from "react"
import { Icon } from "react-onsenui"
import "./style.scss"
import util from "@/magic/util"
import classNames from "classnames"

export default ({ className, title, option, selected, onChange, onClose }) => {
  const [open, setOpen] = useState(false)
  const componentRef = useRef(null)

  const handleClickOutside = (event) => {
    if (componentRef.current && !componentRef.current.contains(event.target)) {
      setOpen(false)
      onClose?.()
      document.removeEventListener("click", handleClickOutside)
    }
  }

  return (
    <div ref={componentRef} className={classNames("drop-menu-container", className)}>
      <div
        onClick={() => {
          setOpen(true)
          document.addEventListener("click", handleClickOutside)
        }}
        className={classNames("item py-0.5", { active: open })}
      >
        {title}
        <Icon icon="ion-chevron-down" className="relative -top-[3px]" />
        {option.length > 0 && (
          <div className={classNames("drop-menu")}>
            {option.map((item) => (
              <div
                className={classNames("drop-item whitespace-nowrap", {
                  active: selected.includes(item.key),
                })}
                onClick={() => {
                  onChange(item)
                }}
                key={item.key}
              >
                <div className="pr-1">
                  {item.name}
                  <img className="nor" src={util.buildAssetsPath("assets/icons/ic-tick.svg")} />
                  <img className="white" src={util.buildAssetsPath("assets/icons/ic-tick-white.svg")} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
