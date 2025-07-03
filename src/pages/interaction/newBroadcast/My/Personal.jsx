import AvatarIcon from "@/components/AvatarIcon"
const arrowBase64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik05LjcyODI0IDguMDAwMjFMNC44ODQ5NyAyLjQyOTU1QzQuNjQ3NzcgMi4xNDgyMSA0LjY4Mzg0IDEuNzI3NTUgNC45NjU1MSAxLjQ5MDIxQzUuMjQ3MTEgMS4yNTI4OCA1LjY2NzcxIDEuMjg4ODggNS45MDQ4NCAxLjU3MDg4TDExLjA5ODMgNy4zMzc1NUMxMS40MjUyIDcuNzI1NTUgMTEuNDA5NCA4LjI5NzU1IDExLjA2MTYgOC42NjY4OEw1Ljg4MDM3IDE0LjQ1NjlDNS42MjgwNCAxNC43MjU1IDUuMjA2MTEgMTQuNzM4MiA0LjkzNzk3IDE0LjQ4NTVDNC42Njk5MSAxNC4yMzM1IDQuNjU3MTEgMTMuODExNSA0LjkwOTQ0IDEzLjU0MzVMOS43MjgyNCA4LjAwMDIxWiIgZmlsbD0iI0IyQjJCMiIvPg0KPC9zdmc+DQo="

export default ({ userInfo, onClick }) => (
  <>
    <div
      onClick={() => {
        onClick("headshots")
      }}
      className="bg-white p-1.25 pr-2 flex items-center text-[16px] font-[400] text-black border-b border-solid border-x-0 border-t-0 border-gray-200"
    >
      大头贴
      <AvatarIcon className="ml-auto w-[62px] rounded-[8px]" src={userInfo.Avatar?.FilePath} />
      <img className="ml-1" src={arrowBase64} />
    </div>
    <div
      onClick={() => {
        onClick("nickname")
      }}
      className="bg-white p-1.25 pr-2 flex items-center text-[16px] font-[400] text-black border-b border-solid border-x-0 border-t-0 border-gray-200"
    >
      昵称
      <div className="ml-auto text-[#737373] text-[16px]">{userInfo.NickName}</div>
      <img className="ml-1" src={arrowBase64} />
    </div>
    <div className="bg-white p-1.25 pr-4 flex items-center text-[16px] font-[400] text-black border-b border-solid border-x-0 border-t-0 border-gray-200">
      ID
      <div className="ml-auto text-[#737373] text-[16px]">{userInfo.ID}</div>
    </div>

    {/* <div
      onClick={() => {
        onClick("article")
      }}
      className="bg-white p-1.25 pr-2 flex items-center text-[16px] font-[500] text-black"
    >
      会员帐户
      <img className="ml-auto" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
    </div> */}
  </>
)
