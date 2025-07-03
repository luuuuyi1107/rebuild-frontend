import React, { useEffect, useState } from "react"

import LayoutPage from "@/components/LayoutPage"

import util from "@/magic/util"
import copy2ClipBoard from "@/magic/copyToClipboard"
import BasicInfo from "@/components/UserBasicInfo"
import * as action from "@/action"
import "./style.scss"
import "@/pages/site/promotionContent/style.scss"

export default () => {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("") //預設 新澳门⑥合彩

  useEffect(() => {
    const articleItem = util.cache.get("articleItem")
    if (!!articleItem) {
      util.cache.remove("articleItem")
      setItem(articleItem)
    } else {
      setLoading(true)
    }
    const id = util.getUrlParam("id")
    const _data = util.cache.get("forum_home")
    if (!!_data && !!_data.cur_game && !!_data.cur_game.name) setTitle(_data.cur_game.name)

    action
      .post("Article/GetData", { id })
      .then((res) => {
        // console.log(res);
        if (res.Code !== 1) return
        let user = util.cache.get("user") || {}
        let content = res.Data.Content
        content = content.replace(/\(Myid\)/g, user.ID || 0)
        content = content.replace(/\(Cid\)/g, user.Token || "")
        res.Data.Content = util.formatUbb(content)
        setItem(res.Data)

        // util.cache.remove('forum_home');

        if (!_data) return
        _data.articles.forEach((article) => {
          if (article.ID == id) {
            article.Cick = res.Data.Cick
            util.cache.set("forum_article_cick", { [id]: res.Data.Cick })
          }
        })
      })
      .finally(() => {
        setLoading(false)
      })

    window.copy = function (element) {
      const text = element.getAttribute("data")
      copy2ClipBoard(text)
    }
  }, [])

  return !!item ? (
    <LayoutPage className="forum-article-detail site-promotion-content" title={title} loading={loading}>
      <BasicInfo image={util.buildAssetsPath("assets/manager.jpg")} userName="管理员">
        <div className="view">
          <img style={{ width: 20, height: 20, marginRight: "10px" }} className="emoji-icon" src={util.buildAssetsPath("assets/icons/ic_view.svg")} />
          {item.Cick}
        </div>
      </BasicInfo>
      <div className="space" />
      <div className="announcement">
        <div className="mark">公告</div>
        <div className="title">{item.Title}</div>
      </div>
      <div className="content">
        <div className="txt" dangerouslySetInnerHTML={{ __html: item.Content }}></div>
        {/* <div>{ item.Content } </div> */}
        {!!item.Name && <img style={{ marginTop: "15px", maxWidth: "100%" }} src={item.Name} />}
      </div>
    </LayoutPage>
  ) : (
    <div></div>
  )
}
