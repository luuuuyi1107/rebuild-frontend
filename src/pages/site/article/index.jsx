import React from "react"

import LayoutPage from "@/components/LayoutPage"
import "./style.scss"
import util from "@/magic/util"
import { getArticleList } from "@/action/apis"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      loading: true,
      articles: [],
      active: false,
    }
  }
  componentDidMount() {
    getArticleList({ id: util.getUrlParam("id"), PageIndex: 1, PageSize: 20 }).then((res) => {
      this.setState({ loading: false })
      if (res.Code == 1) {
        let data = res.Data || []
        this.setState({ articles: data, active: data.length > 1 ? false : 0 })
      }
    })
  }

  articleClick(index) {
    if (this.state.active === false) {
      this.setState({ active: index })
    } else {
      this.setState({ active: false })
    }
  }

  render() {
    let articles = this.state.articles
    return (
      <LayoutPage className="site-article" center={"详情"} right={null} loading={this.state.loading}>
        {articles.map((item, index) => {
          return (
            <div className={`article-content box ${this.state.active === index ? "active" : ""}`} key={item.ID}>
              <div className="hd" onClick={this.articleClick.bind(this, index)}>
                <div className="title">{item.Title}</div>
                <p className="date">
                  {util.date.format(util.date.toDate(item.AddTime), "YYYY年MM月DD日 hh:mm")}
                  <span>阅读{item.Cick}次</span>
                </p>
              </div>
              <div className="bd" dangerouslySetInnerHTML={{ __html: item.Content }}></div>
            </div>
          )
        })}
        {articles.length == 0 && <div className="no-record">暂无详情.</div>}
      </LayoutPage>
    )
  }
}
