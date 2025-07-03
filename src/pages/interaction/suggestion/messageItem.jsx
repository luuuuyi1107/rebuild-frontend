import { Icon, ListItem } from "react-onsenui"
import AvatarImg from "@/components/AvatarImg"
import Election, { generateElectionData } from "./election"
import classNames from "classnames"
import util from "@/magic/util"
import { useState, useEffect } from "react"
import { getVoteData } from "@/action/apis"
import Bus from "@/magic/EventsBus"

export default ({ row, openMessage }) => {
  const [election, setElection] = useState(row.VID > 0 ? generateElectionData({ ID: row.VID }) : null)
  const fetchWithId = fetchData.bind(null, row.VID)
  useEffect(() => {
    Bus.on("vote.update", fetchData)
    return () => {
      Bus.off("vote.update", fetchData)
    }
  }, [])

  useEffect(() => {
    if (!row?.VID) return
    fetchWithId()
  }, [row])

  function fetchData(id) {
    if (row.VID !== id) return
    getVoteData(row.VID).then((voteRes) => {
      if (voteRes.Code != 1) return
      const _elect = generateElectionData(voteRes.Data)
      setElection(_elect)
    })
  }

  return (
    <div className="recordItem" key={"allMessage" + row.ID} onClick={() => openMessage(row.ID)}>
      <div
        className={classNames("center", {
          "!p-0 is-elect-active ": !!election,
        })}
      >
        <ListItem>
          <Election value={election} refresh={fetchWithId}>
            <div>
              <p className="tl">
                {row.Title}
                {row.Status ? (
                  <span className="right success">
                    <Icon icon="ion-checkmark-circled" />
                    已回复
                  </span>
                ) : (
                  <span className="right warn">
                    <Icon icon="ion-minus-circled" />
                    未回复
                  </span>
                )}
              </p>
              <p className="dd">
                <span>
                  <AvatarImg UID={row.UID} avatarLink={row.Avatar} width={16} shape="round" />
                  &nbsp;{row.NickName}
                </span>
                <span className="right">{util.date.format(util.date.toDate(row.AddTime), "MM月DD日 hh:mm:ss")}</span>
              </p>
            </div>
          </Election>
          <div className="right">
            <Icon icon="ion-ios-arrow-forward" />
          </div>
        </ListItem>
      </div>
    </div>
  )
}
