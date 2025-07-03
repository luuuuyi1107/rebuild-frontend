import { useState, useRef, useEffect, useMemo } from "react"
import { withRouter } from "@/magic/withRouter"
import { Icon, ActionSheet, ActionSheetButton } from "react-onsenui"
import Bus from "@/magic/EventBus"
import Broadcast from "@/components/Broadcast"
import CustomerServiceMsg from "@/components/CustomerServiceMsg"
import ObsverComp from "@/components/ObsverComp"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import util from "@/magic/util"

export default withRouter((props) => {
  const [filter, setFilter] = useState({ PageIndex: 1, PageSize: 20 })
  const [list, setList] = useState([])
  const [pageEnd, setPageEnd] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [reload, setReload] = useState(false)
  const subscription = useRef(null)
  const renderList = useMemo(() => {
    return props.tabConfig.orderRows ? props.tabConfig.orderRows(list) : list
  })

  useEffect(() => {
    let tabConfig = props.tabConfig

    //设置默认filter
    if (tabConfig.filter && tabConfig.filter.length > 0) {
      let _filter = Object.assign({}, { PageIndex: 1, PageSize: 20 }, filter)

      tabConfig.filter.forEach((item) => {
        if (item.hasOwnProperty("defaultValue")) {
          _filter[item.key] = item.defaultValue
        }
      })
      setFilter(_filter)
    }

    setTimeout(() => {
      setReload(true)
    }, 10)

    Bus.on(`tab.reload.${tabConfig.name}`, () => loadMore(1))

    if (!props.subject) return

    subscription.current = props.subject.subscribe({
      next: () => {
        // 强迫组件更新
        const _list = list.slice()
        setList([])
        setTimeout(() => {
          setList(_list)
        }, 0)
      },
    })

    return () => {
      if (!!subscription.current) subscription.current.unsubscribe()
      Bus.off(`tab.reload.${props.tabConfig.name}`)
    }
  }, [])

  useEffect(() => {
    if (!reload) return
    loadMore(1)
    setReload(false)
  }, [reload])

  function renderFilter(tabConfig) {
    if (tabConfig.filter && tabConfig.filter.length > 0) {
      return (
        <div className="filter">
          {tabConfig.filter.map((item) => {
            if (item.type == "date") {
              return (
                <div className={`fitem type-date ${item.label ? "with-label" : ""}`} key={item.key}>
                  {item.label && <span className="label">{item.label}</span>}
                  <span>{filter[item.key] || item.placeholder || ""}</span>
                  <Icon icon="ion-android-arrow-dropdown" />
                  <input
                    type="date"
                    onChange={(e) => {
                      let obj = {}
                      obj[item.key] = e.target.value
                      onFilterChange(obj)
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
                    // let obj = {}
                    // obj["showActionSheet" + item.key] = true
                    // this.setState(obj)
                  }}
                >
                  {item.label && <span className="label">{item.label}</span>}
                  <span>{filter[item.key] || item.placeholder || ""}</span>
                  <Icon icon="ion-android-arrow-dropdown" />
                  <ActionSheet
                    isOpen={!!this.state["showActionSheet" + item.key]}
                    onCancel={() => {
                      // let obj = {}
                      // obj["showActionSheet" + item.key] = false
                      // this.setState(obj)
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
                            // let obj = {}
                            // obj[item.key] = opt.value
                            // this.onFilterChange(obj)
                            // let o = {}
                            // o["showActionSheet" + item.key] = false
                            // this.setState(o)
                          }}
                        >
                          {opt.label}
                        </ActionSheetButton>
                      )
                    })}
                    <ActionSheetButton
                      onClick={() => {
                        // let obj = {}
                        // obj["showActionSheet" + item.key] = false
                        // this.setState(obj)
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

  async function loadMore(PageIndex) {
    const tabConfig = props.tabConfig

    const storageKey = `${tabConfig.name}_data` // 唯一的储存键值
    const now = Date.now() // 当前时间戳
    const KEEP_TIME = 30 * 1000 // 30秒

    if (!PageIndex) {
      PageIndex = filter.PageIndex + 1
    }

    const storedData = util.cache.get(storageKey, "session")

    // 如果有储存的资料且时间小于 3 小时，直接使用储存的资料
    if (!!storedData && storedData.timestamp && storedData.pageIndex >= PageIndex) {
      setList(storedData.list)
      setPageEnd(storedData.pageEnd)
      setFilter(storedData.filter)
      if (now - storedData.timestamp < KEEP_TIME) {
        return
      }
    }

    const _filter = Object.assign({}, filter, { PageIndex })

    setFilter(_filter)

    let res = await action[tabConfig.listApiMethod](tabConfig.listApi, _filter)
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
    let _list = Object.assign([], list)
    if (PageIndex == 1) {
      _list = res.Data
    } else {
      _list = _list.concat(res.Data)
    }
    setList(_list)
    setPageEnd(res.Data.length < filter.PageSize ? true : false)

    // 储存资料到 sessionStorage
    const dataToStore = {
      list: _list,
      pageEnd: res.Data.length < filter.PageSize,
      filter: _filter,
      pageIndex: PageIndex,
      timestamp: now, // 储存当前时间戳
    }

    //sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
    util.cache.set(storageKey, dataToStore, "session")

    setTimeout(() => {
      props.onListApiLoaded && props.onListApiLoaded(_list)
    }, 0)
  }

  async function onInfiniteScroll(done) {
    if (!pageEnd && list.length > 0) {
      setLoadingMore(true)
      await loadMore()
      setLoadingMore(false)
    }
    setTimeout(() => {
      done && done()
    }, 500)
  }

  function onFilterChange(opt) {
    let _filter = Object.assign({}, filter, opt, { PageIndex: 1 })
    setFilter(_filter)

    setTimeout(() => {
      loadMore(1)
    }, 0)
  }

  return (
    <div className="p-1" id="scrollListContent">
      {renderFilter(props.tabConfig)}
      {props.tabConfig.customerServiceMsg && <CustomerServiceMsg />}
      {props.tabConfig.broadcast && <Broadcast />}
      {
        props.tabConfig.customFirstRow && props.tabConfig.customFirstRow(renderList) // 插一个自定义列
      }
      {!pageEnd && renderList.length == 0 && (
        <div className="loading">
          <Icon icon="ion-load-d" />
        </div>
      )}
      {pageEnd && renderList.length == 0 && <div className="loading">暂无记录</div>}
      {renderList.map((item, index) => {
        if (props.tabConfig.noSbSport && item.LotteryID == 43) {
          return
        }
        return (
          <div
            className={(props.tabConfig.className ? props.tabConfig.className + " " : "") + "bg-[#f1f1f1] mb-1 last:mb-0 rounded-sm p-1"}
            key={index}
          >
            {props.tabConfig.renderRow && props.tabConfig.renderRow(item, renderList, index)}
            {!props.tabConfig.renderRow && JSON.stringify(item)}
          </div>
        )
      })}

      <ObsverComp
        onVisible={() => {
          !loadingMore && onInfiniteScroll()
        }}
      />

      {loadingMore && (
        <div className="loading">
          <Icon icon="ion-load-d" />
        </div>
      )}
      {pageEnd && renderList.length > filter.PageSize && <div className="loading end">别扯，到底了</div>}
    </div>
  )
})
