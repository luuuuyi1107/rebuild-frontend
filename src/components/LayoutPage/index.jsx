import React from "react"

import { Page, Toolbar, ToolbarButton, Icon, Splitter, SplitterSide, SplitterContent } from "react-onsenui"
import SplitterMenu from "@/components/SplitterMenu"
import Skeleton from "./Skeleton2"
import ApiLoading from "./ApiLoading"
import "./style.scss"
import { withRouter } from "@/magic/withRouter"
import { withModalContext } from "../ModalPage"
import Bus from "@/magic/EventBus"
import BackArrow from "@/assets/icons/ic_back_white_btn.svg"

@withModalContext
@withRouter
export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      menuOpen: 0,
    }
  }
  hideMenu() {
    this.setState({ menuOpen: 0 })
  }
  showMenu() {
    this.setState({ menuOpen: 1 })
  }
  preClose(event) {
    if (this.state.menuOpen == 2) {
      event.cancel()
      this.setState({ menuOpen: 1 })
    }
  }
  isRightUndefined() {
    return this.props.right === undefined
  }

  render() {
    const {
      renderToolbar,
      className,
      children,
      route,
      router,
      left,
      right,
      inModal,
      loading,
      apiLoading,
      center,
      title,
      onBack,
      renderFixed,
      showToolBar = true,
      ...otherProps
    } = this.props

    let remBase = document.documentElement.style.fontSize

    remBase = parseInt(remBase)
    let width = this.state.menuOpen == 2 ? remBase * 4.8 : remBase * 4
    width = Math.floor(width) //安卓测滑bug

    return (
      <Page
        renderFixed={() => {
          if (apiLoading == true) {
            return <ApiLoading />
          } else if (loading == true) {
            return <Skeleton />
          }
          return null
        }}
      >
        <Splitter>
          {this.isRightUndefined() && (
            <SplitterSide
              className={this.state.menuOpen ? "open" : "close"}
              side="right"
              width={width + "px"}
              collapse={true}
              swipeable={false}
              isOpen={!!this.state.menuOpen}
              onClose={this.hideMenu.bind(this)}
              onPreClose={this.preClose.bind(this)}
              onOpen={this.showMenu.bind(this)}
            >
              <SplitterMenu
                openLevel={this.state.menuOpen}
                onOpenMore={() => {
                  this.setState({ menuOpen: 2 })
                }}
                onCloseMore={() => {
                  this.setState({ menuOpen: 1 })
                }}
              />
            </SplitterSide>
          )}

          <SplitterContent>
            <Page
              className={`frame-page ${className}`}
              renderToolbar={() => {
                if (!showToolBar) return null
                return (
                  <Toolbar className="inverse">
                    <div className="left">
                      {left != null || typeof left != "undefined" ? (
                        left
                      ) : (
                        <div
                          onClick={() => {
                            if (inModal) {
                              Bus.emit("modal.close")
                              return
                            }
                            if (!!onBack) {
                              onBack()
                              return
                            }
                            router.back()
                          }}
                          className="text-white flex items-center ml-1 text-16px font-medium"
                        >
                          <BackArrow className="h-[20px] mr-[2px]" />
                          返回
                        </div>
                      )}
                    </div>
                    <div className="center">{typeof center == "function" ? center() : center || title || ""}</div>
                    <div className="right">
                      {this.isRightUndefined() ? (
                        <ToolbarButton onClick={this.showMenu.bind(this)}>
                          <Icon icon="ion-navicon" />
                        </ToolbarButton>
                      ) : typeof right == "function" ? (
                        right()
                      ) : (
                        right
                      )}
                    </div>
                  </Toolbar>
                )
              }}
              renderFixed={renderFixed}
              {...otherProps}
            >
              {children}
            </Page>
          </SplitterContent>
        </Splitter>
      </Page>
    )
  }
}

function startAnimation() {
  var start = null
  var limit = 2000
  var count = 0
  requestAnimationFrame(animation)
  function animation(t) {
    count++
    if (start === null) start = t
    if (t - start < limit) {
      console.log(t, start, count)
      requestAnimationFrame(animation)
    } else {
      console.log("done.")
    }
  }
}
