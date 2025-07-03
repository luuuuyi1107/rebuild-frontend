import React from "react"
import LayoutPage from "@/components/LayoutPage"
// ;
import * as action from "@/action"
import { Icon } from "react-onsenui"
import "./style.scss"
import util from "@/magic/util"
import AvatarImg from "@/components/AvatarImg"
import * as apiNotification from "@/magic/ApiNotification"
import { withRouter } from "@/magic/withRouter"
import Election, { generateElectionData } from "./election"
import classNames from "classnames"
import { getVoteData } from "@/action/apis"
import Bus from "@/magic/EventsBus"
// import {notification} from "onsenui/js/onsenui";
// import ClipboardJS from "clipboard";
// let clipboardInstance = null;

export default withRouter(
  class extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        messageContent: null,
        repContent: null,
        isAgree: false,
        isDisagree: false,
        election: null,
      }
    }

    componentDidMount() {
      // this.listenClipboard();
      action.get("Book/GetData", { id: this.props.id }).then((res) => {
        if (res.Code != 1) {
          apiNotification.alert(res, {}, this.props)
          return
        }
        let repContent = res.Data.RepContent || ""
        // let test = "{Copy=Copy}拷贝内容{/Copy},多个Copy使用不同命名"
        repContent = repContent.replace(/<a href="(.*?)#target=(.*?)">/g, '<a href="$1" target="$2">')
        repContent = repContent.replace(/<a href="(.*?)#&amp;f_u_c_k=y_o_u">/g, "<a href=\"$1\" target='_blank'>")
        repContent = repContent.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1">$2</a>')
        repContent = repContent.replace("{Copy=Copy}", "<copy-btn>")
        repContent = repContent.replace("{/Copy}", "<copy-btn>")
        repContent = repContent.replace(
          /<copy-btn>(.*?)<copy-btn>/g,
          '<span class="copy-line"><span class="copy-text">$1</span><span class="inline copy-btn" data-clipboard-text="$1">复制</span></span>'
        )
        const messageContent = res.Data
        let election = null
        if (!!res.Data.Votes) {
          // Object.assign(messageContent, {
          //   election: generateElectionData(res.Data.Votes),
          // })
          election = generateElectionData(res.Data.Votes)
        }

        this.setState({ messageContent, election, repContent: <div dangerouslySetInnerHTML={{ __html: repContent }}></div> })
      })
    }

    componentWillUnmount() {
      if (this.state.election?.ID) {
        Bus.emit("vote.update", this.state.election.ID)
      }
    }

    updateVoteData() {
      getVoteData(this.state.election.ID).then((voteRes) => {
        if (voteRes.Code != 1) return
        this.setState({ election: generateElectionData(voteRes.Data) })
      })
    }

    render() {
      const { messageContent, election } = this.state

      return (
        <LayoutPage className="suggestion-msg-record" title="查看留言" right={null}>
          <div className="inner">
            {messageContent && (
              <div className={classNames("suggestion-content !rounded-[5px]", { "!pt-0 overflow-hidden": !!election })}>
                <Election showVote={!!util.isLogin()} value={election} refresh={this.updateVoteData.bind(this)}>
                  <div className="center top">
                    <p className="tl w-full">
                      {messageContent.Title}
                      {messageContent.Status ? (
                        <span className="right success">
                          <Icon icon="ion-checkmark-circled" />
                          已回复
                        </span>
                      ) : (
                        <span className="right warn">
                          <Icon icon="ion-minus-circled" />
                          未回复
                        </span>
                      )}
                    </p>
                    <p className="dd">
                      <span>
                        <AvatarImg avatarLink={messageContent.Avatar} width={25} shape="round" />
                        &nbsp;{messageContent.NickName}
                      </span>
                      <span className="right">{util.date.format(util.date.toDate(messageContent.AddTime), "MM月DD日 hh:mm:ss")}</span>
                    </p>
                  </div>
                  <div className="content">
                    <p>{messageContent.Content}</p>
                  </div>
                </Election>
              </div>
            )}
            {messageContent?.RepContent && (
              <div className="suggestion-rep">
                <div className="center top">
                  <p className="dd">
                    <span>
                      <span className="systemAvatar"></span>
                      <span className="systemName">&nbsp;管理员&nbsp;{messageContent.RepName}</span>
                    </span>
                    <span className="right">{util.date.format(util.date.toDate(messageContent.RepTime), "MM月DD日 hh:mm:ss")}</span>
                  </p>
                </div>
                <div className="content">
                  {/*<p>{messageContent.RepContent}</p>*/}
                  {this.state.repContent}
                </div>
              </div>
            )}
          </div>
        </LayoutPage>
      )
    }
  }
)
