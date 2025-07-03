import LayoutPage from "@/components/LayoutPage"
import { withRouter } from "@/magic/withRouter"
import { useEffect, useState } from "react"
import { getRealMonthWater, postRealMonthWaterApply } from "@/action/apis"
import { notificationAsync } from "@/magic/notification"
import util from "@/magic/util"
import { get } from "lodash"

export const getIsMonthlyEnable = () => {
  const monthWaterData = util.cache.get("MonthWater")
  const show = get(monthWaterData, "OpenMonth", false)
  const closeText = get(monthWaterData, "CloseMonthText", "")
  !show && notificationAsync.alert(closeText || "月月返利活动已关闭，敬请期待下次活动！")
  return !!show
}

export default withRouter((props) => {
  const [loading, setLoading] = useState(false)
  const [applyMoney, setApplyMoney] = useState<number | null | "">("")
  const [monthData, setMonthData] = useState<RealMonthWater>({
    WaterMoney: 0,
    ApplyMonth: 0,
    RemainMoney: 0,
  })

  const submitRebateAmount = async () => {
    if (!applyMoney || Number(applyMoney) <= 0 || loading) return
    try {
      setLoading(true)
      const result = await postRealMonthWaterApply(applyMoney)
      if (result.Code !== 1) return
      notificationAsync.alert(result.Message || "提交成功，请耐心等待处理")
      fetchData()
      setApplyMoney("")
    } catch (error) {
      console.error("Failed to submit rebate amount:", error)
      notificationAsync.alert(error?.Message || "提交失败，请耐心等待处理")
    } finally {
      setLoading(false)
      setApplyMoney("")
    }
  }

  const fetchData = async () => {
    const cachedData = util.cache.get("User/GetRealMonthWater", "session")
    if (cachedData) setMonthData(cachedData)
    try {
      const result = await getRealMonthWater()
      if (result.Code !== 1) return
      util.cache.set("User/GetRealMonthWater", result.Data, "session")
      setMonthData(result.Data)
    } catch (error) {
      console.error("Failed to fetch rebate data:", error)
    }
  }

  const getArtical = () => {
    window.open("https://76c015.com/web/#/site/promotionContent?tab=&id=233&s=0", "_blank")
  }

  useEffect(() => {
    if (!getIsMonthlyEnable()) {
      props.router.back()
      return
    }

    fetchData()
  }, [])

  return (
    <LayoutPage
      className="rebate-page"
      center="月月返利"
      apiLoading={loading}
      right={
        <div onClick={() => props.router.push("/interaction/monthlyWater/record")} className="text-16px font-[400] text-white pr-[12px] box-border">
          返利纪录
        </div>
      }
    >
      <div className="p-[20px] pb-[10px] bg-white text-14px font-[400] space-y-[5px]">
        <div>本月返利金额：&nbsp;&nbsp;{util.formatNumber(monthData.WaterMoney)}</div>
        <div>已经申请金额：&nbsp;&nbsp;{util.formatNumber(monthData.ApplyMonth)}</div>
        <div>剩余可领金额：&nbsp;&nbsp;{util.formatNumber(monthData.RemainMoney)}</div>
        <div className="border-b-[1px] border-[#E8E8E8] border-solid border-x-0 border-t-0 h-[48px] mb-[10px] flex items-center text-14px">
          申请额度
          <input
            className="flex-1 border-none mx-[20px] placeholder:text-[#aeaeae] text-14px"
            placeholder="请填写返利金额"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={applyMoney}
            onChange={(e) => {
              const value = e.target.value
              if (value === "") {
                setApplyMoney("")
                return
              }

              // 只允许数字字符
              if (/^\d*$/.test(value)) {
                setApplyMoney(+value)
              }
            }}
            onKeyDown={(e) => {
              const invalidChars = ["e", "E", "+", "-", "."]
              if (invalidChars.includes(e.key)) e.preventDefault()
            }}
            onBlur={(e) => {
              const value = e.target.value
              if (value === "" || Number(value) === 0) {
                setApplyMoney("")
                return
              }
              const numValue = Math.floor(Number(value))
              if (numValue > 0) {
                setApplyMoney(numValue)
              } else {
                setApplyMoney("")
              }
            }}
          />
          元
        </div>
        <div className="h-[2px]" />
        <button onClick={submitRebateAmount} className="bg-theme text-white border-none w-full rounded-[6px] text-14px py-[9px] h-[44px]">
          提交
        </button>
      </div>

      <div className="px-[20px] py-[10px]">
        <div className="text-14px text-[#E14138] font-[400] mb-[5px]">注意事项</div>
        <ol className="m-0 pl-[16px] list-decimal text-[#8E8E8E] text-13px leading-tight font-[400] space-y-[6px]">
          <li>
            活动请参考{" "}
            <span onClick={getArtical} className="text-[#0000ee] underline">
              不论输赢,月月大返利,最高可达88888元!
            </span>
          </li>
          <li>本月总返利包含本月可领取返利与本月已领取返利</li>
          <li>全部领取后新获得的返利可以再次申请提前领取</li>
          <li>未领取反利将在下月月初时自动发放到会员帐户内</li>
          <li>申请提前领取本月返利非即时发放，请耐心等候</li>
          <li>申请提前领取本月返利若超过24H未到帐请联系客服</li>
        </ol>
      </div>
    </LayoutPage>
  )
})
