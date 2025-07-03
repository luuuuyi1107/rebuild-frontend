import React, { createRef } from "react"
import { Icon } from "react-onsenui"
import LayoutPage from "../LayoutPage"
import TabPage from "./TabPage"
import "./style.scss"
import { getUserRedsList, getUserRedType, getPush } from "@/action/apis"
import { withRouter } from "@/magic/withRouter"
import { get, orderBy } from "lodash"

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        tabName: props.config.defaultTabName || props.config.tabs[0].name,
        subTabName: "",
        tabOpen: false,
        isFirstLine: true,
        ServiceMsgs: 0,
        validateItems: [],
        subtabs: [],
        loading: false,
        hasMore: true,
        redsData: [],
      }
      this.tabPageRef = createRef()
      this.PageSize = props.config.PageSize || 20
      this.PageIndex = 1

      this.verifyCode = {
        captchaId: "",
        captchaId2: "",
      }
    }

    // 新增：生成 sessionStorage 的 key
    getSessionStorageKey(tabName, subTabName) {
      const key = `redsData_${tabName}_${subTabName || "default"}`
      return key
    }

    // 新增：从 sessionStorage 读取资料
    getDataFromSessionStorage(tabName, subTabName) {
      try {
        const key = this.getSessionStorageKey(tabName, subTabName)
        const storedData = sessionStorage.getItem(key)
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          return parsedData.data || []
        }
      } catch (error) {
        console.error("从 sessionStorage 读取资料失败:", error)
      }
      return []
    }

    // 新增：将资料存到 sessionStorage
    saveDataToSessionStorage(tabName, subTabName, data, pageIndex) {
      try {
        if (pageIndex === 1) {
          const key = this.getSessionStorageKey(tabName, subTabName)
          const dataToStore = {
            data: data,
            timestamp: Date.now(),
            pageIndex: pageIndex,
          }
          sessionStorage.setItem(key, JSON.stringify(dataToStore))
        }
      } catch (error) {
        console.error("存储资料到 sessionStorage 失败:", error)
      }
    }

    getFetchData(tabIndex, _currentSubTab) {
      const currentTab =
        tabIndex !== null && tabIndex !== undefined
          ? this.props.config.tabs[tabIndex]
          : this.props.config.tabs.find((item) => item.name == this.state.tabName)
      const data = {}
      if (currentTab && currentTab.filter.length > 0) {
        const filter = get(currentTab, "filter[0]", [])
        const type = filter.key
        const value = filter["defaultValue"]
        data[type] = value
      }
      if (_currentSubTab) {
        data["RedTypeID"] = _currentSubTab.RedTypeID
        data["PageSize"] = this.PageSize
        data["PageIndex"] = this.PageIndex
      }
      return data
    }

    getSubTabData(data) {
      const subtabs = data.map((item) => ({
        ...item,
        name: item.Name,
        RedTypeID: item.ID,
      }))

      const subTabName = subtabs.length > 0 ? subtabs[0].name : ""
      return { subtabs, subTabName }
    }

    componentDidMount() {
      this.init()
    }

    get currentSubTab() {
      const currentSubTab = this.state.subtabs.find((item) => item.name == this.state.subTabName)
      return currentSubTab || this.state.subtabs[0]
    }

    async init() {
      const [pushRes, redRes] = await Promise.all([getPush({ keys: "userset" }), getUserRedType()])
      const ServiceMsgs = pushRes.Data.MsgCount.Service_Msgs || 0
      this.verifyCode.captchaId = pushRes.Data.UserSet.CaptchaId || ""
      this.verifyCode.captchaId2 = pushRes.Data.UserSet.CaptchaId2 || ""
      const { subtabs, subTabName } = this.getSubTabData(orderBy(redRes.Data, "SortID").filter((item) => item.ID !== 0))

      // 修改：先尝试从 sessionStorage 取得资料
      const cachedData = this.getDataFromSessionStorage(this.state.tabName, subTabName)
      if (cachedData.length > 0) {
        this.setState({ redsData: cachedData, subtabs, subTabName })
      } else {
        this.setState({ loading: true })
      }

      const redsRes = await getUserRedsList(this.getFetchData(null, subtabs[0]))
      // 存储到 sessionStorage (PageIndex = 1)
      this.saveDataToSessionStorage(this.state.tabName, subTabName, redsRes.Data, 1)
      this.setState({
        ServiceMsgs,
        subtabs,
        subTabName,
        redsData: redsRes.Data,
        hasMore: redsRes.Data.length >= this.PageSize,
      })
    }

    onTabClick(index, isFirstLine, event) {
      let tab = this.props.config.tabs[index]
      if (tab.link) {
        this.isLoginToOrRedirect(`/${tab.goWith[0]}/${tab.goWith[1]}`)
      } else {
        console.log(this.currentSubTab)
        this.setState({ tabName: tab.name, tabOpen: false, isFirstLine: isFirstLine })
        this.props.onTabClick && this.props.onTabClick(tab)

        const cachedData = this.getDataFromSessionStorage(tab.name, this.currentSubTab.name)
        this.setState({ loading: cachedData.length === 0, subTabName: this.currentSubTab.name, redsData: cachedData })
        const data = this.getFetchData(index, this.currentSubTab)
        getUserRedsList(data)
          .then((redsRes) => {
            // 存储到 sessionStorage (PageIndex = 1)
            this.saveDataToSessionStorage(tab.name, this.currentSubTab.name, redsRes.Data, 1)
            this.setState({ hasMore: redsRes.Data.length >= this.PageSize, loading: false, redsData: redsRes.Data })
          })
          .catch(() => {
            this.setState({ loading: false })
          })
          .finally(() => {
            this.PageIndex = 1
          })
      }

      if (this.props.onClearValidateItems) {
        this.props.onClearValidateItems()
      }

      this.props.onTabChangeEvent()
    }

    onSubTabClick(tab, event) {
      if (tab.link) {
        this.isLoginToOrRedirect(`/${tab.goWith[0]}/${tab.goWith[1]}`)
      } else {
        // 先尝试从 sessionStorage 取得资料
        const cachedData = this.getDataFromSessionStorage(this.state.tabName, tab.name)
        this.setState({ subTabName: tab.name, loading: cachedData.length === 0, redsData: cachedData })
        const data = this.getFetchData(null, tab)
        getUserRedsList(data)
          .then((redsRes) => {
            // 存储到 sessionStorage (PageIndex = 1)
            this.saveDataToSessionStorage(this.state.tabName, tab.name, redsRes.Data, 1)
            this.setState({ loading: false, hasMore: redsRes.Data.length >= this.PageSize, redsData: redsRes.Data })
          })
          .catch(() => {
            this.setState({ loading: false })
          })
          .finally(() => {
            this.PageIndex = 1
          })
      }
    }

    onFilterEventChange(filter) {
      const data = this.getFetchData()
      getUserRedsList({ ...data, ...filter })
        .then((redsRes) => {
          // 存储到 sessionStorage (PageIndex = 1)
          this.saveDataToSessionStorage(this.state.tabName, this.state.subTabName, redsRes.Data, 1)
          this.setState({ loading: false, hasMore: redsRes.Data.length >= this.PageSize, redsData: redsRes.Data })
        })
        .catch(() => {
          this.setState({ loading: false })
        })
        .finally(() => {
          this.PageIndex = 1
        })
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

    renderSubTabs(tabs, config) {
      return (
        <div className="subtabs bg-white">
          {tabs.map((tab) => (
            <div
              className={"sub-tab" + (this.state.subTabName === tab.name ? " active" : "")}
              key={tab.name}
              onClick={this.onSubTabClick.bind(this, tab)}
            >
              <span>{tab.name}</span>
            </div>
          ))}
        </div>
      )
    }

    onInfiniteScroll(done) {
      if (!this.state.hasMore) {
        setTimeout(() => {
          done()
        }, 30 * 1000)
        return
      }

      this.PageIndex += 1

      const data = this.getFetchData()
      this.setState({ loading: true })
      getUserRedsList(data)
        .then((redsRes) => {
          this.setState({
            hasMore: redsRes.Data.length >= this.PageSize,
            redsData: this.state.redsData.concat(redsRes.Data),
          })
        })
        .catch(() => {
          this.setState({ loading: false })
        })
      setTimeout(() => {
        done()
      }, 500)
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
      let currentTab = tabs.filter((item) => item.name == this.state.tabName)
      const subtabs = this.state.subtabs || []
      // const currentSubTab = subtabs.find((item) => item.name == this.state.subTabName)
      const subject = config.subject
      const tabIdx = tabs.findIndex((tab) => tab.name === tabName)
      const subIndex = subtabs.findIndex((tab) => tab.name === this.state.subTabName)
      currentTab = currentTab[0]
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
          {subtabs.length > 0 && this.renderSubTabs(subtabs, config)}
          {this.props.topImg || (this.props.topTitle && <div>{this.props.topImg || this.props.topTitle}</div>)}
          <TabPage
            key={tabName + "_" + this.state.subTabName + "_" + this.state.redsData.length}
            loadingMore={this.state.loading}
            tabIdx={tabIdx}
            subIndex={subIndex}
            ref={this.tabPageRef}
            tabConfig={currentTab}
            currentSubTab={this.currentSubTab}
            onListApiLoaded={this.props.onListApiLoaded}
            subject={subject}
            validateObject={this.props.validateObject}
            list={this.state.redsData}
            verifyCode={this.verifyCode}
            hasMore={this.state.hasMore}
            onTabChangeEvent={this.onFilterEventChange.bind(this)}
          />
        </LayoutPage>
      )
    }
    reload() {
      this.tabPageRef.current?.loadMore(1)
    }
  }
)
