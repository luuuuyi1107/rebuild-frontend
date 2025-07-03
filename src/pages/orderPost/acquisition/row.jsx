import React from "react"
import util from "@/magic/util"
export default (props) => {
  const row = props.row
  const width = 16
  const status = row.Status == 1 ? "已汇出" : row.Status == 2 ? "已确认" : row.Status == 3 ? "已撤销" : "处理中"
  return (
    <div className="recordItem" key={"withdraw" + row.ID}>
      <div>
        <img style={{ width }} src={util.buildAssetsPath("assets/icons/ic_dollor.png")} />
        <span>提现金额</span>
        {row.Money}
      </div>

      <div>
        <img style={{ width }} src={util.buildAssetsPath("assets/icons/ic_money.png")} />
        <span>扣除手续</span>
        {row.Tax}
      </div>

      <div>
        <img style={{ width }} src={util.buildAssetsPath("assets/icons/ic_pay.png")} />
        <span>提款渠道</span>
        {row.BankName}
      </div>

      <div>
        <img style={{ width }} src={util.buildAssetsPath("assets/icons/ic_type.png")} />
        <span>提现类型</span>
        {row.Type == 0 ? "普通提款" : row.Type == 1 ? "提款转充值" : row.Type == 2 ? "挂单提款" : ""}
      </div>
      <div className="span-2" id={"withdrawStatus" + row.ID}>
        <img style={{ width }} src={util.buildAssetsPath("assets/icons/ic_text.png")} />
        <span>提款状态</span>
        {status}
      </div>
      <div className="span-2">
        <img style={{ width }} src={util.buildAssetsPath("assets/icons/ic_time.png")} />
        <span>提交时间</span>
        {util.date.format(util.date.toDate(row.AddTime), "yyyy/MM/dd hh:mm:ss")}
      </div>

      {
        row.Status == 0 && (
          <div
            className="clickBtn cancle span-2"
            onClick={(e) => {
              props.withdrawSubmit(e.currentTarget, row.Status, row.ID, row.OrderID)
            }}
          >
            撤销
          </div>
        )
        // (e)=>{this.withdrawSubmit(e.currentTarget,row.Status,row.ID, row.OrderID)}
      }
      {row.Status == 1 && (
        <div
          className="clickBtn submit span-2"
          onClick={(e) => {
            props.withdrawSubmit(e.currentTarget, row.Status, row.ID, row.OrderID)
          }}
        >
          {/* this.withdrawSubmit(e.currentTarget,row.Status,row.ID, row.OrderID) */}
          {row.Type == 2 ? "查看详情" : "确认"}
        </div>
      )}
    </div>
  )
}
