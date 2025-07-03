import React from "react"
import LayoutPage from "@/components/LayoutPage"
import "./style.scss"
import config from "@/config/storeQA"
import util from "@/magic/util"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      notices: props.noticeData,
    }
  }

  render() {
    let notice = this.state.notices
    return (
      <LayoutPage className={"store-qa-modal "} title="店长公告" right={null}>
        <div className="qa">
          <div className="box">
            <div className="hd">
              <span>{notice.Title}</span>
            </div>
            <div className="bd" dangerouslySetInnerHTML={{ __html: notice.Content }}></div>
          </div>
        </div>
      </LayoutPage>
    )
  }
}
