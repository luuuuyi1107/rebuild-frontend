import React from "react"

import LayoutPage from "@/components/LayoutPage"
import * as action from "@/action"
import { getArticleList as apiGetArticleList, getBetPostList } from "@/action/apis"
// import { getMyFollow, addFollowById, removeFollowById } from '@/action/apis'

import "./style.scss"
import { Icon, Modal, BackButton } from "react-onsenui"
import util from "@/magic/util"
import Broadcast from "@/components/Broadcast"
import CustomIcon from "@/components/CustomIcon"
import DynamicSvg from "@/components/DynamicSvg"
import forumGames from "@/config/forum"
import LoadingMask from "@/components/LayoutPage/LoadingMask"
import EmptyView from "@/components/EmptyView"
import ForumListItems from "@/components/ForumPoint"
import ForumArticle from "@/components/ForumArticle"
import SearchHotKey from "@/components/SearchHotKey"
import FilterMethod from "@/components/FilterMethod"
import { withRouter } from "@/magic/withRouter"
import classNames from "classnames"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      const formInfoStr = util.cache.get("default_forum_info")
      let support_list = Object.values(forumGames)
      if (!!formInfoStr) {
        const info = JSON.parse(formInfoStr)
        const supportArray = info.PostSet.PostLotteryID.split(",")
        support_list = support_list.filter((item, key) => {
          return supportArray.indexOf(item.id) !== -1
        })
      }
      const forumId = util.getUrlParam("id") || util.cache.get("forum_cur_game_id") || "21" // 21 是 澳门
      // util.cache.remove('forum_cur_game_id');
      const forum_tab = util.cache.get("forum_tab")
      const cur_game = support_list.find((game) => game.id === forumId)
      const cur_tab = forum_tab || cur_game.cur_tab || 0
      delete cur_game.cur_tabl

      if (!!util.getUrlParam("id")) {
        // const url = new URL(window.location.href)
        // url.search = ""
        // const newUrl = url.toString()
        // window.history.replaceState({}, "", newUrl)
        this.props.router.replace(this.props.route.pathname)
      }

      this.state = {
        support_list,
        cur_issue: "0-000",
        cur_game,
        cur_game_name: cur_game.name,
        cur_tab, //0首页，1，查看数，2，最新贴
        cur_page: 1,
        loading: true,
        loadingAni: false,
        list: [],
        articles: [],
        isEnd: false,
        search: "",
        isSearchResult: false,
        isFiltedResult: false,
        filterData: {},
        user: false,
        refeshHotKey: false,
        showLottoType: false,
        showSearch: false,
        showFilter: false,
        showCancelIcon: false,
      }
    }
    pageSize = 6
    scrollLimit = 3
    refetchLimit = 10
    isPc = !/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)
    pop = util.getUrlParam("pop")

    goNewPost() {
      if (!util.isLoginOrNoti(this.props)) return
      this.props.router.push(`/site/ticketNew?id=${this.state.cur_game.id}&from=0`)
    }

    goForumPersonal() {
      if (!util.isLogin()) {
        this.props.router.push(`/site/login`, { redirect: this.props.route.pathname + this.props.route.search })
        return
      }

      this.props.router.push("/site/forumPersonal")
    }

    onMenuClick() {
      this.setState({
        showLottoType: true,
      })
    }

    setDefaultForumLotto(game, cur_tab) {
      util.cache.set("default_forum_lotto", JSON.stringify(Object.assign(game, { cur_tab })))
    }

    onItemSelect(game) {
      if (this.state.loading) return
      // if (this.state.loading) return;
      this.setDefaultForumLotto(game, this.state.cur_tab)
      this.setState({
        cur_tab: 0,
        cur_game: game,
        cur_game_name: game.name,
        cur_page: 1,
        list: [],
        showLottoType: false,
        loading: true,
      })
      util.cache.set("forum_cur_game_id", game.id)

      setTimeout(() => {
        this.scrollContent.scrollTop = 0
        this.loadData(true)
        //更换 彩种后，直接做一次
      }, 500)
    }

    onTabFilterClick(cur_tab) {
      if (this.state.loading || this.state.cur_tab === cur_tab) return
      if (this.state.showSearch || this.state.showFilter) return
      util.cache.set("forum_tab", cur_tab)
      this.setDefaultForumLotto(this.state.cur_game, cur_tab)
      this.setState({
        cur_tab,
        list: [],
        cur_page: 1,
        isEnd: false,
        loading: true,
      })

      setTimeout(() => {
        this.scrollContent.scrollTop = 0
        this.loadData()
      }, 500)
    }

    async componentDidMount() {
      this.handleScrollElement()
      this.handlePageShow()
      this.loadForumInfo()
      // this.loadData(true);
      util.cache.remove("forum_serach")
      if (!!util.cache.get("forum_home")) return

      this.getArticleList()
      this.loadData()
    }

    handleScrollElement() {
      this.scrollContent = document.getElementById("scrollContent")
      this.scrollContent.onscroll = () => {
        if (this.scrollContent.scrollTop + this.scrollContent.clientHeight >= this.scrollContent.scrollHeight - 50) {
          if (!this.state.isEnd && !this.state.loading) {
            this.setState({ cur_page: this.state.cur_page + 1, loading: true, loadingAni: true })

            setTimeout(() => {
              this.loadData().then(() => {
                this.setState({ loadingAni: false })
                this.scrollContent.scrollTo({
                  top: this.scrollContent.scrollTop - 50,
                  behavior: "smooth",
                  duration: 7000,
                })
              })
            }, 400)
          }
        }
      }
    }

    handleForumHome() {
      const _data = util.cache.get("forum_home")
      if (!!_data) {
        const _cick = util.cache.get("forum_article_cick")
        if (!!_cick) {
          _data.articles.forEach((article) => {
            if (_cick.hasOwnProperty(article.ID + "")) article.Cick = _cick[article.ID]
          })
          util.cache.remove("forum_article_cick")
          this.setState({ articles: [] })
        }

        const shouldGetCacheData = this.isPc || this.state.list.length === 0 // PC或mobile device 没有资料的话
        const basicData = { loading: false, articles: _data.articles }
        const cacheData = !shouldGetCacheData
          ? basicData
          : Object.assign(basicData, {
              list: _data.list,
              cur_tab: _data.cur_tab,
              cur_game: _data.cur_game,
              cur_page: _data.cur_page,
              isEnd: _data.isEnd,
              search: _data.search,
              filterData: _data.filterData,
              isSearchResult: _data.isSearchResult,
              isFiltedResult: _data.isFiltedResult,
            })

        this.setState(cacheData, () => {
          if (shouldGetCacheData) this.setScrollPositionAsBefore(_data.scrollTop)
        })
      }
    }

    setScrollPositionAsBefore(scrollTop, time) {
      setTimeout(() => {
        this.scrollContent.scrollTop = scrollTop
        if (this.scrollContent.scrollTop === 0 && this.scrollLimit > 0) {
          this.scrollLimit -= 1
          this.setScrollPositionAsBefore(scrollTop, 5)
        } else {
          this.scrollLimit = 3
        }
      }, time || 0)
    }

    loadForumInfo() {
      //需要定期更新
      action.post("betpost/try").then((res) => {
        if (res.Data != null) {
          util.cache.set("default_forum_info", JSON.stringify(res.Data))
        }
      })
    }

    handlePageShow() {
      this.handleForumHome()
      // util.cache.remove('forum_home');
      if (!!util.cache.get("forum_home")) {
        util.cache.remove("forum_home")
      } else {
        return
      }
      setTimeout(() => {
        this.updateForumListViewNumber()
      }, 0)
    }

    updateForumListViewNumber() {
      const data = {
        lotteryID: this.state.cur_game.id,
        type: 0, // 若是1的话 只取精选
        sortType: this.state.cur_tab, // SORT 预设 0, 查看数 1, 最新帖 2
        cur_page: 1,
        page_size: this.state.list.length,
        // keyword: '中中'
        ...(this.state.search ? { keyword: this.state.search } : {}),
        ...(!!this.state.filterData && !!this.state.filterData.betlx && this.state.filterData.betlx.length > 0 ? this.state.filterData : {}),
      }

      // if (util.cache.get('forum_home'))
      // console.log(util.cache.get('forum_home'));
      getBetPostList(data).then((res) => {
        if (res.Code !== 1) {
          this.handlePrevForumDetail()
          return
        }
        let shouldUpdate = false

        const _list = this.state.list.slice().map((item) => {
          res.Data.some((resItem) => {
            if (item.WatchCount !== resItem.WatchCount && resItem.ID === item.ID) {
              shouldUpdate = true
              item.WatchCount = resItem.WatchCount
            }
            return resItem.ID === item.ID // 直接跳出
          })
          return item
        })
        if (shouldUpdate) this.setState({ list: _list })
      })
    }

    handlePrevForumDetail() {
      // just in case
      setTimeout(() => {
        const prevData = util.cache.get("forum_prevData")
        if (!!prevData) {
          // 表示是从上页返回来的
          const list = this.state.list.slice()
          let shouldChange = false
          list.some((item) => {
            const isExist = item.ID === prevData.ID
            if (isExist && item.LikeCount !== prevData.LikeCount) {
              item.LikeCount = prevData.LikeCount
              shouldChange = true
            }

            if (isExist) {
              item.WinRate = prevData.WinRate
              Object.keys(prevData).forEach((key) => {
                if (item.hasOwnProperty(key) && item[key] != prevData[key]) {
                  shouldChange = true
                  item[key] = prevData[key]
                }
              })
            }
            return isExist // 用来跳脱廻圈
          })
          if (shouldChange) {
            this.setState({ list: [] })
            this.setState({ list })
          }
          util.cache.remove("forum_prevData")
        }
      }, 0)
    }

    getArticleList() {
      apiGetArticleList({ PageIndex: 1, PageSize: 20, id: -6, status: 0, sort: ["PxID", -1] }).then((res) => {
        if (res.Code == 1) {
          this.setState({ articles: res.Data })
        }
      })
    }

    getDetailPageEvent() {
      util.cache.set("forum_home", {
        list: this.state.list,
        articles: this.state.articles,
        cur_tab: this.state.cur_tab,
        cur_game: this.state.cur_game,
        scrollTop: this.scrollContent.scrollTop,
        isEnd: this.state.isEnd,
        cur_page: this.state.cur_page,
        search: this.state.search,
        filterData: this.state.filterData,
        isSearchResult: this.state.isSearchResult,
        isFiltedResult: this.state.isFiltedResult,
      })

      // if (this.isPc) { //pc的话要存缓存

      // } else {
      //     util.cache.set('forum_home', { filterData: this.state.filterData, articles: this.state.articles });
      // }
    }

    loadData(changeType) {
      return new Promise((resolve) => {
        const map = {
          Featured: true,
          lotteryID: this.state.cur_game.id,
          type: 0, // 若是1的话 只取精选
          // ToSort: this.state.cur_tab,
          sortType: this.state.cur_tab, // SORT 预设 0, 查看数 1, 最新帖 2
          cur_page: this.state.cur_page,
          page_size: 6,
          // keyword: '中中'
          ...(!!this.state.search ? { keyword: this.state.search } : {}),
          ...(!!this.state.filterData && !!this.state.filterData.betlx && this.state.filterData.betlx.length > 0 ? this.state.filterData : {}),
        }

        getBetPostList(map)
          .then((res) => {
            const isFiltedResult = map.hasOwnProperty("betlx")

            if (res.Code != 1) {
              if (["搜索关键字长度在", "每次帖子搜索间隔必须"].some((key) => res.Message.startsWith(key))) {
                notificationAsync.alert(res.Message)
                const searchBakup = util.cache.get("forum_serach") || {}
                this.setState({ loading: false, ...searchBakup })
                util.cache.remove("forum_serach")
                return
              }
              if (this.refetchLimit <= 0) {
                notificationAsync.alert(res.Message)
                return
              }
              this.refetchLimit -= 1
              setTimeout(() => {
                this.loadData()
              }, 500)
              return
            }
            this.refetchLimit = 10
            if (res.Data.length === 0 || res.Data.length < this.pageSize) {
              this.setState({ loading: false, isEnd: true, loadingAni: false, isFiltedResult })
              if (res.Data.length === 0) return
            }

            const list = changeType ? res.Data : [...this.state.list, ...res.Data]
            this.setState({
              list,
              loading: false,
              loadingAni: false,
              isFiltedResult,
            })
          })
          .finally(resolve)
      })
      // .finally(resolve);d
    }

    searchMode(showSearch, id) {
      const elementId = id || "searchInput"
      this.setState({ showSearch })
      setTimeout(() => {
        const ele = document.getElementById(elementId)
        if (!!ele) {
          ele.value = this.state.search
          this.setState({ showCancelIcon: !!ele.value })
        }
      }, 0)
      if (!showSearch) {
        const target = document.getElementById(elementId)
        this.searchKeydownEvent({ target, keyCode: 13 })
      }
    }

    searchKeydownEvent(e) {
      // 最终送去搜寻
      const target = e.target // don't know why~couldn't without this
      setTimeout(() => {
        this.setState({ showCancelIcon: !!target.value })
      }, 0)

      if (e.keyCode != 13) return
      if (!target.value) {
        // 没有值就踢出
        this.searchEmptyKeyWord()
        return
      }

      let searchs = util.cache.get("searchs") || []
      if (searchs.length > 0) searchs = searchs.filter((search) => search !== target.value)

      util.cache.set("searchs", searchs.concat(target.value).slice(-30))
      this.setState({ refeshHotKey: false })
      setTimeout(() => {
        util.cache.set("forum_serach", { isEnd: this.state.isEnd, filterData: this.state.filterData, list: this.state.list })
        this.setState({ search: target.value, refeshHotKey: true, filterData: {}, list: [], isEnd: false })
        this.onItemSelect(this.state.cur_game)
      }, 0)
    }

    applySearchValue(search, id) {
      const elementId = id || "searchInput"
      this.setState({ search, showCancelIcon: !!search })
      document.getElementById(elementId).value = search

      if (!!search) {
        this.setState({ isSearchResult: true })
        const target = document.getElementById(elementId)
        this.setState({ showSearch: false })
        this.searchKeydownEvent({ target, keyCode: 13 })
        return
      }

      this.searchEmptyKeyWord()
    }

    searchEmptyKeyWord() {
      const searchBar = document.getElementById("searchBar")
      searchBar.classList.add("shaking")
      setTimeout(() => {
        searchBar.classList.remove("shaking")
      }, 500)
    }

    clickSearchIcon(id) {
      const searchBar = document.getElementById("searchBar")
      if (!searchBar || Array.from(searchBar.classList).includes("shaking")) return
      const elementId = id || "searchInput"
      const ele = document.getElementById(elementId)
      this.applySearchValue(ele.value, elementId)
    }

    applyFilter(data) {
      delete data.betpx // 先移除 未来可能会用到
      this.setState({ filterData: Object.assign(data, { lotteryid: this.state.cur_game.id }), search: "", isEnd: false })
      this.onItemSelect(this.state.cur_game)
    }

    render() {
      const sortSession = (
        <div className="filter">
          <div className="list_filter">
            {["首页", "查看数", "最新帖"].map((text, index) => (
              <div className={`tab_main ${this.state.cur_tab == index ? "sel" : ""}`} onClick={this.onTabFilterClick.bind(this, index)}>
                <DynamicSvg style={{ width: 18, height: 18 }} svgPath={`forum/tab_${index + 1}${this.state.cur_tab === index ? "_sel" : ""}`} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )

      return (
        <LayoutPage
          className={classNames("site_forum", "forum_center", {
            "search-mode": this.state.showSearch || this.state.isSearchResult,
            "filter-mode": this.state.showFilter,
          })}
          center={
            this.state.showSearch || this.state.isSearchResult ? (
              "　"
            ) : (
              <div onClick={this.onMenuClick.bind(this)} className="forum_center_center_bar">
                <div className="title">{this.state.cur_game_name === "" ? "未选择" : this.state.cur_game_name}</div>
                <CustomIcon style={{ width: 10, height: 10 }} type={require("./icons/caret-down.svg")} />
              </div>
            )
          }
          left={
            !(this.state.showSearch || this.state.isSearchResult) ? (
              <BackButton
                onClick={() => {
                  this.props.router.push("/site/home")
                }}
              >
                返回
              </BackButton>
            ) : (
              <div className="search-bar" id="searchBar">
                <div className="inner">
                  <div
                    className="search-cancel"
                    onClick={() => {
                      this.setState({ isSearchResult: false, showSearch: false, search: "" })
                      setTimeout(() => {
                        this.searchMode(false)
                      }, 300)
                    }}
                  >
                    <Icon icon="ion-ios-arrow-left" />
                  </div>
                  <div className="search-inner">
                    <img style={{ width: 15, height: 15 }} className="search-icon" src={util.buildAssetsPath("assets/icons/search-icon.svg")} />
                    <input type="text" id="searchInput" defaultValue={this.state.search} onKeyDown={this.searchKeydownEvent.bind(this)} />
                    {this.state.showCancelIcon && (
                      <img
                        className="clear-icon"
                        onClick={this.applySearchValue.bind(this, "", "searchInput")}
                        src={util.buildAssetsPath("assets/icons/search-remove.svg")}
                      />
                    )}
                  </div>
                  <div className="search-text" onClick={this.clickSearchIcon.bind(this, "searchInput")}>
                    搜索
                  </div>
                </div>
              </div>
            )
          }
          right={
            this.state.showSearch || this.state.isSearchResult ? null : (
              <div>
                <Icon icon="ion-search" className="icon_right" onClick={this.searchMode.bind(this, true, null)} />
                <Icon icon="ion-person" className="icon_right" onClick={this.goForumPersonal.bind(this)} />
              </div>
            )
          }
          renderFixed={() => (
            <div className="float_button" onClick={this.goNewPost.bind(this)}>
              发帖
            </div>
          )}
        >
          <Broadcast />

          {!this.state.showSearch && !this.state.isSearchResult && sortSession}

          {!this.state.isSearchResult && (
            <FilterMethod
              passFilterList={this.applyFilter.bind(this)}
              setFilter={(showFilter) => {
                this.setState({ showFilter })
              }}
            />
          )}

          <SearchHotKey refresh={this.state.refeshHotKey} show={this.state.showSearch} applySearchKey={this.applySearchValue.bind(this)} />

          {/* className={`content ${this.state.list.length === 0 ? 'none':''}`} */}
          <div className="content" id="scrollContent">
            {this.state.list.length === 0 && this.state.loading ? (
              <LoadingMask />
            ) : (
              <div
                className={classNames("forum-inner", {
                  loading: this.state.loadingAni,
                  ending: this.state.isEnd,
                  nodata: this.state.list.length === 0,
                })}
              >
                {
                  // 仅在首页显示 观看数 及最新 不出现
                  this.state.cur_tab === 0 &&
                    !this.state.isSearchResult &&
                    !this.state.isFiltedResult &&
                    this.state.articles.map((article) => (
                      <ForumArticle
                        key={article.ID + "_" + article.Cick}
                        item={article}
                        gameName={this.state.cur_game_name}
                        onGetDetailPageEvent={this.getDetailPageEvent.bind(this)}
                      />
                    ))
                }

                {this.state.list.map((item, key) => (
                  <ForumListItems
                    key={key}
                    item={item}
                    cur_issue={this.state.cur_issue}
                    cur_game={this.state.cur_game}
                    onGetDetailPageEvent={this.getDetailPageEvent.bind(this)}
                  />
                ))}

                {this.state.list.length === 0 && <EmptyView imgId={3} desc={"没有匹配的帖子，请重新搜寻"} />}

                {this.state.isEnd && this.state.list.length > 0 && <div className="end">到底了</div>}

                {this.state.loadingAni && <div className="loading-bar">LOADING</div>}
              </div>
            )}
          </div>
          {/* 弹框接口 - */}
          <Modal
            isOpen={this.state.showLottoType}
            className="lotto_modal"
            animation="lift"
            onClick={() => {
              this.setState({ showLottoType: false })
            }}
          >
            <div className="modal-inner">
              {this.state.support_list.map((game) => (
                <div className="setItem" key={game.id} onClick={this.onItemSelect.bind(this, game)}>
                  <span className="inline">{game.name}</span>
                </div>
              ))}
            </div>
          </Modal>
        </LayoutPage>
      )
    }
  }
)
