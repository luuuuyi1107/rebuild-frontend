import React from "react"

import "./style.scss"
import util from "@/magic/util"

const stateObj = {
  // 'ing':'审核中',
  // 'pass':'已通过',
  // 'reject':'已驳回'
  0: "打赏",
  1: "待审核",
  2: "通过",
}
export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {}

  render() {
    //TODO 待審核的狀態處理
    if (this.props.list == null) {
      return <div></div>
    }

    return (
      <div className="audit_list_content">
        <div className="title_bar">
          <div className="title1">申請時間</div>
          <div className="title2">申請金额</div>
          <div className="title3">審核結果</div>
        </div>
        <div className="list">
          {this.props.list.map((item, key) => {
            var date = util.date.format(util.date.toDate(item.AddTime), "YYYY-MM-DD hh:mm:ss", 8)

            return (
              <div className="row" key={key + item.ID}>
                <div className="member_time">{date}</div>
                <div className="member_price">{item.Amount}</div>
                <div className={`member_name state-${item.Status}`}>{stateObj[item.Status]}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
