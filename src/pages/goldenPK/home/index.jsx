import React from "react"

import { Icon, ListItem } from "react-onsenui"
import GoldenPKNavigatorBar from "@/components/GoldenPKNavigatorBar"

import "./style.scss"
import * as action from "@/action"
import GameTable from "@/pages/goldenPK/gameTable/index"
import * as apiNotification from "@/magic/ApiNotification"
import LayoutPage from "@/components/LayoutPage"
import { withRouter } from "@/magic/withRouter"
import ModalPage from "@/components/ModalPage"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        apiLoading: false,
        showGameTable: false,
        gameData: null,
        PageIndex: 1,
        PageSize: 20,
        pageEnd: false,
        list: [],
        sortType: 0,
      }
    }

    componentDidMount() {
      this.loadMore(1)
    }
    async loadMore(pageIndex, sortType) {
      if (pageIndex) {
        this.setState({ PageIndex: pageIndex })
      } else {
        pageIndex = this.state.PageIndex + 1
        this.setState({ PageIndex: pageIndex })
      }

      let sort = 0
      if (sortType) {
        if (sortType == "new") {
          sort = 0
        }
        if (sortType == "money") {
          sort = 1
        }
      }
      let res = await action.get("PKGame/GoldenList", {
        sort: sortType ? sort : this.state.sortType,
        status: 0,
        PageIndex: pageIndex,
        PageSize: this.state.PageSize,
      })

      if (res.Code != 1) {
        apiNotification.alert(res, {}, this.props)
        return
      }
      let list = Object.assign([], this.state.list)

      // let gameOverNumber = 0;
      // res.Data.map(item=>{
      //     if(item.Status!=0){
      //         gameOverNumber ++;
      //     }
      // })

      // let pageEnd = res.Data.length < this.state.PageSize ? true:false;
      // if(gameOverNumber==99 && !pageEnd){
      //     await this.loadMore();
      //     return;
      // }
      // console.log(9999)

      if (pageIndex == 1) {
        list = res.Data
      } else {
        list = list.concat(res.Data)
      }
      this.setState({ list: list, pageEnd: res.Data.length < this.state.PageSize ? true : false })

      // let gameNumbers = 0;
      // list.map(item=>{
      //     if(item.Status==0){
      //         gameNumbers ++;
      //     }
      // })

      // if(gameNumbers<20  && !pageEnd){
      //     await this.loadMore();
      // }
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
      let list = this.state.list
      return (
        <LayoutPage
          onInfiniteScroll={this.onInfiniteScroll.bind(this)}
          className="goldenPK-home"
          center="金花对战"
          onBack={() => {
            this.props.router.push("/site/home")
          }}
          right={
            <span
              style={{ fontSize: ".28rem", paddingRight: ".2rem", color: "#fff" }}
              onClick={() => {
                this.props.router.push("/site/article?id=8")
              }}
            >
              规则
            </span>
          }
          renderFixed={() => <GoldenPKNavigatorBar active="home" PKGame="goldenPK" />}
        >
          <div className="sortType">
            排序方式 :
            <span
              className={this.state.sortType == 0 ? "active" : ""}
              onClick={() => {
                this.setState({ sortType: 0 })
                this.loadMore(1, "new")
              }}
            >
              最新
            </span>
            <span
              className={this.state.sortType == 1 ? "active" : ""}
              onClick={() => {
                this.setState({ sortType: 1 })
                this.loadMore(1, "money")
              }}
            >
              金额
            </span>
          </div>
          {!this.state.pageEnd && list.length == 0 && (
            <div className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )}
          {this.state.pageEnd && list.length == 0 && <div className="loading">暂无擂台</div>}
          {list.map((row, index) => {
            return (
              <ListItem
                className="system-message-record-item room"
                key={row.ID}
                onClick={() => {
                  this.setState({ gameData: row, showGameTable: true })
                }}
              >
                <div className="left cardNumber">
                  <div>
                    <span className="table-id">{row.ID}</span>
                    <span className="table-name">牌局</span>
                  </div>
                </div>
                <div className="center tableInfo">
                  <div className="name">
                    <span>
                      <Icon icon="ion-person" />
                    </span>
                    <b>{row.NickName}</b>
                  </div>
                  <div className="money">
                    彩金：&nbsp;¥&nbsp;<b>{row.Money}</b>
                  </div>
                </div>
                <div className="right">
                  <Icon icon="ion-ios-arrow-right" />
                </div>
              </ListItem>
            )
          })}
          {/*/!* 战况细节 *!/*/}
          <ModalPage
            isOpen={this.state.showGameTable}
            className="report-record-modal round-detail-modal"
            animation="fade"
            onClose={() => {
              this.setState({
                showGameTable: false,
              })
            }}
          >
            {this.state.showGameTable && (
              <GameTable
                gameData={this.state.gameData}
                onBack={() => {
                  this.loadMore(1)
                  this.setState({
                    showGameTable: false,
                  })
                }}
              ></GameTable>
            )}
          </ModalPage>
        </LayoutPage>
      )
    }
  }
)
