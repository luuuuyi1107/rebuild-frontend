import LayoutPage from "@/components/LayoutPage"
import React, { useState, useEffect, useRef } from "react"
import { getCouponLogs } from "@/action/apis"
import util from "@/magic/util"
import ScrollObserver from "@/components/ScrollObserver"

export default () => {
  const [logs, setLogs] = useState([])

  function fetchData(page, pageSize) {
    return getCouponLogs(page, pageSize)
  }

  return (
    <LayoutPage center="领取纪录" right={null}>
      <div className="p-1 text-[13px]">
        <ScrollObserver fetchData={fetchData} setItems={setLogs}>
          {logs.map((log, index) => (
            <div key={log.ID + "_" + log.CID} className="rounded-sm bg-[#f1f1f1] mb-1 last:mb-0 p-1 grid grid-cols-1 gap-0.5">
              <div>活动名称: {log.Name}</div>
              <div>优惠码: {log.Code}</div>
              <div>金额: ￥{log.Money}</div>
              <div>时间: {util.date.format(util.date.toDate(log.Time), "YYYY-MM-DD HH:mm:ss")}</div>
            </div>
          ))}
        </ScrollObserver>
      </div>
    </LayoutPage>
  )
}
