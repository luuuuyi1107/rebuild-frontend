import { getAvatar, setAvatar } from "@/action/apis"
import AvatarImg from "@/components/AvatarImg"
import ModalPage from "@/components/ModalPage"
import ModalWindow from "@/components/ModalWindow"
import Bus from "@/magic/EventBus"
import { onMounted, reactive } from "@/magic/hook/vue"

export default ({ id, afterSubmit }) => {
  const initData = reactive({
    options: { show: false },
    datas: [],
    reqBody: { id },
  })
  const onSubmit = async () => {
    await setAvatar(initData.reqBody)
    afterSubmit()
    initData.options.show = false
  }
  onMounted(async () => {
    const res = await getAvatar()
    initData.datas = res.Data
    Bus.on("show.avatarModal", () => {
      initData.options.show = true
    })
  })
  return (
    <ModalPage isOpen={initData.options.show}>
      <ModalWindow onCancel={() => (initData.options.show = false)} onSubmit={onSubmit}>
        <div className="px-1">
          <div className="grid grid-cols-4 gap-1 mb-1">
            {initData.datas?.map((data) => (
              <div className="relative" key={data.ID}>
                <AvatarImg
                  avatarLink={data.FilePath}
                  width={"100%"}
                  shape="circle"
                  onClick={() => {
                    initData.reqBody.id = data.ID
                  }}
                />
                {initData.reqBody.id == data.ID && <i className={`text-theme text-1.5 ion-checkmark-circled absolute right-0 bottom-0`} />}
              </div>
            ))}
          </div>
        </div>
      </ModalWindow>
    </ModalPage>
  )
}
