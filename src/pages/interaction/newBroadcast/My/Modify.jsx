import { useState, useMemo } from "react"
import Header from "@/components/Header"
export default (props) => {
  const [value, setValue] = useState(props.text)
  const isModified = useMemo(() => !value || value !== props.text)
  return (
    <Header
      className="bg-broadcast"
      center="设定昵称"
      left={
        <div
          onClick={() => {
            props.onClick("personal")
          }}
          className="text-[16px] text-center font-[400] pl-[7px]"
        >
          取消
        </div>
      }
      right={
        <div
          onClick={() => {
            if (isModified) {
              props.onChange(value)
            }
          }}
          className={`text-[14px] rounded-sm text-center font-bold py-[4px] ${
            isModified ? "bg-[#07C160] text-white active:opacity-80" : "bg-[#E1E1E1] text-[#BFBFBF]"
          }`}
        >
          完成
        </div>
      }
    >
      <div className="flex items-center bg-white">
        <input className="border-0 flex-1 py-1.5 px-1 text-[16px]" type="text" value={value} onChange={(e) => setValue(e.target.value)} />
        <div
          className={"relative bg-gray-500 w-[16px] h-[16px] rounded-full mr-1 " + (isModified ? "" : "opacity-60")}
          onClick={setValue.bind(null, props.text)}
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[9px] bg-white rotate-45"></span>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[9px] bg-white -rotate-45"></span>
        </div>
      </div>
    </Header>
  )
}
