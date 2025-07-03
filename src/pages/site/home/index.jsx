import { apiHandler } from "@/action"
import { getArticleList, getBank, getBetPostList, getPush } from "@/action/apis"
import Broadcast from "@/components/Broadcast"
import CarouselImg from "@/components/CarouselImg"
import CustomerServiceMsg from "@/components/CustomerServiceMsg"
import DraggableComp from "@/components/DraggableComp"
import FavoriteButton from "@/components/FavoriteButton"
import ForumBanner from "@/components/ForumBanner"
import ForumTopTwo from "@/components/ForumTopTwo"
import HomeNavigatorBar from "@/components/HomeNavigatorBar"
import InfoManager from "@/components/InfoManager"
import LayoutPage from "@/components/LayoutPage"
import SmartList from "@/components/ListDetail"
import ModalPage from "@/components/ModalPage"
import SliderCarousel from "@/components/SliderCarousel"
import UserStatus from "@/components/UserStatus"
import config from "@/config/config"
import { ORDER_PAYMENT } from "@/config/payment"
import util from "@/magic/util"
import { withRouter } from "@/magic/withRouter"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import _ from "lodash"
import React, { createRef } from "react"
import { Carousel, CarouselItem, Icon } from "react-onsenui"
import tabs from "./gameConfig"
import LotteryItem from "./lotteryItem"
import "./style.scss"
import TopMenu from "./topMenu"
import Bus from "@/magic/EventBus"
import EmojiProvider from "@/contexts/EmojiContext"
import { notificationAsync } from "@/magic/notification"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      const active = util.cache.get("home-carousel-index", "session") || 0
      this.state = {
        Broadcast: null,
        active,
        isShowPopup: false,
        popNotice: [],
        msgNotice: [],
        // managerNoticeState: "none",
        noticeIndex: 0,
        serverLink: "",
        lotterySecond: "热门彩",
        sliders: null,
        currentTab: active,
        lotterySecondNumner: {},
        forums: [],
        favoriteGames: [],
      }
      this.remBase = parseInt(document.documentElement.style.fontSize)
      this.gameListRef = createRef()
      this.customerMsgRef = createRef()
    }

    componentDidMount() {
      FingerprintJS.load()
        .then((fp) => fp.get())
        .then((result) => {
          localStorage.setItem("cur-device-id", result.visitorId)
        })

      document.body.addEventListener(
        "touchmove",
        function (event) {
          event.preventDefault()
        },
        false
      )
      const lotterySecondNumner = tabs[0].list.reduce(
        (acc, game) => {
          if (game.hot) acc["热门彩"] += 1
          if (!acc.hasOwnProperty(game.lotterySecond[0])) acc[game.lotterySecond[0]] = 0
          acc[game.lotterySecond[0]] += 1
          return acc
        },
        { 热门彩: 0 }
      )
      this.setState({ lotterySecondNumner })
      this.loadFront()
      if (import.meta.env.VITE_FORUM_ENABLE === "true") this.getForumTop2Data()
      window.addEventListener("pageshow", () => {
        this.customerMsgRef.current?.update({})
      })

      util.cache.remove("pushCount")
      if (util.isLogin()) {
        setTimeout(() => {
          const favoriteGames = util.cache.get(util.getUserId() + "_favoriteGames") ?? []
          if (favoriteGames.length === 0) return
          this.setState({ favoriteGames })
        }, 0)
      }
    }

    getForumTop2Data() {
      const data = {
        lotteryID: 21,
        type: 0, // 若是1的话 只取精选
        sortType: 0, // SORT 预设 0, 查看数 1, 最新帖 2
        cur_page: 1,
        page_size: 2,
      }

      getBetPostList(data).then((res) => {
        if (res.Code !== 1) return
        this.setState({ forums: res.Data })
      })
    }

    async loadFront() {
      const [articleRes, res, filterLX] = await Promise.all([
        apiHandler(() => getArticleList({ id: -3, status: 0 })),
        apiHandler(() => getPush({ keys: ["noticelist", "servicelink"], PageIndex: 1, PageSize: 99, status: 0 })),
        fetch("/public/special_domain.txt")
          .then((res) => res.text())
          .then((text) => text.split(/\r\n|\r|\n/))
          .then((urls) =>
            _(urls)
              .filter((x) => x)
              .map((x) => x.trim())
              .uniq()
              .some((url) => location.origin.includes(url))
              ? [0, 1]
              : [0]
          ),
      ])

      const list = res.Data.NoticeList.filter((item) => filterLX.includes(item.LX))

      this.setState({
        serviceLink: util.cache.get("serviceLink") || res.Data.ServiceLink,
        sliders: articleRes.Data,
        popNotice: list,
        isShowPopup: util.cache.getCookie("home-pop-notice-close") ? false : list.length > 0,
      })
    }
    async loadBankCard() {
      util.trialCheck()

      let bankCardRes = await apiHandler(() => getBank())
      if (bankCardRes.Data.filter((bank) => bank.CType === ORDER_PAYMENT.BANK.C_TYPE).length == 0) {
        notificationAsync.alert("请先设置银行卡", { title: "操作提示" }).then(() => {
          this.props.router.isLoginToOrRedirect("/site/setBankCard")
        })
      } else {
        this.props.router.isLoginToOrRedirect("/site/withdraw")
      }
    }
    gameMenuClick(view, index) {
      let carouselGames = document.getElementById("carouselGames")
      carouselGames.setActiveIndex(index)
      this.setState({
        active: index,
        currentTab: index,
      })
    }

    secMenuClick(type) {
      if (this.state.lotterySecond != type) {
        this.setState({ lotterySecond: type })
        let remBase = this.remBase
        let gameList = this.gameListRef.current
        let minHeight = window.innerHeight - gameList.offsetTop - 1.75 * remBase
        let row = Math.round(this.state.lotterySecondNumner[type] / 2)
        const colHeight = document.querySelector(".col").offsetHeight
        const footerHeight = 46
        const tabHeight = 40
        gameList.style.height = Math.max(row * colHeight + footerHeight + tabHeight, minHeight) + "px"
      }
    }

    getForumPage() {
      this.props.router.push("/site/forum")
    }

    addToFavorities(gameId) {
      if (!util.isLogin()) {
        this.props.router.push("/site/login")
        return
      }
      let newFavoriteGames = this.state.favoriteGames
      if (newFavoriteGames.includes(gameId)) {
        newFavoriteGames = newFavoriteGames.filter((id) => id !== gameId)
      } else {
        newFavoriteGames = [...newFavoriteGames, gameId]
      }

      if (newFavoriteGames.length > 10) {
        notificationAsync.alert("收藏数量已达上限")
        return
      }

      this.setState({ favoriteGames: newFavoriteGames })
      util.cache.set(util.getUserId() + "_favoriteGames", newFavoriteGames)
    }

    render() {
      return (
        <>
          <LayoutPage
            className="site-home"
            left={
              <div className="logo">
                <img src={util.buildAssetsPath("/assets/logo.gif")} />
              </div>
            }
            center={<span></span>}
            right={<UserStatus />}
            renderFixed={() => <HomeNavigatorBar active="home" />}
          >
            {!!util.isLogin() && (
              <DraggableComp
                onClick={() => {
                  this.props.router.isLoginToOrRedirect("/interaction/rewardsCenter")
                }}
                position={{ x: Math.min(window.innerWidth, 600) - 52, y: Math.min(window.innerWidth, 600) }}
                bounds={{ left: 0, right: Math.min(window.innerWidth, 600) - 52, top: 0, bottom: window.innerHeight - 150 }}
              >
                <img className="w-[52px] pointer-events-auto" src={util.buildAssetsPath("images/interaction/coupon/reward-center.png")} />
              </DraggableComp>
            )}
            {config.homeCarousel && config.homeCarousel.length && <CarouselImg />}
            {this.state.sliders?.length > 0 ? <SliderCarousel sliders={this.state.sliders} /> : <div className="slider-skeleton" />}

            <TopMenu loadBankCard={this.loadBankCard.bind(this)} />

            <CustomerServiceMsg ref={this.customerMsgRef} />
            <EmojiProvider>
              <Broadcast />
            </EmojiProvider>

            {this.state.forums.length > 0 && <ForumTopTwo callback={this.getForumPage.bind(this)} items={this.state.forums} />}

            <ForumBanner />

            <div className="sized-box"></div>

            <div className="content">
              <div className="menu tabs">
                {tabs.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      className={`tab ${item.id} ${index == this.state.active ? "active" : ""}`}
                      onClick={this.gameMenuClick.bind(this, item, index)}
                    >
                      <div className="icon">{item.icon}</div>
                      <p>{item.title}</p>
                    </div>
                  )
                })}
              </div>
              <div className={`game-list active-${this.state.currentTab}`} id="game-list" ref={this.gameListRef}>
                <Carousel
                  index={this.state.active}
                  id="carouselGames"
                  onPostChange={(event) => {
                    util.cache.set("home-carousel-index", event.activeIndex, "session")
                    this.setState({ active: event.activeIndex, currentTab: event.activeIndex })
                  }}
                  swipeable={util.platform.isWap()}
                  // swipeable={false}
                  autoScroll
                  autoScrollRatio={0.1}
                  overscrollable
                  fullscreen
                  itemHeight={this.state.carouselHeight}
                  onSwipe={_.throttle((event, e) => {
                    let remBase = this.remBase
                    let index = parseInt(event.index)
                    let gameList = this.gameListRef.current
                    let minHeight = window.innerHeight - gameList.offsetTop - 1.75 * remBase
                    if (tabs[index]) {
                      let row = Math.round(tabs[index].list.length / 2)
                      const colHeight = document.querySelector(".col").offsetHeight
                      const footerHeight = 46
                      const tabHeight = 40
                      if (tabs[index].id == "lottory") {
                        row = Math.round(this.state.lotterySecondNumner[this.state.lotterySecond] / 2)
                        gameList.style.height = Math.max(row * colHeight + footerHeight + tabHeight, minHeight) + "px"
                      } else {
                        gameList.style.height = Math.max(row * colHeight + footerHeight, minHeight) + "px"
                      }
                    }
                  }, 300)}
                >
                  {tabs.map((item, index) => {
                    const isLottery = item.id === "lottory"
                    const gameList = item.list

                    return (
                      <CarouselItem key={item.id} className={`${item.id}-list`}>
                        {item.id == "lottory" && (
                          <div className="secMenu">
                            <span className={this.state.lotterySecond == "热门彩" ? "on" : ""} onClick={() => this.secMenuClick("热门彩")}>
                              热门彩
                            </span>
                            <span className={this.state.lotterySecond == "时时彩" ? "on" : ""} onClick={() => this.secMenuClick("时时彩")}>
                              时时彩
                            </span>
                            <span className={this.state.lotterySecond == "pk10" ? "on" : ""} onClick={() => this.secMenuClick("pk10")}>
                              pk10
                            </span>
                            <span className={this.state.lotterySecond == "六合彩" ? "on" : ""} onClick={() => this.secMenuClick("六合彩")}>
                              六合彩
                            </span>
                            <span className={this.state.lotterySecond == "冷门彩" ? "on" : ""} onClick={() => this.secMenuClick("冷门彩")}>
                              冷门彩
                            </span>
                          </div>
                        )}

                        <div className="row">
                          {isLottery ? (
                            <LotteryItem
                              lotteries={gameList}
                              type={this.state.lotterySecond}
                              favoriteGames={this.state.favoriteGames}
                              addToFavorities={this.addToFavorities.bind(this)}
                            />
                          ) : (
                            gameList.map((game, i) => {
                              return (
                                <div className="col relative" key={game.id}>
                                  <div
                                    className={`game-item ${game.id}`}
                                    onClick={() => {
                                      if (game.directJumpToThird) {
                                        util.cache.set("isJumpingThirdGame", Date.now())
                                        Bus.emit("getPush.stop")
                                        util
                                          .jumpToThirdGame(game)
                                          .then((res) => {
                                            Bus.emit("getPush.start")
                                            util.cache.remove("isJumpingThirdGame")
                                          })
                                          .catch((err) => {
                                            Bus.emit("getPush.start")
                                            util.cache.remove("isJumpingThirdGame")
                                            notificationAsync.alert(err, { title: "操作提示", buttonLabels: ["返回", "确定"] }).then((index) => {
                                              if (index === 0) return
                                              this.props.router.push("/site/login")
                                            })
                                          })
                                        return
                                      }
                                      this.props.router.push(game.link, game.params)
                                    }}
                                  >
                                    <div className="box l-box">
                                      <i className={`game-icon ${game.id}-icon`} />
                                    </div>
                                    <div className="box r-box">
                                      <p>{game.name}</p>
                                      <p>{game.text}</p>
                                    </div>
                                  </div>
                                  {!!util.isLogin() && (
                                    <FavoriteButton
                                      onClick={this.addToFavorities.bind(this, game.id)}
                                      active={this.state.favoriteGames.includes(game.id)}
                                    />
                                  )}
                                </div>
                              )
                            })
                          )}
                        </div>
                      </CarouselItem>
                    )
                  })}
                </Carousel>
              </div>
            </div>

            <ModalPage isOpen={this.state.isShowPopup} className="pop-notice-modal" animation="easeOutBounce">
              <div className="modal__content">
                <div className="modal-inner">
                  <div className="platform-notice">平台公告</div>
                  <SmartList items={this.state.popNotice} />
                  <div className="closeBtn">
                    <div
                      className="close"
                      onClick={() => {
                        this.setState({
                          isShowPopup: false,
                        })
                      }}
                    >
                      关闭
                    </div>
                    <div
                      className="allDay"
                      onClick={() => {
                        this.setState({
                          isShowPopup: false,
                        })
                        util.cache.setCookie("home-pop-notice-close", true, "tomorrow")
                      }}
                    >
                      不再提醒
                    </div>
                  </div>
                </div>
              </div>
            </ModalPage>

            <InfoManager />
          </LayoutPage>
        </>
      )
    }
  }
)
