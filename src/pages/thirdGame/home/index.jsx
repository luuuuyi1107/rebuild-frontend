import React from "react"
import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import { Icon } from "react-onsenui"
import util from "@/magic/util"
import GameNavigatorBar from "@/components/GameNavigatorBar"
import * as apiNotification from "@/magic/ApiNotification"
import config from "@/config/platforms"
import InputBox from "@/components/InputBox"

import "./style.scss"
import "./promotionicon.scss"
import { withRouter } from "@/magic/withRouter"
import Bus from "@/magic/EventBus"
import { getArticleList } from "@/action/apis"
import _ from "lodash"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.platform = util.getUrlParam("platform")
      this.config = config[this.platform]
      this.state = {
        apiLoading: true,
        name: "",
        list: [],
        PageIndex: 1,
        PageSize: 50,
        pageEnd: false,
        loadingMore: false,
        promotionListShow: false,
        promotionIconShow: true,
        promotionList: [],
      }
    }
    componentDidMount() {
      this.loadData()
      Bus.emit("getPush.stop")
      if (!!util.getUrlParam("message")) {
        apiNotification.alert({ Message: util.getUrlParam("message") })
      }
    }
    componentDidUpdate(preProps) {
      Bus.emit("getPush.stop")
      if (preProps.route.query.platform != this.props.route.query.platform) {
        this.platform = this.props.route.query.platform
        this.config = config[this.platform]
        this.loadData()
      }
    }
    componentWillUnmount() {
      Bus.emit("getPush.start")
    }

    async loadData() {
      try {
        await this.loadMore(1)
      } catch (error) {
        apiNotification.alert(
          { Message: error },
          {
            title: "提示",
            callback: () => {
              this.props.router.push("/site/home")
            },
          },
          this.props
        )
        return
      }
      this.setState({ apiLoading: false })
      if (this.config.promotionId) {
        let promotionList = await getArticleList({ id: this.config.promotionId, status: 1, PageSize: 50 })
        if (promotionList.Code != 1) {
          apiNotification.alert(promotionList, {}, this.props)
          return
        } else {
          this.setState({ promotionList: promotionList.Data })
        }
      }
    }

    enterGame(game) {
      // console.log({ game, config: this.config })
      util.trialCheck({ forGame: true })
      this.setState({ apiLoading: true })
      util
        .jumpToThirdGame(game, this.config)
        .catch((Message) => {
          apiNotification.alert({ Message }, {}, this.props)
        })
        .finally(() => {
          this.setState({ apiLoading: false })
        })
    }

    async loadMore(PageIndex) {
      let platform = this.config
      if (!platform) {
        throw util.getUrlParam("message") || "平台不存在"
      }
      if (platform.games) {
        const list = !this.state.name
          ? platform.games
          : _.filter(platform.games, (game) => game.name.toLowerCase().includes(this.state.name.toLowerCase()))
        this.setState({ list, PageEnd: true })
      } else {
        if (!PageIndex) {
          PageIndex = this.state.PageIndex + 1
        }
        this.setState({ PageIndex: PageIndex })

        let gameListApi = platform.gameListApi
        let res = await action[gameListApi.method](
          gameListApi.url,
          Object.assign(gameListApi.params, { PageIndex: PageIndex, PageSize: this.state.PageSize, name: this.state.name })
        )

        if (res.Code == 1) {
          let listRes = []
          for (let i = 0; i < res.Data.length; i++) {
            let item = res.Data[i]
            let width = 33.33
            let imgRatio = undefined
            let tag = undefined
            let name = item.Name
            if (item.Name == "PC") {
              continue
            }
            if (item.Name == "真人视讯(BBIN)" || item.Name == "游戏大厅(BG)") {
              width = 100
            }
            // pt 真人大厅
            if (item.ID == "F16D03724DA11D6D9D4819A91BE117CF") {
              width = 100
            }
            if (item.Name == "西游捕鱼" || item.Name == "BG捕鱼大师") {
              width = 50
              imgRatio = 0.48
            }
            if (item.Name && item.Name.startsWith("PC-")) {
              tag = "PC"
              name = item.Name.replace("PC-", "")
            }
            listRes.push({
              name: name,
              img: item.Logo,
              KindID: 0,
              id: item.ID,
              width: width,
              imgRatio: imgRatio,
              tag: tag,
            })
          }

          let list = Object.assign([], this.state.list)
          if (PageIndex == 1) {
            list = listRes
          } else {
            list = list.concat(listRes)
          }

          this.setState({ list: list, pageEnd: res.Data.length < this.state.PageSize ? true : false })
        } else {
          if (res.Message.includes("Network request failed") && util.platform.isUCBrowser()) return
          apiNotification.alert(res, {}, this.props)
        }
      }
    }
    async onInfiniteScroll(done) {
      if (!this.state.pageEnd && this.state.list.length > 0) {
        this.setState({ loadingMore: true })
        await this.loadMore()
        this.setState({ loadingMore: false })
      }
      setTimeout(() => {
        done()
      }, 500)
    }

    onSearch() {
      this.loadMore(1)
    }

    renderSearchBar(config) {
      return (
        <div className="search-box">
          <InputBox
            type="search"
            placeholder={config.title}
            onKeyPress={(e) => {
              e.key == "Enter" && this.onSearch()
            }}
            onChange={(value) => {
              this.setState({ name: value })
            }}
            value={this.state.name}
          />
          <Icon icon="ion-search" onClick={this.onSearch.bind(this)}></Icon>
        </div>
      )
    }

    render() {
      if (!this.platform) {
        this.props.router.push("/site/home")
        return null
      }
      let config = this.config
      let list = this.state.list
      return (
        <LayoutPage
          className={`third-game-home`}
          center={config.searchable ? this.renderSearchBar.bind(this, config) : config.title}
          apiLoading={this.state.apiLoading}
          onInfiniteScroll={this.onInfiniteScroll.bind(this)}
          renderFixed={() => <GameNavigatorBar active="home" platform={this.platform} />}
        >
          <div className={`box ${this.platform}`}>
            {list.map((item) => {
              return (
                <div
                  key={item.ID}
                  style={{ width: item.width + "%" }}
                  className={`game-item ${item.width == 100 ? "fullscreen" : ""}`}
                  onClick={this.enterGame.bind(this, item)}
                >
                  <div className="img-wrap" style={{ width: config.imgWidth + "px" }}>
                    <div className="img-box" style={{ paddingBottom: `${(item.imgRatio || config.imgRatio || 1) * 100}%` }}>
                      <p className="img">
                        <img src={util.buildAssetsPath(item.img)} />
                      </p>
                      {item.tag && <span className="tag">{item.tag}游戏</span>}
                    </div>
                  </div>

                  <p className="name">{item.name}</p>
                </div>
              )
            })}
          </div>
          {this.state.promotionListShow && (
            <div className="promotionBg">
              <div className="promotionList">
                <div className="title"></div>
                <div className="content">
                  {this.state.promotionList &&
                    this.state.promotionList.map((item) => {
                      let titleInfo = item.Title.split(":")
                      return (
                        <div
                          key={item.ID}
                          className="listItem"
                          onClick={() => {
                            this.props.router.push("/site/promotionContent", { id: item.ID })
                          }}
                        >
                          <div className={"left color" + titleInfo[0]}>{titleInfo[1]}</div>
                          <div className="right">{titleInfo[2]}</div>
                        </div>
                      )
                    })}
                </div>
                <div
                  className="promotionClose"
                  onClick={(e) => {
                    this.setState({ promotionListShow: false })
                  }}
                >
                  x
                </div>
              </div>
            </div>
          )}
          {this.state.promotionIconShow && this.state.promotionList.length > 0 && (
            <div
              className="promotionIcon"
              onClick={() => {
                this.setState({ promotionListShow: true })
              }}
            >
              <div
                className="closeBtn"
                onClick={(e) => {
                  this.setState({ promotionIconShow: false })
                  e.stopPropagation()
                }}
              >
                x
              </div>
            </div>
          )}
          {this.state.pageEnd && list.length == 0 && <div className="loading end">暂无记录!</div>}
          {this.state.loadingMore && (
            <div className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )}
          {this.state.pageEnd && list.length > this.state.PageSize && <div className="loading end">别扯，到底了</div>}
        </LayoutPage>
      )
    }
  }
)
