import CustomIcon from "@/components/CustomIcon"
import MoreFunc from "./MoreFunc"
import EmojiPanel from "./EmojiPanel"
import VoiceRecorder from "./VoiceRecorder"
import { notificationAsync } from "@/magic/notification"
import { useRef, useEffect } from "react"
import { debounce } from "lodash"

export default ({
  text,
  quoteData,
  setQuoteData,
  actionData,
  setActionData,
  setText,
  sendText,
  sendingMessage,
  uploadFile,
  setShowShare,
  setShowModal,
  sendMessage,
}) => {
  const textInput = useRef(null)
  const footerRef = useRef(null)
  const isComposing = useRef(false) // 用于检测输入法组合输入状态
  const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const scrollTarget = useRef(0)
  const header = useRef(null)
  const headerFocusOffset = useRef(0)
  const debouncedHandleScrollRef = useRef(null)
  const originViewportHeight = useRef(window.visualViewport?.height || window.innerHeight)

  // 创建debounce函数并存储引用，这样可以在卸载时取消它
  useEffect(() => {
    debouncedHandleScrollRef.current = debounce(
      () => {
        if (!isIPhone) return

        if (scrollTarget.current) {
          window.scrollTo({ top: scrollTarget.current })
          return
        }

        const viewportHeight = window.visualViewport?.height || window.innerHeight
        const top = document.body.scrollHeight - viewportHeight

        window.scrollTo({ top })
      },
      10,
      { leading: true, trailing: true }
    )
  }, [])

  useEffect(() => {
    if (!isIPhone) return // 如果不是 iPhone，直接退出

    header.current = document.querySelector(".inverse.toolbar")

    // 添加事件监听器
    const handleScroll = (e) => {
      if (debouncedHandleScrollRef.current) {
        debouncedHandleScrollRef.current(e)
      }
    }

    originViewportHeight.current = window.visualViewport?.height || window.innerHeight

    // 清理函数
    return () => {
      window.removeEventListener("scroll", handleScroll)
      // 取消所有排队的debounce调用
      if (debouncedHandleScrollRef.current && debouncedHandleScrollRef.current.cancel) {
        debouncedHandleScrollRef.current.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (!textInput.current) return
    adjustTextHeight(textInput.current)
  }, [text])

  const updateHeaderPosition = () => {
    setTimeout(
      () => {
        // 获取视口信息
        if (!headerFocusOffset.current) {
          const visualViewport = window.visualViewport
          if (!visualViewport || !header.current) return
          headerFocusOffset.current = originViewportHeight.current - visualViewport.offsetTop - 44

          // headerFocusOffset.current = window.innerHeight - visualViewport.height
        }
        console.log(originViewportHeight.current, visualViewport.offsetTop)
        // 设置header样式
        header.current.style.position = "fixed"
        // header.current.style.top = `${headerFocusOffset.current}px`
        header.current.style.top = "auto"
        header.current.style.bottom = headerFocusOffset.current + "px" // 这里使用了一个新的变量来存储偏移量
      },
      headerFocusOffset.current ? 0 : 300
    ) // 延迟，确保键盘弹出后再执行
  }

  function adjustTextHeight(element) {
    element.style.height = "auto"
    element.style.height = element.scrollHeight - 14 + "px"
  }

  const debouncedSendText = debounce(
    () => {
      if (text.trim() === "") return // 防止发送空消息
      sendText()
    },
    1000,
    { leading: true, trailing: false }
  )

  // 存储当前滚动处理函数的引用，以便能正确移除
  const currentScrollHandler = useRef(null)

  return (
    <>
      <div className="ft">
        {quoteData && (
          <div className="ft-quote">
            <span dangerouslySetInnerHTML={{ __html: quoteData.content }}></span>
            <span
              className="quoteCancel"
              onClick={() => {
                setQuoteData("")
              }}
            ></span>
          </div>
        )}
        <div className="py-0.75 pr-0.5 bg-[#F6F6F6] border-x-0 border-b-[0.5px] border-t-[0.5px] border-solid border-[#DDDDDD] min-h-[40px] flex">
          <div className="w-1" />
          <div className="px-0.5 mr-[5px] py-[3.3px] flex items-center flex-1 bg-white rounded-[3px]">
            {actionData === "showVoice" || actionData === "showVoiceRecorder" ? (
              <VoiceRecorder
                onUpload={uploadFile}
                onClose={() => {
                  setActionData("")
                }}
              />
            ) : (
              <textarea
                className="flex-1 border-0 p-0.5 box-content text-[16px] resize-none min-h-[21px] bg-transparent leading-snug"
                placeholder="请输入..."
                rows={1}
                value={text}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !(e.shiftKey || e.ctrlKey)) {
                    if (isComposing.current) {
                      console.log("输入法组合输入中，阻止发送")
                      return
                    }

                    e.preventDefault()
                    e.stopPropagation()
                    debouncedSendText()
                    textInput.current.focus()
                    setTimeout(() => {
                      adjustTextHeight(e.target)
                    }, 10)
                  }
                }}
                onInput={(e) => {
                  setText(e.target.value)
                }}
                onFocus={(e) => {
                  setActionData((prev) => (prev === "" ? null : prev === null ? "" : prev))
                  if (!isIPhone) return

                  // updateHeaderPosition()

                  if (!!scrollTarget.current) return
                  document.querySelector(".broadcast-chat-room").classList.add("virtual-keyboard")
                  setTimeout(() => {
                    const viewportHeight = window.visualViewport?.height || window.innerHeight
                    scrollTarget.current = document.body.scrollHeight - viewportHeight
                  }, 300)

                  // 设置当前处理函数
                  currentScrollHandler.current = (e) => {
                    if (debouncedHandleScrollRef.current) {
                      debouncedHandleScrollRef.current(e)
                    }
                  }

                  // 确保先移除旧的监听器（如果有）
                  if (currentScrollHandler.current) {
                    window.removeEventListener("scroll", currentScrollHandler.current)
                  }

                  // 添加新的监听器
                  window.addEventListener("scroll", currentScrollHandler.current)
                }}
                onBlur={(e) => {
                  if (!isIPhone) return
                  document.querySelector(".broadcast-chat-room").classList.remove("virtual-keyboard")
                  // 重置header样式
                  // header.current.style.removeProperty("position")
                  // header.current.style.removeProperty("top")
                  // header.current.style.removeProperty("bottom")

                  // 移除当前滚动监听器
                  if (currentScrollHandler.current) {
                    window.removeEventListener("scroll", currentScrollHandler.current)
                    currentScrollHandler.current = null
                  }

                  // 取消所有排队的debounce调用
                  if (debouncedHandleScrollRef.current && debouncedHandleScrollRef.current.cancel) {
                    debouncedHandleScrollRef.current.cancel()
                  }

                  // 重置目标
                  scrollTarget.current = 0
                }}
                onCompositionStart={() => {
                  isComposing.current = true // 开始输入法组合输入
                }}
                onCompositionEnd={() => {
                  isComposing.current = false // 结束输入法组合输入
                }}
                enterKeyHint="Send"
                ref={textInput}
              />
            )}
          </div>

          <div className="flex justify-center items-center w-3">
            <span
              className={`emoji`}
              onClick={() => {
                setActionData("showEmoji")
              }}
            >
              <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon translate-y-[2px]" type={require("./icons/emoji.svg")} />
            </span>
          </div>

          <div
            className="flex justify-center items-center w-3"
            onClick={() => {
              setActionData("showShare")
            }}
          >
            <span className="emoji">
              <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon translate-y-[2px]" type={require("./icons/ic_plus.svg")} />
            </span>
          </div>
        </div>
        {actionData == "showShare" && (
          <MoreFunc
            onUpload={uploadFile}
            onFuncClick={(key) => {
              if (key === "shareWin") {
                setActionData("")
                sendMessage({ text: "" }, 2)
                return
              } else if (key === "bet" || key === "moreWin" || key === "ranks") {
                setShowShare(key)
                setShowModal(true)
                setActionData("")
                return
              }
              notificationAsync.alert("功能暂未开放", { class: "broadcast" })
            }}
          />
        )}
        {actionData == "showEmoji" && (
          <div className="h-full overflow-hidden">
            <EmojiPanel onEmojiText={sendingMessage} setText={setText} text={text} />
          </div>
        )}
      </div>
    </>
  )
}
