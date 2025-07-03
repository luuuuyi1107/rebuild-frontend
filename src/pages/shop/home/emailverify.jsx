export default ({ value, onChange, sendEmailVerifyCode, textcolor = "text-black" }) => (
  <div className="flex items-center py-1">
    <div className={"w-[1.28rem] font-[400] " + textcolor}>验证码</div>
    <div className="flex-1">
      <input
        value={value || ""}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        placeholder="请输入邮箱验证码"
        className="w-full border-none bg-transparent placeholder:text-[#AEAEAE] text-14px p-0"
        type="text"
      />
    </div>
    <div
      onClick={() => {
        sendEmailVerifyCode()
      }}
      className="text-theme cursor-pointer"
    >
      发送验证码
    </div>
  </div>
)
