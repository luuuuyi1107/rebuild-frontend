import BackArrow from "@/assets/icons/ic_back_btn.svg"
export default ({ onBack, left, center = "", right, children, className, headerClassName = "" }) => {
  return (
    <div className={"h-full w-full overscroll-y-auto " + className}>
      <div className={"flex items-center px-0.5 py-0.5 " + headerClassName}>
        <div
          className="w-4 text-left"
          onClick={() => {
            onBack?.()

            // /web/public/assets/icons/ic_back_btn.svg
          }}
        >
          {/* {!!left ? left : <BackArrow />} */}
          {!!left ? left : <BackArrow className="translate-y-[3px] -translate-x-[3px]" />}
        </div>
        <div className="flex-1 text-center text-[16px] font-[500]">{center}</div>
        <div className="w-4">{right}</div>
      </div>
      {children}
    </div>
  )
}
