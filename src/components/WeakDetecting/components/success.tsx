import util from "@/magic/util"
import { NetWork_Type } from "../index"
import Buttons from "./buttons"
type WeakSuccessProps = {
  handleNetworkDiagnose: (type: NetWork_Type) => void
  onClose: () => void
}

export default (props: WeakSuccessProps) => {
  return (
    <>
      <img className="w-[76px] h-[76px]" src={util.buildAssetsPath("assets/icons/ic_success_tick.svg")} />
      <div className="text-[16px] text-black font-[400] leading-tight my-1">
        恭喜您
        <br />
        网络切换成功...
      </div>

      <Buttons
        className="mt-[20px]"
        btns={["网络诊断", "确定"]}
        onClick={(index: number) => {
          if (index === 0) {
            props.handleNetworkDiagnose(NetWork_Type.checking)
          } else {
            props.onClose()
          }
        }}
      />
    </>
  )
}
