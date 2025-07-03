import { useState } from "react"
import { Button, Checkbox } from "react-onsenui"
import { Icon } from "react-onsenui"
import questions from "./questions"
import InputBox from "@/components/InputBox"
import "./style.scss"
import ModalPage from "../ModalPage"
import { notificationAsync } from "@/magic/notification"
import classNames from "classnames"

export default (props) => {
  const [showModal, setShowModal] = useState(false)

  function submitAnswer() {
    if (!props.chosen) {
      notificationAsync.toast("安全问题必填", { timeout: 1200 })
      return
    }

    if (props.answer === "") {
      notificationAsync.toast("问题答案必填", { timeout: 1200 })
      return
    }
    const questionIdx = questions.indexOf(props.chosen) + 1
    const content = `${questionIdx}=${props.answer}`
    props.onBindAnswer(content)
  }

  return (
    <>
      <div className="security_input mt-[10px]">
        {props.hasQuestion ? (
          <div className="content">
            <div className="col-item">
              <div className="title">安全问题</div>
              <div>{props.question}</div>
            </div>
            <div className="col-item">
              <div className="title">答案</div>
              <div>* * * *</div>
            </div>
          </div>
        ) : (
          <div className="content">
            <div className="setItem" onClick={() => setShowModal(true)}>
              <span className={`title ${props.color}`}>
                {props.showIcon && <Icon icon="ion-help" className="subfix text-gray-400/90 ml-0.5 mr-1 -translate-y-[2px]" />}
                安全问题
              </span>
              <span className={classNames("desc", { "text-[#aeaeae]": props.chosen === "", "text-[#1F1F21]": props.chosen })}>
                {props.chosen === "" ? "请选择" : props.chosen}
              </span>
            </div>

            <div className="setItem">
              <span className={`title ${props.color} whitespace-nowrap`}>答案</span>
              <InputBox
                placeholder="请输入答案"
                type="text"
                name="phone"
                maxLength={11}
                haveDel={false}
                onChange={props.onAnswerChange}
                value={props.answer}
              />
            </div>
            {props.onBindAnswer && (
              <Button onClick={submitAnswer} className="submit_answer text-[16px] rounded-[6px] h-[44px] flex items-center justify-center">
                确认
              </Button>
            )}
          </div>
        )}
      </div>

      <ModalPage
        isOpen={showModal}
        className="question_modal"
        animation="lift"
        onClick={(event) => {
          if (event.target.tagName !== "ONS-MODAL") return
          event.stopPropagation()
          setShowModal(false)
        }}
      >
        <div className="modal-inner">
          {questions
            // .filter((question) => !this.state.chosenList.some((chosen) => chosen === question))
            .map((question, key) => (
              <div
                className="setItem"
                key={key}
                onClick={(event) => {
                  event.stopPropagation()
                  const modalCheck = questions.indexOf(question)
                  props.onClickQuestion(modalCheck)
                }}
              >
                <span className="inline text-[#1F1F21] text-[14px]">{question}</span>

                <Checkbox inputId={"question"} className="cb scale-[82%] mr-0.25" checked={props.checked === questions.indexOf(question)} />
              </div>
            ))}
          <Button
            onClick={() => {
              if (props.checked !== -1) {
                props.onModalSelect(questions[props.checked])
              }
              setShowModal(false)
            }}
            className="submit text-[16px] rounded-[6px] h-[44px] "
          >
            确认
          </Button>
        </div>
      </ModalPage>
    </>
  )
}
