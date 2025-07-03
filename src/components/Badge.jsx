export default ({ count, children, showZero = false, className = "" }) => (
  <div className="relative">
    {(!!count || showZero) && (
      <div
        className={`min-w-[18px] h-[18px] bg-[#FA5151] absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 text-[12px] text-white flex items-center justify-center rounded-[2px] ${className} ${
          className.includes("px-") ? "" : "px-[3px]"
        }`}
      >
        {count > 99 ? <i className="px-[1px] leading-none text-[8px]">&middot;&middot;&middot;</i> : count}
      </div>
    )}
    {children}
  </div>
)
