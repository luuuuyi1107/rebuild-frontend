import util from "@/magic/util"

export default ({ children, amount }) => {
  return (
    <div className="text-left">
      <div className="text-red-600 flex items-center justify-center mb-[12px] text-[16px]">
        <img className="mr-0.5" src={util.buildAssetsPath("assets/icons/ic_warning.svg")} />
        请再次确认提现资料
      </div>
      <div className="text-center text-[#aeaeae] mb-[12px] text-[14px]">若因资料错误导致无法到帐，本公司概不负责</div>

      {children}

      <div className="border-solid border-0 border-b py-[12px] border-[#f1f1f1] flex items-center">
        <div className="text-[#aeaeae] mr-1 w-6">提现金额</div>
        <div className="flex-1">{(+amount).toFixed(2)}</div>
      </div>
    </div>
  )
}
