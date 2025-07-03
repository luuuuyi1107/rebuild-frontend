import styles from "./PlayRules.module.scss"
import { getPush } from "@/action/apis"
import { onMounted, reactive } from "@/magic/hook/vue"

export default ({ id, rules, LotteryRate, go }) => {
  const honkonTemaBRate = reactive({})
  const checkHasRefund = (config) => {
    if (id == "3" && config.type == "3") {
      return honkonTemaBRate[config.refundCode]?.some((x) => x)
    }
    return LotteryRate?.[config.refundCode]?.some((x) => x)
  }
  const ruleClick = (r) => {
    let params = { id, lx: r.lx }
    if (r.type) params.type = r.type
    if (r.router[2]) params = Object.assign({}, params, r.router[2])
    go(r.router[0], r.router[1], params)
  }
  onMounted(async () => {
    if (id == "3") {
      const res = await getPush({ lotteryid: "16", keys: "lotteryrate" })
      Object.assign(honkonTemaBRate, res.Data.LotteryRate.Rate)
    }
  }, [])

  return (
    <div className="play-rules">
      {rules.map((item) => (
        <div className="box" key={item.title}>
          <div className="hd">
            <span>{item.title}</span>
          </div>
          <div className="bd">
            {item.list.map((r) =>
              !r.isShow || (r.isShow && r.isShow(id)) ? (
                <div
                  className={`item ${checkHasRefund(r) ? styles["refund"] : ""}`}
                  key={r.name}
                  onClick={() => {
                    ruleClick(r)
                  }}
                >
                  <span>{r.name}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
