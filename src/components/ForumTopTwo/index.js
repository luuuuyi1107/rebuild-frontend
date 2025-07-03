import React from "react"
import "./style.scss"
import AvatarImg from "@/components/AvatarImg"
import util from "@/magic/util"

export default (props) => {
  return (
    <div className="forum-list" onClick={props.callback}>
      <div className="forum-inner">
        {props.items.map((item) => (
          <div className="item" key={item.ID}>
            <div className="method">
              <div className="activity">{util.shortIssue(item.GameID)}</div>
              <div className="text">{item.PlayType}</div>
            </div>

            <div className="article2">
              <div className="content">{item.Title}</div>
              <div>
                <AvatarImg
                  avatarLink={!!item.Avatar && item.Avatar.startsWith("http") ? item.Avatar : null}
                  width={"26px"}
                  height={"26px"}
                  icSize={"26px"}
                  shape={"round"}
                />
                <span className="nickname">{item.NickName}</span>
              </div>
            </div>

            <div className="elite">
              {item.Featured > 0 && (
                <img style={{ width: 24, height: 24 }} className="emoji-icon elite" src={util.buildAssetsPath("assets/icons/tag_best.svg")} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
