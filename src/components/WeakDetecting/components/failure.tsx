import util from "@/magic/util"
import { NetWork_Type } from "../index"
import Buttons from "./buttons"

type WeakFailureProps = {
  handleNetworkDiagnose: (type: NetWork_Type) => void
  onClose: () => void
  ip: string
}

export default (props: WeakFailureProps) => {
  return (
    <>
      <img className="w-[76px] h-[76px]" src={util.buildAssetsPath("assets/icons/ic_failure_mark.svg")} />
      <div className="text-[16px] text-black font-[400] leading-tight mt-1">
        网络切换失败
        <br />
        IP：{props.ip}
      </div>

      <Buttons
        className="mt-[20px]"
        btns={["关闭", "再次尝试"]}
        onClick={(index: number) => {
          if (index === 0) {
            props.onClose()
          } else {
            props.handleNetworkDiagnose(NetWork_Type.switch)
          }
        }}
      />
    </>
  )
}
