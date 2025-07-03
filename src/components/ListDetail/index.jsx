import React, { useEffect, useState, useRef } from "react"
import "./style.scss"

export default (props) => {
  const [activeItem, setActiveItem] = useState(null)
  const contentRef = useRef()
  useEffect(() => {
    !activeItem && setActiveItem(props.items[0]?.ID)
  }, [props.items])

  function toggleActiveItem(item) {
    setActiveItem(activeItem === item.ID ? null : item.ID)
  }

  useEffect(() => {
    const contentNode = contentRef.current
    if (!contentNode) return
    const handleClick = (event) => {
      // 检查事件的目标是否是<a>标签
      // if (event.target.tagName === "A") {
      //   event.preventDefault() // 阻止<a>标签的默认行为
      //   if (event.target.href.includes("web/")) {
      //     util.cache.set("pushCount", 1)
      //   }
      //   window.location.href = event.target.href
      //   return
      // }
      const anchor = event.target.closest("a")
      if (anchor) {
        if (anchor.href.includes("web/")) {
          event.preventDefault() // 阻止<a>标签的默认行为
          util.cache.set("pushCount", 1)
          window.location.href = anchor.href
        }
      }
    }
    contentNode.addEventListener("click", handleClick)
    return () => {
      if (contentNode) {
        contentNode.removeEventListener("click", handleClick)
      }
    }
  }, [contentRef.current])

  return (
    <div className="smart-items" ref={contentRef}>
      {props.items.map((item) => (
        <div key={item.ID} className={`item${item.ID === activeItem ? " active" : ""}`}>
          <div
            className="title"
            onClick={() => {
              toggleActiveItem(item)
            }}
          >
            {item.Title}
            {/* <div>{ item.Title }</div> */}
            {/* <Icon icon="ion-ios-arrow-down"/> */}
          </div>

          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: item.Content.replace(/href="\/web\/(.*?).html(.*?)"/, 'href="/web/#/$1$2"') }}
          ></div>
        </div>
      ))}
    </div>
  )
}
