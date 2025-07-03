import util from "@/magic/util"

export default () => {
  return (
    <>
      <img className="w-[92px] h-[92px] animate-spin" src={util.buildAssetsPath("assets/icons/ic_loading.svg")} />
      <div className="text-[16px] text-black font-[400] leading-loose">正在进行网络诊断</div>
      <div className="text-[14px] text-[#a0a0a0] leading-tight mb-1">
        网络诊断大约需要一分钟时间,
        <br />
        请耐心等候
      </div>
    </>
  )
}
