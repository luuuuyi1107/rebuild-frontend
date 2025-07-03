import questions from "./questions"
import { Button, Modal, Checkbox } from "react-onsenui"
import "./style.scss"

export default (props) => {
  return (
    <Modal isOpen={props.isOpen} className="question_modal" animation="lift">
      <div className="modal-inner">
        {questions
          // .filter((question) => !this.state.chosenList.some((chosen) => chosen === question))
          .map((question, key) => (
            <div
              className="setItem"
              key={key}
              onClick={(event) => {
                event.stopPropagation()
                // this.onClickSelection(question)
                props.onClick(question)
              }}
            >
              <span className="inline">{question}</span>
              <Checkbox inputId={"question"} className="cb" checked={props.value === questions.indexOf(question)} modifier="material" />
            </div>
          ))}
        <Button onClick={props.onSubmit} className="submit">
          确认
        </Button>
      </div>
    </Modal>
  )
}
