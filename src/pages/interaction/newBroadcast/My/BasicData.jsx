import MemberData from "../Friends/MemberData"
export default ({ userInfo, onClick }) => (
  <>
    <div className="bg-white px-2 pb-1 border-b border-solid border-x-0 border-t-0 border-gray-300">
      <MemberData
        onClick={() => {
          onClick("personal")
        }}
        hideBorder
        {...userInfo}
        Avatar={userInfo.Avatar?.FilePath}
        className="border-0"
        titleSize="text-[20px]"
        iconSize="w-[62px]"
      />
    </div>

    {/* <div
      onClick={() => {
        // onClick("article")
      }}
      className="bg-white mt-0.5 p-1.25 pr-2 flex items-center text-[16px] font-[500] text-black"
    >
      <img className="mr-1" src={util.buildAssetsPath("assets/icons/ic_article.svg")} />
      我的帖子
      <img className="ml-auto" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
    </div> */}
  </>
)
