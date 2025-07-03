import React from "react"
import "./style.scss"
import util from "@/magic/util"
import BasicInfo from "@/components/UserBasicInfo"
// import CustomIcon from "@/components/CustomIcon";
import { withRouter } from "@/magic/withRouter"

export default withRouter((props) => {
  const getArticleDetail = () => {
    util.cache.set("articleItem", Object.assign({ gameName: props.gameName }, props.item))
    props.onGetDetailPageEvent()
    props.router.push(`/site/articleDetail?id=${props.item.ID}`)
  }

  return (
    <div className="article" onClick={getArticleDetail}>
      <img className="flag" src={util.buildAssetsPath("assets/icons/flag.svg")} />
      <BasicInfo
        image={util.buildAssetsPath("assets/manager.jpg")}
        userName="管理员"
        time={util.date.format(util.date.toDate(props.item.AddTime), "YYYY-MM-DD hh:mm", 8)}
      />
      <div className="content-info">
        <div className="activity">公告</div>
        <div className="inner">
          <div className="title">{props.item.Title}</div>
          {/* <div className="content">{ props.item.Content }</div> */}
        </div>
      </div>

      <div className="count-info">
        {/* <div className="likes">
        <img style={{width: 12, height: 12}} className="emoji-icon" src={util.buildAssetsPath("assets/icons/ic_like_sel.svg")}/>
        0
      </div> */}
        <div className="views">
          <img style={{ width: 12, height: 12 }} className="emoji-icon" src={util.buildAssetsPath("assets/icons/ic_view.svg")} />
          {props.item.Cick}
        </div>
      </div>
    </div>
  )
})
