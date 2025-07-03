import React from "react"
import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import "./style.scss"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import util from "@/magic/util"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        loading: true,
        list: [],
        PageIndex: 1,
        PageSize: 20,
        showBuy: false,
        commodity: null,
      }
    }
    componentDidMount() {
      this.loadMore(1).then(() => {
        this.setState({ loading: false })
        if (window.innerHeight / this.rowHeight > this.state.PageSize) {
          this.loadMore()
        }
      })
    }
    async loadMore(pageIndex) {
      if (pageIndex) {
        this.setState({ pageIndex: pageIndex })
      } else {
        pageIndex = this.state.pageIndex + 1
        this.setState({ pageIndex: pageIndex })
      }

      let res = await action.post("Shop/GetList", { id: this.props.areaId, PageIndex: pageIndex, PageSize: this.state.PageSize })

      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      let list = Object.assign([], this.state.list)
      this.setState({ list: list.concat(res.Data), pageEnd: res.Count < this.state.PageSize ? true : false })
    }
    async onInfiniteScroll(done) {
      await this.loadMore()
      setTimeout(() => {
        done()
      }, 500)
    }

    onBack() {
      this.setState({ showBuy: false })
    }

    renderList() {
      if (this.state.list.length > 0) {
        let ret = []
        ret.push(
          <div className="shop-modal-top-img transparent" key="shopAreaImg">
            <img src={this.props.topImg} alt="" />
            {/*{this.props.name}*/}
          </div>
        )
        ret.push(
          <div className="shop-credit-area" key="shop-list">
            <div className="credit-list">
              {this.state.list.map((item, index) => {
                return (
                  <div
                    className="credit-item"
                    key={"shopArea2" + index}
                    onClick={() => {
                      util.trialCheck()
                      this.props.router.push(this.props.route.pathname, { areaID: this.props.areaId, index })
                      this.props.show("showBuy")
                    }}
                  >
                    <div className="credit-item-inner">
                      <div className="img">
                        <img src={item.Logo} alt="" />
                      </div>
                      <div className="info">
                        <p className="p1">{item.Title}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

        return ret
      }
      return (
        <div className="no-data">
          {this.props.noData == "image" ? <div className="no-data-img"></div> : <div>{this.props.noData || "尚无明细"}</div>}
        </div>
      )
    }

    render() {
      return (
        <LayoutPage
          className={"shop-area-modal " + this.props.type}
          title={this.props.title}
          onBack={this.props.onBack}
          loading={this.state.loading}
          onInfiniteScroll={this.onInfiniteScroll.bind(this)}
          right={null}
        >
          <div>{this.renderList()}</div>
        </LayoutPage>
      )
    }
  }
)
