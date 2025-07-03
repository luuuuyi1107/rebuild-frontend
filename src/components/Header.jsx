import BackArrow from "@/assets/icons/ic_back_btn.svg"
export default ({ onBack, left, center = "", right, children, className }) => {
  return (
    <div className="h-full w-full overscroll-y-auto overflow-x-hidden">
      <div className={"flex box-border w-full items-center px-0.5 py-[9.3px] " + className}>
        <div className="w-4 text-left">
          {!!left ? (
            left
          ) : (
            <BackArrow
              className="translate-x-[6px] translate-y-[2px]"
              onClick={() => {
                onBack?.()
              }}
            />
          )}
        </div>
        <div className="flex-1 box-border text-center text-[16px] font-[500]">{center}</div>
        <div className="w-4">{right}</div>
      </div>

      {children}
    </div>
  )
}
