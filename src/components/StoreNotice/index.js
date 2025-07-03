import React from "react"
import { Icon } from "react-onsenui"
import * as action from "@/action"
import "./style.scss"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      screenIndex: 1,
      notices: [],
      isOpen: false,
    }
  }
  componentDidMount() {
    action.post("Notice/GetList", { lx: 1 }).then((Notice) => {
      if (Notice.Code == 1 && Notice.Data.length > 0) {
        this.setState({ notices: Notice.Data })
      }
      this.animateText()
    })
  }

  componentDidUpdate() {
    this.animateText()
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  animateText() {
    if (!this.timer) {
      this.timer = setInterval(() => {
        if (this.state.screenIndex < this.state.notices.length) {
          this.setState({ screenIndex: this.state.screenIndex + 1 })
        } else {
          this.setState({ screenIndex: 1 })
        }
      }, 4000)
    }
  }

  renderNotice() {
    let ret = []
    let notices = this.state.notices
    notices.map((notice) => {
      ret.push(
        <div
          key={"notice" + notice.ID}
          onClick={() => {
            this.props.setNoticeData(notice)
          }}
        >
          {notice.Name}
        </div>
      )
    })

    return ret
  }

  render() {
    let notices = this.state.notices
    return (
      <div className={notices && notices.length > 0 ? "notice-module" : "notice-module noNotice"}>
        <span className="noticeTitle">
          <Icon className="notice-icon" icon="ion-speakerphone"></Icon> 店长公告：
        </span>
        <div className="marquee">
          <span ref="noticeText" className="noticeText" style={{ top: -(this.state.screenIndex - 1) * 25 }}>
            {notices && this.renderNotice()}
          </span>
        </div>
      </div>
    )
  }
}
