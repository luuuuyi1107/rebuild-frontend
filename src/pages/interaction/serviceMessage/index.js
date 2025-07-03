import React, { createRef } from "react"

import RecordPage from "@/components/RecordPage"

import "./style.scss"
import AvatarImg from "@/components/AvatarImg"
import { ListItem, Icon } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"

export default withRouter(
  class extends React.PureComponent {
    constructor() {
      super()
      this.state = {
        avatar: false,
      }
      this.config = {
        tabs: [
          {
            name: "客服消息",
            listApi: "User/GetServiceList",
            listApiMethod: "get",
            renderRow: (row, data) => {
              let avatarImg = false
              console.log(row)
              return (
                <ListItem
                  className="friend-record-item"
                  key={row.ID}
                  onClick={() => {
                    this.props.router.isLoginToOrRedirect(`/interaction/serviceChat`, { id: row.ID, name: row.NickName })
                  }}
                >
                  <div className="left">
                    {row.Avatar ? (
                      <AvatarImg UID={row.ID} avatarLink={row.Avatar} width={".8rem"} height={".8rem"} />
                    ) : (
                      <div className="systemAvatar"></div>
                    )}
                    {/*<AvatarImg UID={row.ID} avatarLink={row.Avatar} width={".8rem"} height={".8rem"}/>*/}
                    {row.NewMsg ? <span className="count">{row.NewMsg}</span> : null}
                  </div>
                  <div className="center">
                    <div>
                      <p className="tl">{row.NickName}</p>
                      <p className="dd">{row.Introduce || "这个家伙很懒，什么都没留下"}</p>
                    </div>
                  </div>
                  <div className="right">
                    <Icon icon="ion-ios-arrow-forward" />
                  </div>
                </ListItem>
              )
            },
          },
        ],
      }
      this.recordPageRef = createRef()
    }

    componentDidMount() {
      window.addEventListener("pageshow", async (e) => {
        setTimeout(() => {
          this.recordPageRef.current?.reload()
        }, 100)
      })
    }

    render() {
      return <RecordPage ref={this.recordPageRef} config={this.config} center="客服消息" className="friend-page" />
    }
  }
)
