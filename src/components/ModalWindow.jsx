import classNames from "classnames"

export default ({
  children,
  title = "提示",
  footer,
  showCancel = true,
  showSubmit = true,
  onSubmit = () => {},
  onCancel = () => {},
  widthClass = "w-[90%]",
}) => {
  return (
    <div className="container flex justify-center">
      <div className={classNames(widthClass, "bg-white rounded-sm")}>
        <div className={classNames("header bg-theme text-1.25 rounded-t-sm py-0.75")}>{title}</div>
        <div className="body p-1.5">
          <div className="content text-black mb-1">{children}</div>
          <div className="footer py-1">
            {footer ? (
              footer
            ) : showCancel && showSubmit ? (
              <div className="grid grid-cols-2 gap-1">
                <div className="border-theme border-solid border text-theme text-1.25 rounded-sm py-0.75" onClick={onCancel}>
                  取消
                </div>
                <div className="bg-theme text-white text-1.25 rounded-sm py-0.75" onClick={onSubmit}>
                  确定
                </div>
              </div>
            ) : showSubmit ? (
              <div className="bg-theme text-white text-1.25 rounded-sm py-0.75" onClick={onSubmit}>
                确定
              </div>
            ) : showCancel ? (
              <div className="border-theme border-solid border text-theme text-1.25 rounded-sm py-0.75" onClick={onCancel}>
                取消
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
