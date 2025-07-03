import dayjs from "dayjs"
import styles from "./election.module.scss"
import classNames from "classnames"
import util from "@/magic/util"
import { useMemo, useState, useEffect } from "react"
import { addVote } from "@/action/apis"
import * as apiNotification from "@/magic/ApiNotification"

export default (props) => {
  const isInElectionPeriod = useMemo(() => {
    return !props.value?.end ? false : !!props.value && dayjs().isBefore(props.value.end)
  }, [props.value])

  const voteTotal = useMemo(() => {
    if (!props.value?.votes) return 0
    return props.value.votes.reduce((sum, vote) => sum + vote.Votes, 0)
  }, [props.value?.votes])

  const votedIndex = useMemo(() => {
    if (!props.value?.voted || !props.value.votes) return -1
    return props.value.votes.findIndex((vote) => vote.ID === props.value.voted)
  }, [props.value?.voted, props.value?.votes])

  return !!props.value ? (
    <div>
      <div className={classNames(styles.electionStatus, { [styles.active]: isInElectionPeriod })}>
        {isInElectionPeriod ? "投票中" : "已结束"}
        <img className="w-[12px] mx-0.5 mb-[1px]" src={util.buildAssetsPath("assets/icons/ic_clock.svg")} />
        {props.value.end ? dayjs(props.value.end).format("MM月DD日 HH:mm:ss") : "--月--日 --:--:--"}
      </div>
      {props.children}

      <div className={props.showVote ? styles.voteEnable : styles.vote}>
        {props.value.votes.map((vote, index) => (
          <ElectionBar
            index={index}
            key={index + vote.ID}
            title={vote.Name}
            voteNumber={vote.Votes}
            total={voteTotal}
            showInput={props.showVote && isInElectionPeriod}
            isInPeriod={isInElectionPeriod}
            isVoted={votedIndex === index}
            disabled={!props.value.enable}
            onChange={() => {
              addVote(props.value.ID, vote.ID).then((res) => {
                apiNotification.alert(res, { title: "提示" }, props)
                if (res.Code != 1) return
                // setAgreeIndex((prevIndex) => (prevIndex === index ? -1 : index))
                !!props.refresh && props.refresh()
              })
            }}
          />
        ))}
      </div>

      <div className="flex flex-wrap mt-0.5 -ml-0.25">
        {props.value.keys.map((key, index) => (
          <div
            key={index}
            className="bg-white text-center text-theme rounded-full px-0.5 py-[2px] m-0.25 border border-theme border-solid text-[12px]"
          >
            #{key}
          </div>
        ))}
      </div>
    </div>
  ) : (
    props.children
  )
}

function ElectionBar(props) {
  const PROCESS_COLORS = [
    { bg: "#D8FCDD", border: "#86CB90", color: "#009621" },
    { bg: "#FFE4E4", border: "#F38282", color: "#E62828" },
  ]
  const barStyle = useMemo(() => {
    const borderColor = PROCESS_COLORS[props.index]?.border ?? PROCESS_COLORS[1].border
    const ground = props.isInPeriod ? "#FFF" : "#E6E6E6"
    if (!props.voteNumber || !props.total) return { background: ground, borderColor }

    const { voteNumber = 0, total = 0 } = props
    if (!total || !voteNumber) return ground
    const votePercent = (voteNumber / total) * 100
    const gradientColor = PROCESS_COLORS[props.index]?.bg ?? PROCESS_COLORS[1].bg

    return {
      background: `linear-gradient(90deg, ${gradientColor} ${votePercent}%, ${ground} ${votePercent}%)`,
      borderColor,
    }
  }, [props.voteNumber, props.total])

  return (
    <label>
      <div className={props.isVoted ? styles.votebarActive : styles.votebar} style={barStyle}>
        <div>
          {props.title}
          <span className="text-[#4E4E4E] text-[12px] ml-1" style={{ color: PROCESS_COLORS[props.index]?.color ?? PROCESS_COLORS[1].color }}>
            {props.voteNumber}人投票
          </span>
        </div>

        {props.showInput && (
          <div className="flex items-center">
            <input id="agree" type="checkbox" className="hidden" checked={props.isVoted} onChange={!props.disabled ? props.onChange : null} />
            {props.isVoted ? (
              <img className={classNames("w-[14px]", { "opacity-30": props.disabled })} src={util.buildAssetsPath(`assets/icons/ic_checkbox.svg`)} />
            ) : (
              <div className="w-[12px] h-[12px] rounded-[2px] border border-solid border-gray-200 bg-white" />
            )}
          </div>
        )}
      </div>
    </label>
  )
}

export const generateElectionData = (data) => {
  return {
    ID: data.ID || -1,
    votes: data.Votes || [
      { ID: 1, Name: "", Votes: 0 },
      { ID: 2, Name: "", Votes: 0 },
    ],
    enable: data.Enable,
    end: !!data.ExpTime ? dayjs(parseInt(data.ExpTime.substr(6, 13))).toDate() : null,
    keys: !!data.Contents ? data.Contents.split(",").filter((item) => item) : [],
    voted: typeof data.Voted === "boolean" ? 0 : data.Voted,
  }
}
