import React, { createRef, useState, useEffect, useMemo } from "react"
import { Icon } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"
import { getPush } from "@/action/apis"
import TabPage from "./TabPage"

export default withRouter((props) => {
  const [tabName, setTabName] = useState(props.config.defaultTabName || props.config.tabs[0].name)
  const [isFirstLine, setIsFirstLine] = useState(true)
  const [ServiceMsgs, setServiceMsgs] = useState(0)
  const tabPageRef = createRef()

  useEffect(() => {
    getPush().then((user) => {
      setServiceMsgs(user.Data.MsgCount.Service_Msgs)
    })
  }, [])

  function onTabClick(name) {
    setTabName(name)
  }

  function renderTabs(tabs, config) {
    if (tabs && tabs.length > 0) {
      let list = tabs.sort(function (a, b) {
        return (b.tabOrder || 0) - (a.tabOrder || 0)
      })

      return (
        <div className="bg-gray-50">
          <ul className="flex p-0 m-0">
            {list.map((item, index) => (
              <li
                className={
                  "flex-1 list-none py-0.75 text-[14px] " +
                  (tabName == item.name ? " text-[#576B95] border-b border-[#576B95] border-solid border-x-0 border-0" : "")
                }
                key={item.name}
                onClick={onTabClick.bind(null, item.name)}
              >
                <span>{item.name}</span>
                {item.messageNumber && ServiceMsgs != 0 && <span className="messageNumber">{ServiceMsgs}</span>}
              </li>
            ))}
          </ul>
        </div>
      )
    }
    return null
  }

  function hasFilter(tabConfig) {
    if (tabConfig.filter) {
      let list = tabConfig.filter.filter((item) => item.type != "hidden")
      return list.length > 0
    }
    return false
  }

  let config = props.config
  let tabs = config.tabs
  const currentTab = useMemo(() => {
    if (!tabs) return null
    return tabs.find((item) => item.name == tabName)
  }, [tabName])
  return (
    <>
      {renderTabs(tabs, config)}
      <TabPage ref={tabPageRef} tabConfig={currentTab} key={tabName} onListApiLoaded={props.onListApiLoaded} subject={props.config.subject} />
    </>
  )
})
