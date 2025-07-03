import Bus from "@/magic/EventBus"
import { useRef } from "react"
export default ({ text, setText, placeholder = "搜索", keepHeight = false, inputHeight = "h-[35px]", onFocus, onBlur, className = "" }) => {
  const isComposing = useRef(false) // 用于检测输入法组合输入状态

  return (
    <div className={`flex items-center bg-broadcast pl-1 pt-0 pb-[12px] text-center ${text && !keepHeight ? "" : "pr-1"} ${className}`}>
      <label className={"bg-white rounded-[4px] flex justify-center items-center px-1 flex-1 " + inputHeight}>
        <img src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDE1IDE1IiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiPg0KCTx0aXRsZT5OZXcgUHJvamVjdDwvdGl0bGU+DQoJPHN0eWxlPg0KCQkuczAgeyBmaWxsOiAjYWFhYWFhIH0gDQoJPC9zdHlsZT4NCgk8cGF0aCBpZD0iU2hhcGUgMSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGFzcz0iczAiIGQ9Im0yLjUgMTAuNGMtMi40LTIuMy0yLjQtNi4xIDAtOC40IDIuMy0yLjQgNi4xLTIuNCA4LjUgMCAyLjEgMi4xIDIuMyA1LjMgMC42IDcuN2wzLjYgMy42LTEuNCAxLjQtMy42LTMuNmMtMi4zIDEuNy01LjYgMS40LTcuNy0wLjd6bTcuOC03LjdjLTItMi01LjEtMi03LjEgMC0yIDEuOS0yIDUuMSAwIDcgMiAyIDUuMSAyIDcuMSAwIDEuOS0xLjkgMS45LTUuMSAwLTd6Ii8+DQo8L3N2Zz4=" />
        <input
          type="text"
          value={text}
          onChange={(event) => {
            setText(event.target.value)
          }}
          onKeyDown={(event) => {
            if (isComposing.current) {
              console.log("输入法组合输入中，阻止发送")
              return
            }

            if (event.key !== "Enter") return
            Bus.emit("inputText.enter", text)
            event.target.blur()
          }}
          onCompositionStart={() => {
            isComposing.current = true // 开始输入法组合输入
          }}
          onCompositionEnd={() => {
            isComposing.current = false // 结束输入法组合输入
          }}
          className={`whitespace-nowrap border-none focus:w-full px-0.5 pt-[2px] text-[14px] placeholder:text-[16px] text-[#B2B2B2] placeholder:text-[#B2B2B2] transition-all leading-none ${
            text ? "w-full text-black" : "empty:w-[55px] text-left"
          }`}
          onFocus={onFocus}
          onBlur={() => onBlur(text)}
          placeholder={placeholder}
        />
        {!!text && (
          <img
            className="cursor-pointer"
            onClick={() => {
              setText("")
              onBlur?.("")
            }}
            src={util.buildAssetsPath("assets/icons/ic_gray_cross.svg")}
          />
        )}
      </label>
      {!!text && (
        <div
          onClick={() => {
            setText("")
            onBlur?.("")
          }}
          className="text-[#576B95] font-[400] text-[16px] cursor-pointer px-1"
        >
          取消
        </div>
      )}
    </div>
  )
}
