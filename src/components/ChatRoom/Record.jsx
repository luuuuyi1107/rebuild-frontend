import CustomIcon from "@/components/CustomIcon"
import { withRouter } from "@/magic/withRouter"

export default withRouter((props) => {
  return (
    <>
      <div
        className="text-center mr-2"
        onClick={() => {
          // props.router.isLoginToOrRedirect(`/interaction/broadcastShareBet`)
          // this.setState({ ftShare: false })
          props.onItemClick("bet")
        }}
      >
        <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/ticket.svg")} />
        <div>分享注单</div>
      </div>

      <div
        className="text-center mr-2"
        onClick={async () => {
          props.onItemClick("record")
        }}
      >
        <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/champ.svg")} />
        <div>分享战绩</div>
      </div>
      <div
        className="text-center mr-auto"
        onClick={() => {
          // props.router.isLoginToOrRedirect(`/interaction/broadcastMoreShare`)
          props.onItemClick("more")
        }}
      >
        <CustomIcon style={{ width: 26, height: 26 }} className="emoji-icon" type={require("./icons/more.svg")} />
        <div>更多战绩</div>
      </div>
    </>
  )
})
