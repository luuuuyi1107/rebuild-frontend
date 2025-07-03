import util from "@/magic/util"
import { NetWork_Type } from "../index"
import Buttons from "./buttons"

type WeakInitiProps = {
  ip: string
  dontShowToday: boolean
  handleDontShowChange: (value: boolean) => void
  handleNetworkDiagnose: (type: NetWork_Type) => void
  onConfirm: () => void
}

export default (props: WeakInitiProps) => {
  return (
    <>
      <div className="min-h-[62px] px-[8px] flex flex-col justify-center">
        <div className="text-black font-[400] leading-normal">请检查网络连线!</div>
        <div className="text-black font-[400] leading-normal break-all whitespace-normal">IP：{props.ip}</div>
      </div>

      <Buttons
        className="mt-[20px]"
        btns={["网络诊断", "线路切换"]}
        onClick={(index: number) => {
          if (index === 0) {
            props.handleNetworkDiagnose(NetWork_Type.checking)
          } else {
            props.onConfirm()
          }
        }}
      />

      {/* 今日不显示选项 */}
      <div className="mt-1 py-[5px]">
        <label htmlFor="dontShowToday" className="h-[20px] text-[14px] font-[400] leading-none flex items-center text-black justify-center">
          {props.dontShowToday ? (
            <div className="bg-theme w-[18px] h-[18px] rounded-full flex justify-center items-center">
              <img className="w-1 h-1" src={util.buildAssetsPath("assets/icons/ic_tick.svg")} />
            </div>
          ) : (
            <div className="bg-white border-[1px] border-solid border-[#636363] w-[18px] h-[18px] rounded-full flex justify-center items-center"></div>
          )}
          <input
            className="invisible w-0"
            type="checkbox"
            id="dontShowToday"
            checked={props.dontShowToday}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              props.handleDontShowChange(e.target.checked)
            }}
          />
          <div>今日不再显示</div>
        </label>
      </div>
    </>
  )
}
