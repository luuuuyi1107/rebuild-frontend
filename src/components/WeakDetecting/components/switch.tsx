import { NetWork_Type, Network_Status, iLocationResult } from "../index"
import Buttons from "./buttons"
import util from "@/magic/util"

type WeakSwitchProps = {
  handleNetworkDiagnose: (type: NetWork_Type) => void
  onClose: () => void
  changeLocation: (location: string) => void
  locations: iLocationResult[]
  ip: string
}

const ConnectStatus = (state: Network_Status) => {
  return (
    <div className="text-[16px] text-black font-[400] leading-tight my-1">
      {state === Network_Status.none ? (
        <div className="flex items-center justify-center">
          <div className="bg-[#D9D9D9] w-[10px] h-[10px]  rounded-full mr-0.5" />
          ---
        </div>
      ) : state === Network_Status.weak ? (
        <div className="flex items-center justify-center">
          <div className="bg-[#D9D9D9] w-[10px] h-[10px]  rounded-full mr-0.5" />
          较差
        </div>
      ) : state === Network_Status.normal ? (
        <div className="flex items-center justify-center">
          <div className="bg-[#58CC47] w-[10px] h-[10px]  rounded-full mr-0.5" />
          畅通
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="bg-[#FF4452] w-[14px] h-[14px] flex justify-center items-center rounded-full mr-0.5">
            <img src={util.buildAssetsPath("assets/icons/ic_thunder.svg")} />
          </div>
          最快
        </div>
      )}
    </div>
  )
}

export default (props: WeakSwitchProps) => {
  const swtichToLocation = (locationResult: iLocationResult) => {
    if (locationResult.status === Network_Status.none) return
    props.changeLocation(locationResult.location)
  }

  const getRandomOffsetTime = (num: number): number => {
    const randomOffset = Math.floor(Math.random() * 21) - 10
    return Math.max(num + randomOffset, 10)
  }

  return (
    <>
      <img className="w-[76px] h-[76px] mb-[8px]" src={util.buildAssetsPath("assets/icons/ic_success_tick.svg")} />

      <div className="text-[16px] text-black font-[400] leading-tight my-[4px]">网络诊断成功</div>

      <div className="text-[16px] text-black font-[400] leading-tight mb-[4px]">IP：{props.ip}</div>

      <div className="text-[16px] text-black font-[400] leading-tight my-[4px]">请选择网络线路</div>

      <div className="h-[0.5px] bg-[#ddd] mt-[20px]" />

      <div className="px-[8px]">
        {props.locations.map((result) => {
          return (
            <div key={result.index} className="flex items-center text-[16px] font-[400] leading-tight my-0.5 text-black">
              <div className="text-[16px] font-[400] flex-1 text-left">线路 {result.index + 1}</div>
              <div className="flex-1 text-left text-theme">{result.success ? `${getRandomOffsetTime(result.responseTime)}ms` : "超时"}</div>
              <div className="flex-1 text-left">{ConnectStatus(result.status)}</div>
              <button
                title={result.location}
                onClick={swtichToLocation.bind(null, result)}
                className={`${
                  result.success ? "bg-[#58CC47]" : "bg-[#999]"
                } text-white text-[16px] font-[400] flex justify-center items-center w-[68px] h-[34px] rounded-full border-0 cursor-pointer ml-[12px]`}
              >
                切换
              </button>
            </div>
          )
        })}
      </div>

      <Buttons
        btns={["关闭", "重新诊断"]}
        onClick={(index: number) => {
          if (index === 0) {
            props.onClose()
          } else {
            props.handleNetworkDiagnose(NetWork_Type.checking)
          }
        }}
      />
    </>
  )
}
