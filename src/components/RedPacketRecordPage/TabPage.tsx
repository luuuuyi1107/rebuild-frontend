import { Icon, ActionSheet, ActionSheetButton } from "react-onsenui"
import React, { useState, useEffect, useCallback, useRef } from "react"
import { Subscription } from "rxjs" // 假设使用 RxJS
import Broadcast from "@/components/Broadcast"
import CustomerServiceMsg from "@/components/CustomerServiceMsg"
import ItemRow from "./itemRow"

// 定义介面
interface iFilterItem {
  key: string
  type: "date" | "actionSheet"
  label?: string
  placeholder?: string
  defaultValue?: any
  options?: Array<{ label: string; value: any }>
}

interface TabConfig {
  filter?: iFilterItem[]
  sort?: [string, number]
  customerServiceMsg?: boolean
  broadcast?: boolean
  customFirstRow?: (list: any[]) => React.ReactNode
  noSbSport?: boolean
}

interface iFilter {
  PageIndex: number
  PageSize: number
  [key: string]: any
}

interface iVerifyCode {
  captchaId: string
  captchaId2: string
}

interface iTabPageProps {
  tabConfig: TabConfig
  subject?: any // 可以根据实际的 subject 类型来定义
  tabIdx?: number
  validateObject?: any
  list?: iRedBagData[] // 默认列表数据
  loadingMore: boolean
  verifyCode: iVerifyCode
  hasMore: boolean
  onTabChangeEvent?: (data: any) => void
}

interface iActionSheetState {
  [key: string]: boolean
}

interface iRedBagData {
  Captcha: number
  Collar: number
  EndTime: string
  GameIDs: any
  ID: number
  KaiTime: string
  Mend: number
  Money: number
  Mtop: number
  NickName: string
  Pass: boolean
  Payment: number
  PotMoney: number
  RecBeginTime: any
  RecEndTime: any
  RedTypeID: number
  RedsRecord: boolean
  Text: string
  Title: string
  UID: number
  UpCycle: number
  WinRule: string
  XianZhiID?: string | number // 可选属性，可能为 null 或 undefined
}

