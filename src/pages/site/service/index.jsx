import React from "react"

import { getPush } from "@/action/apis"
import util from "@/magic/util"

import styles from "./style.module.scss"
import Skeleton from "@/components/LayoutPage/Skeleton2"
import { Page } from "react-onsenui"
import config from "@/config/config"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      serviceLink: util.getUrlParam("serviceLink"),
      depositLink: util.getUrlParam("depositLink"),
    }
  }
  componentDidMount() {
    this.loadServiceLink()
  }

  async loadServiceLink() {
    let serviceLink = util.cache.get("serviceLink")
    if (!serviceLink) {
      let res = await getPush({ keys: ["servicelink"] })

      serviceLink = res.Data.ServiceLink
    }
    this.setState({ serviceLink: serviceLink })
  }

  frameLoaded() {
    this.setState({ loading: false })
  }

  render() {
    return (
      <Page
        className="site-service-content"
        center="客服中心"
        right={null}
        renderFixed={() => {
          if (this.state.loading == true) {
            return <Skeleton />
          }
          return null
        }}
      >
        <iframe
          onLoad={this.frameLoaded.bind(this)}
          src={this.state.depositLink || config.serviceLink || this.state.serviceLink}
          className={styles.servicePage}
          id="fullScreenBox"
        ></iframe>
      </Page>
    )
  }
}
