import LayoutPage from "@/components/LayoutPage"
import classNames from "classnames"
import { useState } from "react"
import { getRealMonthRecords } from "@/action/apis"
import ScrollObserver from "@/components/ScrollObserver"
import util from "@/magic/util"

export default () => {
  const [monthWaterData, setMonthWaterData] = useState<UserMonthWaterApplyDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // 处理数据加载完成的回调
  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading)
    if (!isLoading) {
      setInitialized(true)
    }
  }

  const getRealMonthRecordsMoney = (_money: string | number) => {
    return Number(_money).toFixed(2)
  }

  const monthState = {
    0: "审核中",
    1: "成功",
    2: "拒绝",
    3: "系统派发",
  }

  const monthStateColor = {
    0: "text-[#8E8E8E]", // 申请中
    1: "text-[#50B973]", // 通过
    2: "text-[#E14138]", // 拒绝
    3: "text-[#8E8E8E]", // 系统派发
  }

  return (
    <LayoutPage center="返利纪录" right={null} apiLoading={loading}>
      <div className="p-[12px] space-y-[12px] text-[#1F1F21]">
        <ScrollObserver fetchData={getRealMonthRecords} setItems={setMonthWaterData} setLoading={handleLoadingChange}>
          {monthWaterData.map((record, index) => (
            <div
              key={index + "_" + record.AddTime}
              className="rounded-[6px] flex justify-between items-between bg-[#F7F7F7] p-[17px]  text-14px font-[400]"
            >
              <div>
                <div className="mb-[10px]">
                  时间：
                  {util.date.format(util.date.toDate(record.AddTime), "YYYY-MM-DD HH:mm:ss")}
                </div>
                {/* <div>本月可领取返利：{Number(record.MonthCanGetMoney).toFixed(2)} 元</div> */}
              </div>

              <div className="text-right">
                <div className="mb-[10px]">{util.formatNumber(record.ApplyMoney)}</div>
                <div
                  className={classNames({
                    "text-14px": true,
                    [monthStateColor[record.Status]]: monthStateColor[record.Status],
                  })}
                >
                  {monthState[record.Status] || record.Status || ""}
                </div>
              </div>
            </div>
          ))}

          {/* 添加暂无数据的提示 */}
          {initialized && !loading && monthWaterData.length === 0 && (
            <div className="flex items-center justify-center py-[40px] text-[#8E8E8E] text-14px">
              <div className="flex flex-col items-center">
                <div className="mb-[10px]"></div>
                <div>暂无返利记录</div>
              </div>
            </div>
          )}
        </ScrollObserver>
      </div>
    </LayoutPage>
  )
}
