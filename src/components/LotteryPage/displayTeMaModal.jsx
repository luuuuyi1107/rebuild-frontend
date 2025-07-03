import React, { useState } from "react"

import "./styleTeMaModal.scss"
import util from "@/magic/util"
import ModalPage from "../ModalPage"

export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      //信用盤-用
      showModalTema: false,
    }
  }

  showModal(show) {
    this.setState({
      showModalTema: show,
    })
  }

  onDelClick(delTitle) {
    this.props.onSelectedDelete(delTitle)
  }

  render() {
    var nlist = this.props.selectList
      .filter((e) => {
        return e.value > 0
      })
      .sort((a, b) => {
        return parseInt(a.key) - parseInt(b.key)
      })

    return (
      <ModalPage
        name="tema_modal"
        isOpen={this.state.showModalTema}
        className="tema_modal"
        animation="fade"
        onClose={() => {
          this.setState({
            showModalTema: false,
          })
        }}
      >
        {this.props.selectList.length && this.state.showModalTema ? (
          <div className="modal-inner">
            <div className="modal_title_type">{this.props.center}</div>
            <div className="modal_desc_type">订单栏</div>

            <img className="modal_title_img" src={util.buildAssetsPath("images/LotteryPage/modal_ball.png")} />

            <div className="number_title">
              <span className="pl">赔率</span>
              <span className="block">赔率</span>
              <div className="fd">金额</div>
            </div>
            <div className="number_list">
              {nlist.map((e, rowIndex) => {
                return (
                  <div className="number_row" key={e.key + "_" + e.value}>
                    <div className={`ball circle ${e.obj.color} active `}>{e.key}</div>
                    <div className="pl">{this.props.LotteryRate["Tm_" + e.key]}</div>
                    <AdjustAmount
                      amt={e.value}
                      updateValue={(value) => {
                        this.props.onSelectedChange(e, value)
                      }}
                    />
                    <img className="del" src={util.buildAssetsPath("images/LotteryPage/delete.png")} onClick={this.onDelClick.bind(this, e.key)} />
                  </div>
                )
              })}
            </div>
            <div className="bottom-bar">
              <div
                className="cancel"
                onClick={() => {
                  this.showModal(false)
                }}
              >
                取消
              </div>
              <div
                className="confirm"
                onClick={() => {
                  this.showModal(false)
                  this.props.onListChange()
                  this.props.onModalBetCall()
                }}
              >
                确认投注
              </div>
            </div>
          </div>
        ) : (
          <div />
        )}
      </ModalPage>
    )
  }
}

const AdjustAmount = ({ amt, updateValue }) => {
  var searchInput

  const [value, setValue] = useState(amt)

  const onCompleteEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()

    updateValue(value)
  }

  const onEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (
      e.key === "Enter"
      // && e.target.value.length >= 1
    ) {
      //點擊return關閉focus
      searchInput.blur()
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    var val = e.target.value
    setValue(val.replace(/[^0-9-]+/, ""))
  }

  return (
    <span className="amt">
      <input
        type="number"
        maxLength={5}
        value={value}
        onKeyUp={onEnter}
        ref={(el) => (searchInput = el)}
        onBlur={onCompleteEdit}
        onChange={handleChange}
      />
    </span>
  )
}
