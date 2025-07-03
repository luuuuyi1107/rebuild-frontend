import React, { createRef } from "react"
import * as action from "@/action"
import { Icon, ActionSheet, ActionSheetButton } from "react-onsenui"
import LayoutPage from "../LayoutPage"
import Broadcast from "@/components/Broadcast"
import CustomerServiceMsg from "@/components/CustomerServiceMsg"
import * as apiNotification from "@/magic/ApiNotification"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import Bus from "@/magic/EventBus"
import { getPush } from "@/action/apis"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        tabName: props.config.defaultTabName || props.config.tabs[0].name,
        tabOpen: false,
        isFirstLine: true,
        ServiceMsgs: 0,
        validateItems: [],
      }
      this.tabPageRef = createRef()
    }

    componentDidMount() {
      getPush().then((user) => {
        this.setState({ ServiceMsgs: user.Data.MsgCount.Service_Msgs })
      })

      // this.props.config.subject.subscribe({
      //     next: (value) => {
      //         // console.log(value);
      //         // this.setState({ ...this.state });
      //         // this.props.loading = true;
      //     }
      // })
    }

    onTabClick(index, isFirstLine, event) {
      let tab = this.props.config.tabs[index]
      if (tab.link) {
        this.props.router.isLoginToOrRedirect(`/${tab.goWith[0]}/${tab.goWith[1]}`)
      } else {
        this.props.router.replace(this.props.route.pathname, { tab: tab.name })
        this.setState({ tabName: tab.name, tabOpen: false, isFirstLine: isFirstLine })
        this.props.onTabClick && this.props.onTabClick(tab)
      }

      if (this.props.onClearValidateItems) {
        this.props.onClearValidateItems()
      }
    }
    toggerMoreTab() {
      if (this.state.tabOpen) {
        this.setState({ tabOpen: false })
      } else {
        this.setState({ tabOpen: true })
      }
    }
    renderTabs(tabs, config) {
      if (tabs && tabs.length > 0) {
        let list = tabs.sort(function (a, b) {
          return (b.tabOrder || 0) - (a.tabOrder || 0)
        })
        let maxTabShow = config.maxTabShow || tabs.length
        let firstLineNames = []
        for (let i = 0; i < list.length; i++) {
          if (i < maxTabShow) {
            firstLineNames.push(list[i].name)
          }
        }
        return (
          <div className="tabs">
            <ul>
              {list.map((item, index) => {
                if (index < maxTabShow) {
                  return (
                    <li className={this.state.tabName == item.name ? "active" : ""} key={item.name} onClick={this.onTabClick.bind(this, index, true)}>
                      <span>{item.name}</span>
                      {item.messageNumber && this.state.ServiceMsgs != 0 && <span className="messageNumber">{this.state.ServiceMsgs}</span>}
                    </li>
                  )
                }
              })}
              {maxTabShow < tabs.length && (
                <li
                  className={`more-tab-btn ${this.state.isFirstLine || this.state.tabOpen ? "" : "active"}`}
                  key="more"
                  onClick={this.toggerMoreTab.bind(this)}
                >
                  <span>
                    {this.state.isFirstLine || this.state.tabOpen ? "更多" : this.state.tabName}&nbsp;
                    <Icon icon={this.state.tabOpen ? "ion-android-arrow-dropup" : "ion-android-arrow-dropdown"} />
                  </span>
                </li>
              )}
            </ul>
            {maxTabShow < tabs.length && (
              <ul className={`tab-extend ${this.state.tabOpen ? "" : "close"}`}>
                {list.map((item, index) => {
                  if (firstLineNames.indexOf(item.name) == -1) {
                    return (
                      <li
                        className={this.state.tabName == item.name ? "active" : ""}
                        key={item.name}
                        onClick={this.onTabClick.bind(this, index, false)}
                      >
                        <span>{item.name}</span>
                      </li>
                    )
                  }
                })}
              </ul>
            )}
          </div>
        )
      }
      return null
    }

    onInfiniteScroll(done) {
      this.tabPageRef.current?.onInfiniteScroll(done)
    }
    hasFilter(tabConfig) {
      if (tabConfig.filter) {
        let list = tabConfig.filter.filter((item) => item.type != "hidden")
        return list.length > 0
      }
      return false
    }
    render() {
      let tabName = this.state.tabName
      let config = this.props.config
      let tabs = config.tabs
      let currentTab = tabs.filter((item) => item.name == tabName)[0]
      return (
        <LayoutPage
          loading={this.props.loading}
          apiLoading={this.props.apiLoading}
          renderFixed={this.props.renderFixed}
          left={this.props.left}
          right={this.props.right}
          center={this.props.center || "记录统计"}
          className={`record-page ${tabs.length > 1 ? "with-tabs" : ""} ${this.hasFilter(currentTab) ? "with-filter" : ""}  ${this.props.className}`}
          onInfiniteScroll={this.onInfiniteScroll.bind(this)}
        >
          {this.renderTabs(tabs, config)}
          {this.props.topImg || (this.props.topTitle && <div>{this.props.topImg || this.props.topTitle}</div>)}
          <TabPage
            ref={this.tabPageRef}
            tabConfig={currentTab}
            key={tabName}
            onListApiLoaded={this.props.onListApiLoaded}
            subject={this.props.config.subject}
          />
        </LayoutPage>
      )
    }
    reload() {
      this.tabPageRef.current?.loadMore(1)
    }
  }
)

