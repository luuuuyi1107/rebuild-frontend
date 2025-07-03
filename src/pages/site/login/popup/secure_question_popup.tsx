import VanPopup from "@/components/VanPopup"
import questions from "@/components/SecurityInput/questions"
import { Button, Checkbox } from "react-onsenui"
import { ref } from "@/magic/hook/vue"
import styles from "./style.module.scss"

export default function SecureQuestionPopup({ show, onSubmit }: { show: boolean; onSubmit: (question_index: number) => void }) {
  const question_index = ref(-1)
  return (
    <VanPopup show={show} className={styles["login-popup"]} position="bottom" overlay>
      <div className="px-[16px] py-[20px]">
        {questions
          // .filter((question) => !this.state.chosenList.some((chosen) => chosen === question))
          .map((question, index) => (
            <div
              className="p-1 border-0 border-b border-[#EEEEEE] border-solid flex justify-between items-center text-[14px]"
              key={index}
              onClick={(event) => {
                event.stopPropagation()
                question_index.value = index
              }}
            >
              <span className="inline">{question}</span>
              <Checkbox inputId={"question"} className="login-checkbox scale-75 mr-0.25" checked={question_index.value === index} />
            </div>
          ))}
        <Button
          onClick={() => {
            onSubmit(question_index.value)
          }}
          className="submit mt-[20px] w-full text-center text-[16px]"
        >
          确认
        </Button>
      </div>
    </VanPopup>
  )
}
