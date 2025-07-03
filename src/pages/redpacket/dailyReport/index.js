import React from "react"

import LayoutPage from "@/components/LayoutPage"
import { Icon } from "react-onsenui"
import util from "@/magic/util"
import * as apiNotification from "@/magic/ApiNotification"
import * as action from "@/action"

import "./style.scss"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    state = {
      PageIndex: 1,
      PageSize: 10,
      pageEnd: false,
      list: [],
    }

    componentDidMount() {
      this.loadMore(1)
    }
    async loadMore(pageIndex) {
      if (pageIndex) {
        this.setState({ PageIndex: pageIndex })
      } else {
        pageIndex = this.state.PageIndex + 1
        this.setState({ PageIndex: pageIndex })
      }

      let res = await action.get("RedPacket/GetDayCount", {
        PageIndex: pageIndex,
        PageSize: this.state.PageSize,
      })

      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      let list = Object.assign([], this.state.list)
      if (pageIndex == 1) {
        list = res.Data
      } else {
        list = list.concat(res.Data)
      }
      this.setState({ list: list, pageEnd: res.Data.length < this.state.PageSize ? true : false })
    }

    async onInfiniteScroll(done) {
      if (!this.state.pageEnd) {
        await this.loadMore()
      }
      setTimeout(() => {
        done()
      }, 500)
    }

    render() {
      if (!util.isLogin()) {
        this.props.router.push("/site/login")
        return null
      }
      let list = this.state.list

      return (
        <LayoutPage onInfiniteScroll={this.onInfiniteScroll.bind(this)} className="repacket-daily-report-page" center="每日报表" right={null}>
          {!this.state.pageEnd && list.length == 0 && (
            <div className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )}
          {this.state.pageEnd && list.length == 0 && <div className="loading">暂无记录</div>}
          {list.map((item) => {
            return (
              <div className="record-list-item" key={item.Date}>
                <p className="p1">日期:&nbsp;{item.Date}</p>

                <p className="p2">
                  <span>
                    发包总额:<em>&yen; {item.SendMoney}</em>
                  </span>
                  <span>
                    抢包总额:<em>&yen; {item.GetMoney}</em>
                  </span>
                  <span>
                    埋雷返款:<em>&yen; {item.MinesMoney}</em>
                  </span>
                  <span>
                    中雷总额:<em>&yen; {item.PayMoney}</em>
                  </span>
                </p>
              </div>
            )
          })}
        </LayoutPage>
      )
    }
  }
)
