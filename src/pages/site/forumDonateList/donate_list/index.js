import React from "react"

import "./style.scss"
import util from "@/magic/util"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {}

  render() {
    if (this.props.list == null) {
      return <div></div>
    }

    return (
      <div className="donate_list_content">
        <div className="title_bar">
          <div className="title1">会员名称</div>
          <div className="title2">打赏金额</div>
          <div className="title3">时间</div>
        </div>
        <div className="list">
          {this.props.list.map((item, key) => {
            var date = util.date.format(util.date.toDate(item.AddTime), "YYYY-MM-DD hh:mm:ss", 8)
            return (
              <div className="row" key={key + item.ID}>
                <div className="member_name">{item[this.props.member]}</div>
                <div className="member_price">{item.Amount}</div>
                <div className="member_time">{date}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
