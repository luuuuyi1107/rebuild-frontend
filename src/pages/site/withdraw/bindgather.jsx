import styles from "./bindgather.module.scss"
import util from "@/magic/util"
export default (props) => {
  const { BetMoney = 10, EndMoney = 100, isAbleToWithdraw = false } = props // , RecMoney = 20
  const betMoney = isAbleToWithdraw ? 0 : BetMoney
  const endMoney = isAbleToWithdraw ? 0 : EndMoney
  const leakMoney = endMoney - betMoney

  return (
    <div className={styles.Bind}>
      <div className="bg-white shadow rounded p-1">
        <div className="mb-0.5 text-[14px]">
          {isAbleToWithdraw ? (
            "您已满足申请提现"
          ) : (
            <>
              您还需要投注 <font className="text-[#F10000]">{util.formatMoney(leakMoney)}</font> 元可申请提现
            </>
          )}
        </div>
        <div className="flex justify-between">
          <div> {util.formatMoney(betMoney)}元</div>
          <div> {util.formatMoney(endMoney)}元</div>
        </div>
        <ProcessBar
          value={isAbleToWithdraw ? 1 : betMoney}
          max={isAbleToWithdraw ? 1 : endMoney}
          className="bg-[#eee] h-[10px] rounded-full my-0.5"
        />
        <div className="flex justify-between">
          <div>
            {!isAbleToWithdraw && (
              <>
                有效投注(元):
                <font className="text-[#009621]"> {util.formatMoney(betMoney)}</font>
              </>
            )}
          </div>

          <div>
            还需要投注(元):
            <font className="text-[#B02B4B]"> {util.formatMoney(leakMoney)}</font>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessBar(props) {
  const { value, max, className } = props
  return (
    <div className={className}>
      <div style={{ width: `${(value / max) * 100}%` }} className="h-full bg-[#50B973] rounded-full"></div>
    </div>
  )
}