const TabPage: React.FC<iTabPageProps> = ({
  tabConfig,
  subject,
  tabIdx,
  validateObject,
  list = [],
  loadingMore = false,
  verifyCode,
  hasMore = false,
  onTabChangeEvent,
}) => {
  // State 定义
  const [filter, setFilter] = useState<iFilter>({ PageIndex: 1, PageSize: 20 })

  const [actionSheetState, setActionSheetState] = useState<iActionSheetState>({})

  const subscriptionRef = useRef<Subscription | null>(null)

  // 初始化 filter
  useEffect(() => {
    if (tabConfig.filter && tabConfig.filter.length > 0) {
      let initialFilter: iFilter = { PageIndex: 1, PageSize: 5, ...filter }

      tabConfig.filter.forEach((item) => {
        if (typeof item.defaultValue !== "undefined") {
          initialFilter[item.key] = item.defaultValue
        }
      })
      setFilter(initialFilter)
    }
  }, [tabConfig.filter])

  // 订阅 subject
  useEffect(() => {
    if (!subject) return

    subscriptionRef.current = subject.subscribe({
      next: (data: any) => {
        if (data.loaded) return
        // 强迫组件更新的逻辑可以在这里实现
      },
    })

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [subject])

  // 渲染筛选器
  const renderFilter = useCallback(
    (tabConfig: TabConfig): React.ReactNode => {
      if (!tabConfig.filter || tabConfig.filter.length === 0) {
        return null
      }

      return (
        <div className="filter">
          {tabConfig.filter.map((item) => {
            if (item.type === "date") {
              return (
                <div className={`fitem type-date ${item.label ? "with-label" : ""}`} key={item.key}>
                  {item.label && <span className="label">{item.label}</span>}
                  <span>{filter[item.key] || item.placeholder || ""}</span>
                  <Icon icon="ion-android-arrow-dropdown" />
                  <input
                    className="!static"
                    type="date"
                    onChange={(e) => {
                      const obj = { [item.key]: e.target.value }
                      onFilterChange(obj)
                    }}
                  />
                </div>
              )
            }

            if (item.type === "actionSheet") {
              const actionSheetKey = `showActionSheet${item.key}`

              return (
                <div
                  className={`fitem type-action-sheet ${item.label ? "with-label" : ""}`}
                  key={item.key}
                  onClick={() => {
                    setActionSheetState((prev) => ({
                      ...prev,
                      [actionSheetKey]: true,
                    }))
                  }}
                >
                  {item.label && <span className="label">{item.label}</span>}
                  <span>{filter[item.key] || item.placeholder || ""}</span>
                  <Icon icon="ion-android-arrow-dropdown" />
                  <ActionSheet
                    isOpen={!!actionSheetState[actionSheetKey]}
                    onCancel={() => {
                      setActionSheetState((prev) => ({
                        ...prev,
                        [actionSheetKey]: false,
                      }))
                    }}
                    animation="default"
                    className="record-page-action-sheet"
                    isCancelable={true}
                  >
                    {item.options?.map((opt, ii) => (
                      <ActionSheetButton
                        key={ii}
                        onClick={() => {
                          const filterObj = { [item.key]: opt.value }
                          onFilterChange(filterObj)
                          setActionSheetState((prev) => ({
                            ...prev,
                            [actionSheetKey]: false,
                          }))
                        }}
                      >
                        {opt.label}
                      </ActionSheetButton>
                    ))}
                    <ActionSheetButton
                      onClick={() => {
                        setActionSheetState((prev) => ({
                          ...prev,
                          [actionSheetKey]: false,
                        }))
                      }}
                      icon={"md-close"}
                    >
                      取消
                    </ActionSheetButton>
                  </ActionSheet>
                </div>
              )
            }

            return null
          })}
        </div>
      )
    },
    [filter, actionSheetState]
  )

  // 筛选器变更处理
  const onFilterChange = useCallback(
    (opt: Record<string, any>): void => {
      const newFilter = { ...filter, ...opt, PageIndex: 1 }
      setFilter(newFilter)
      setTimeout(() => {
        onTabChangeEvent(newFilter)
      }, 0)
    },
    [filter]
  )

  // 载入事件处理
  const onLoadEvent = useCallback((): void => {
    subject?.next({ type: "loaded" })
  }, [subject])

  // 验证成功处理
  const onVerifySuccess = useCallback(
    (data: any): void => {
      subject?.next({ type: "addValidate", ...data })
    },
    [subject]
  )

  // 移除验证码事件处理
  const onRemoveCodeEvent = useCallback(
    (id: string): void => {
      subject?.next({ type: "removeValidate", id })
    },
    [subject]
  )

  if (list.length === 0 && loadingMore)
    return (
      <div className="loading">
        <Icon icon="ion-load-d" />
      </div>
    )

  return (
    <div className="scroll-list-content p-1" id="scrollListContent">
      {renderFilter(tabConfig)}
      {tabConfig.customerServiceMsg && <CustomerServiceMsg />}
      {tabConfig.broadcast && <Broadcast />}
      {tabConfig.customFirstRow && tabConfig.customFirstRow(list)}

      {/* {(hasMore && list.length === 0) ||
          (loadingMore && (
            <div className="loading">
              <Icon icon="ion-load-d" />
            </div>
          ))} */}

      {!hasMore && list.length === 0 && <div className="loading">暂无记录</div>}

      {Array.isArray(list) &&
        list.map((row, index) => {
          if (tabConfig.noSbSport && row.LotteryID === 43) return null

          return (
            <div className="record-list-item" key={index}>
              <ItemRow
                row={row}
                isCurrent={tabIdx === 1}
                captchaId={verifyCode.captchaId}
                index={index}
                onLoad={onLoadEvent}
                onVerifySuccess={onVerifySuccess}
                validates={validateObject}
                // onRemoveValidate={() => onRemoveCodeEvent(row.ID)}
              />
            </div>
          )
        })}

      {loadingMore && hasMore && (
        <div className="loading">
          <Icon icon="ion-load-d" />
        </div>
      )}

      {!hasMore && list.length > filter.PageSize && <div className="loading end">别扯，到底了</div>}
    </div>
  )
}

export default TabPage
