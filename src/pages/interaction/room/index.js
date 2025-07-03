import React from "react"

import HttpShareBetPage from "@/components/HttpShareBetPage"
import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"

import "./style.scss"
import * as action from "@/action"

export default class extends React.PureComponent {
  render() {
    return <div></div>
    // return <HttpShareBetPage
    //     ref="http-chat-page"
    //     center={"跟单高手"}
    //     listApi={{url: "Room/GetList", params:{}}}
    //     sendApi={{url: "Room/Speak", params:{type:0}}}
    //     type={'Room'}
    //     convert={(rawMsg) => {
    //         return {
    //             id: rawMsg.ID,
    //             fromName: rawMsg.NickName,
    //             isMe: rawMsg.UID == user.ID,
    //             UID:rawMsg.UID,
    //             content: rawMsg.Content,
    //             time: rawMsg.Time,
    //             type: rawMsg.Type,
    //             shareCount: rawMsg.ShareCount,
    //             shareWin: rawMsg.ShareWin,
    //             shareLose: rawMsg.ShareLose,
    //             sharePercent: ((rawMsg.ShareWin/(rawMsg.ShareWin+rawMsg.ShareLose))*100).toFixed(0),
    //             topWin: rawMsg.TopWin,
    //             expert: rawMsg.Expert
    //         };
    //
    //     }}
    // />
  }
}
