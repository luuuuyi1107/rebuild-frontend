export default ({ title, onClose, children, maxHeight = "max-h-[80svh]" }) => {
  return (
    <div className={"w-3/4 max-w-[78vw] min-h-[50svh] mx-auto flex flex-col " + maxHeight}>
      <div className="bg-[#EDEDEC] relative text-[16px] py-0.75 rounded-t-[6px] text-black">
        {title}
        {onClose && (
          <div onClick={onClose} className="p-1 absolute right-0.5 top-1/2 -translate-y-1/2">
            <img className="w-1" src={util.buildAssetsPath("assets/icons/ic_cross.svg")} />
          </div>
        )}
      </div>
      <div className="bg-white flex-1 overflow-y-auto rounded-b-[6px]">{children}</div>
    </div>
  )
}