const TabPage = withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        filter: { PageIndex: 1, PageSize: 20 },
        list: [],
        pageEnd: false,
        loadingMore: false,
      }
      this.renderFilter = this.renderFilter.bind(this)
    }

    subscription = null

    componentDidMount() {
      let tabConfig = this.props.tabConfig
      //设置默认filter
      if (tabConfig.filter && tabConfig.filter.length > 0) {
        let filter = Object.assign({}, { PageIndex: 1, PageSize: 20 }, this.state.filter)

        for (let i = 0; i < tabConfig.filter.length; i++) {
          let item = tabConfig.filter[i]
          if (typeof item.defaultValue != undefined) {
            filter[item.key] = item.defaultValue
          }
        }
        this.setState({ filter: filter })
      }

      setTimeout(() => {
        this.loadMore(1)
      }, 0)

      Bus.on(`tab.reload.${tabConfig.name}`, () => this.loadMore(1))

      if (!this.props.subject) return

      this.subscription = this.props.subject.subscribe({
        next: () => {
          // 強迫組件更新
          const list = this.state.list.slice()
          this.setState({ list: [] })
          setTimeout(() => {
            this.setState({ list })
          }, 0)
        },
      })
    }

    componentWillUnmount() {
      if (!!this.subscription) this.subscription.unsubscribe()
      // window.removeEventListener("fetchServiceMessage", this.newMessageEvent.bind(this))
      Bus.off(`tab.reload.${this.props.tabConfig.name}`)
    }

    newMessageEvent() {
      this.loadMore(1)
    }

    renderFilter(tabConfig) {
      if (tabConfig.filter && tabConfig.filter.length > 0) {
        return (
          <div className="filter">
            {tabConfig.filter.map((item) => {
              if (item.type == "date") {
                return (
                  <div className={`fitem type-date ${item.label ? "with-label" : ""}`} key={item.key}>
                    {item.label && <span className="label">{item.label}</span>}
                    <span>{this.state.filter[item.key] || item.placeholder || ""}</span>
                    <Icon icon="ion-android-arrow-dropdown" />
                    <input
                      type="date"
                      onChange={(e) => {
                        let obj = {}
                        obj[item.key] = e.target.value
                        this.onFilterChange(obj)
                      }}
                    />
                  </div>
                )
              }
              if (item.type == "actionSheet") {
                return (
                  <div
                    className={`fitem type-action-sheet ${item.label ? "with-label" : ""}`}
                    key={item.key}
                    onClick={() => {
                      let obj = {}
                      obj["showActionSheet" + item.key] = true
                      this.setState(obj)
                    }}
                  >
                    {item.label && <span className="label">{item.label}</span>}
                    <span>{this.state.filter[item.key] || item.placeholder || ""}</span>
                    <Icon icon="ion-android-arrow-dropdown" />
                    <ActionSheet
                      isOpen={!!this.state["showActionSheet" + item.key]}
                      onCancel={() => {
                        let obj = {}
                        obj["showActionSheet" + item.key] = false
                        this.setState(obj)
                      }}
                      animation="default"
                      className="record-page-action-sheet"
                      isCancelable={true}
                    >
                      {item.options.map((opt, ii) => {
                        return (
                          <ActionSheetButton
                            key={ii}
                            onClick={() => {
                              let obj = {}
                              obj[item.key] = opt.value
                              this.onFilterChange(obj)
                              let o = {}
                              o["showActionSheet" + item.key] = false
                              this.setState(o)
                            }}
                          >
                            {opt.label}
                          </ActionSheetButton>
                        )
                      })}
                      <ActionSheetButton
                        onClick={() => {
                          let obj = {}
                          obj["showActionSheet" + item.key] = false
                          this.setState(obj)
                        }}
                        icon={"md-close"}
                      >
                        取消
                      </ActionSheetButton>
                    </ActionSheet>
                  </div>
                )
              }
            })}
          </div>
        )
      }
      return null
    }

    async loadMore(PageIndex) {
      let tabConfig = this.props.tabConfig
      if (!PageIndex) {
        PageIndex = this.state.filter.PageIndex + 1
      }
      const filter = Object.assign({}, this.state.filter, { PageIndex })
      this.setState({ filter })
      let res = await action[tabConfig.listApiMethod](tabConfig.listApi, filter)
      // const res = await getUserRedsList(this.state.filter);

      if (res.Code != 1) {
        apiNotification.alert(res, { title: "提示" }, this.props)
        return
      }
      if (tabConfig.sort) {
        res.Data = res.Data.sort((a, b) => {
          let key = tabConfig.sort[0]
          return tabConfig.sort[1] == -1 ? b[key] - a[key] : a[key] - b[key]
        })
      }
      let list = Object.assign([], this.state.list)
      if (PageIndex == 1) {
        list = res.Data
      } else {
        list = list.concat(res.Data)
      }

      this.setState({ list: list, pageEnd: res.Data.length < this.state.filter.PageSize ? true : false })
      setTimeout(() => {
        this.props.onListApiLoaded && this.props.onListApiLoaded(list)
      }, 0)
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

    onFilterChange(opt) {
      let filter = Object.assign({}, this.state.filter, opt, { PageIndex: 1 })
      this.setState({ filter: filter })

      setTimeout(() => {
        this.loadMore(1)
      }, 0)
    }

    render() {
      let tabConfig = this.props.tabConfig
      let list = tabConfig.orderRows ? tabConfig.orderRows(this.state.list) : this.state.list

      return (
        <div className="scroll-list-content" id="scrollListContent">
          {this.renderFilter(tabConfig)}
          {tabConfig.customerServiceMsg && <CustomerServiceMsg />}
          {tabConfig.broadcast && <Broadcast />}
          {
            tabConfig.customFirstRow && tabConfig.customFirstRow(list) // 插一个自定义列
          }
          {!this.state.pageEnd && list.length == 0 && (
            <div className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )}
          {this.state.pageEnd && list.length == 0 && <div className="loading">暂无记录</div>}
          {list.map((item, index) => {
            if (tabConfig.noSbSport && item.LotteryID == 43) {
              return
            }
            return (
              <div className={(tabConfig.className ? tabConfig.className + " " : "") + "record-list-item"} key={index}>
                {tabConfig.renderRow && tabConfig.renderRow(item, list, index)}
                {!tabConfig.renderRow && JSON.stringify(item)}
              </div>
            )
          })}
          {this.state.loadingMore && !this.state.pageEnd && (
            <div className="loading">
              <Icon icon="ion-load-d" />
            </div>
          )}
          {this.state.pageEnd && list.length > this.state.filter.PageSize && <div className="loading end">别扯，到底了</div>}
        </div>
      )
    }
  }
)
