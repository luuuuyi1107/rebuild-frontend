import React from "react"
import LayoutPage from "@/components/LayoutPage"
import HomeNavigatorBar from "@/components/HomeNavigatorBar"
import util from "@/magic/util"
import config from "@/config/config"
import Badge from "@/components/Badge"
import Bus from "@/magic/EventBus"
import { getInteractiveSet, getPinnedChats } from "@/action/apis"
import { List, ListItem, Icon } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"
import { withBroadcastContext } from "@/contexts/BroadcastContext"

import { getRequestFriendList2 } from "@/action/apis"
import { uniqBy, orderBy } from "lodash"
import "./style.scss"

export default withBroadcastContext(
  withRouter(
    class extends React.PureComponent {
      constructor(props) {
        super(props)
        this.state = {
          user: null,
          serviceLink: "",
          ServicePhone: "",
          Notifys: 0,
          Messages: 0,
          Friends: 0,
          loading: true,
        }
        this.intervalId = null // 用于存储定时器 ID
        this.noticeFriends = 0
      }
      componentDidMount() {
        this.loadData()
        this.props.broadcastData?.fetchRecentChats()
        this.setState({ loading: false })
        window.addEventListener("globalMessage", this.update.bind(this))
      }
      componentWillUnmount() {
        window.removeEventListener("globalMessage", this.update.bind(this))
      }
      update(event) {
        let data = event.detail
        let MsgCount = event.detail.MsgCount
        if (this.noticeFriends !== MsgCount.Friends) {
          this.noticeFriends = MsgCount.Friends
          this.fetchRequestFriends()
        }
        this.setState({
          // Friends: MsgCount.Friends,
          Notifys: MsgCount.Notifys + MsgCount.Service_Msgs,
          Messages: MsgCount.Friends + MsgCount.Messages,
          user: data.UserData,
          serviceLink: data.ServiceLink,
        })
      }
      async loadData() {
        Bus.emit("getPush.stop")
        Bus.emit("getPush.start")
        const configRes = await getInteractiveSet()
        this.setState({
          ServicePhone: configRes.Data.ServiceContent,
          AddFriendMsg: configRes.Data.AddFriendMsg,
          loading: false,
        })

        this.fetchPinnedChats()
      }

      fetchPinnedChats() {
        getPinnedChats().then((res) => {
          if (res.Code !== 1 || !res.Data?.length > 0) return
          const _list = (res.Data ?? [])
            .map(({ SortText }) => SortText)
            .join(",")
            .split(",")
            .reduce((acc, text) => {
              const [id, type] = text.split("|")
              if (!id || !type || isNaN(id) || isNaN(type)) return acc
              return acc.concat({ id: +id, type: +type })
            }, [])
          util.cache.set("pinnedChats", { data: _list, timestamp: Date.now() }, "session")
        })
      }

      async fetchRequestFriends() {
        const requestFriendRes = await getRequestFriendList2()
        const sortedFriendList = orderBy(
          requestFriendRes.Data,
          (friend) => {
            const match = friend.Time.match(/\/Date\((\d+)\)\//)
            return match ? parseInt(match[1], 10) : 0
          },
          ["desc"]
        )

        const uniqueFriendList = uniqBy(sortedFriendList, (friend) => `${friend.From_UID}_${friend.To_UID}`)
        const newRequestFriends = uniqueFriendList.filter((friend) => friend.Status === 0 && friend.From_UID !== util.getUserId())
        this.setState({ Friends: newRequestFriends.length })
      }

      render() {
        return (
          <LayoutPage
            className="interaction-home"
            center="互动中心"
            loading={this.state.loading}
            renderFixed={() => <HomeNavigatorBar active="interaction" />}
          >
            <div className="memberContent interactionContent">
              <List>
                <ListItem
                  width="25%"
                  class="item"
                  onClick={() => {
                    this.props.router.push("/interaction/newBroadcast")
                  }}
                >
                  <div className="left">
                    <Badge count={this.state.Friends} className="px-0 -translate-y-[5px] w-[19.5px]">
                      <img className="w-[26px]" src={util.buildAssetsPath(`assets/icons/icon_wechat.svg`)} />
                    </Badge>
                  </div>
                  <div className="center">
                    <div>
                      <p className="title">微信聊室</p>
                      <p className="text">全新升级，吹水更尽兴！</p>
                    </div>
                  </div>
                  <div className="right">
                    <Icon icon="ion-ios-arrow-forward" />
                  </div>
                </ListItem>

                <ListItem
                  width="25%"
                  class="item"
                  onClick={() => {
                    this.props.router.isLoginToOrRedirect("/interaction/systemMessage")
                  }}
                >
                  <div className="left">
                    <div>
                      <Icon icon="ion-settings" style={{ color: "#fc8210" }} />
                    </div>
                    {this.state.Notifys ? (
                      <div className="count">{this.state.Notifys > 99 ? <i>&middot;&middot;&middot;</i> : this.state.Notifys}</div>
                    ) : null}
                  </div>
                  <div className="center">
                    <div>
                      <p className="title">系统消息</p>
                      <p className="text">{this.state.Notifys ? "你有新的系统消息，请注意查收！" : "暂无消息"}</p>
                    </div>
                  </div>
                  <div className="right">
                    <Icon icon="ion-ios-arrow-forward" />
                  </div>
                </ListItem>

                <ListItem
                  width="25%"
                  class="item"
                  onClick={() => {
                    this.props.router.isLoginToOrRedirect("/interaction/friendMessage")
                  }}
                >
                  <div className="left">
                    <div>
                      <Icon icon="ion-chatboxes" style={{ color: "#2093e9" }} />
                    </div>
                    {this.state.Messages ? (
                      <div className="count">{this.state.Messages > 99 ? <i>&middot;&middot;&middot;</i> : this.state.Messages}</div>
                    ) : null}
                  </div>
                  <div className="center">
                    <div>
                      <p className="title">好友消息</p>
                      <p className="text">{this.state.Messages ? "你有新的好友消息，请注意查收！" : "暂无新消息"}</p>
                    </div>
                  </div>
                  <div className="right">
                    <Icon icon="ion-ios-arrow-forward" />
                  </div>
                </ListItem>

                <ListItem
                  width="25%"
                  class="item"
                  onClick={() => {
                    this.props.router.isLoginToOrRedirect("/interaction/rewardsCenter")
                  }}
                >
                  <div className="left">
                    <div>
                      <img src={util.buildAssetsPath(`assets/icons/icon_coupon.svg`)} />
                    </div>
                  </div>
                  <div className="center">
                    <div>
                      <p className="title">优惠中心</p>
                      <p className="text">绑定邮箱，领专属优惠码</p>
                    </div>
                  </div>
                  <div className="right">
                    <Icon icon="ion-ios-arrow-forward" />
                  </div>
                </ListItem>

                {/* <ListItem
                width="25%"
                class="item"
                onClick={() => {
                  this.props.router.isLoginToOrRedirect("/interaction/broadcast")
                }}
              >
                <div className="left">
                  <Icon icon="ion-speakerphone" style={{ color: "#2fc4b2" }} />
                </div>
                <div className="center">
                  <div>
                    <p className="title">网站广播</p>
                  </div>
                </div>
                <div className="right">
                  <Icon icon="ion-ios-arrow-forward" />
                </div>
              </ListItem> */}

                {!config.simpleMember && (
                  <ListItem
                    width="25%"
                    class="item"
                    onClick={() => {
                      this.props.router.push("/interaction/suggestion")
                    }}
                  >
                    <div className="left">
                      <Icon icon="ion-compose" style={{ color: "#63b7af" }} />
                    </div>
                    <div className="center">
                      <div>
                        <p className="title">投诉建议</p>
                      </div>
                    </div>
                    <div className="right">
                      <Icon icon="ion-ios-arrow-forward" />
                    </div>
                  </ListItem>
                )}
                <ListItem
                  width="25%"
                  class="item"
                  onClick={() => {
                    util.callService()
                  }}
                >
                  <div className="left">
                    <Icon icon="ion-headphone" style={{ color: "#ff5200" }} />
                  </div>
                  <div className="center">
                    <div>
                      <p className="title">在线客服</p>
                      <p className="text">你有新的消息，请注意查收！</p>
                    </div>
                  </div>
                  <div className="right">
                    <Icon icon="ion-ios-arrow-forward" />
                  </div>
                </ListItem>
                {/*<ListItem width="25%" class="item" onClick={()=>{util.open(config.serviceLink||this.state.serviceLink, "_blank")}}>*/}
                {/*<div className="left">*/}
                {/*<Icon icon="ion-headphone" style={{color: "#ff5200"}}/>*/}
                {/*</div>*/}
                {/*<div className="center">*/}
                {/*<div>*/}
                {/*<p className="title">在线客服</p>*/}
                {/*<p className="text">你有新的消息，请注意查收！</p>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className="right">*/}
                {/*<Icon icon="ion-ios-arrow-forward"/>*/}
                {/*</div>*/}
                {/*</ListItem>*/}
                {this.state.ServicePhone && !config.simpleMember && (
                  <ListItem width="25%" class="item">
                    <div className="left">
                      <Icon icon="ion-android-call" style={{ color: "#fc8210" }} />
                    </div>
                    <div className="center">
                      <div>
                        <p className="title" dangerouslySetInnerHTML={{ __html: this.state.ServicePhone }}></p>
                      </div>
                    </div>
                    <div className="right">
                      <Icon icon="ion-ios-arrow-forward" />
                    </div>
                  </ListItem>
                )}
              </List>
            </div>
          </LayoutPage>
        )
      }
    }
  )
)
