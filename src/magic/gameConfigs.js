import { config as pingmaConfig } from "@/pages/lhc/pingma/index"
import { config as ptxwConfig } from "@/pages/lhc/ptxw/index"
import { config as temaConfig } from "@/pages/lhc/tema/index"
import { config as zxbzConfig } from "@/pages/lhc/zxbz/index"
import { config as fc3 } from "@/pages/fc3/bet/index"
import { config as klb } from "@/pages/klb/bet/index"
import { config as klsf } from "@/pages/klsf/bet/index"
import { config as ks } from "@/pages/ks/bet/index"
import { config as syxw } from "@/pages/syxw/bet/index"
import { config as pks } from "@/pages/pks/bet/index"
import { config as qxc } from "@/pages/qxc/bet/index"
import { config as ssc } from "@/pages/ssc/bet/index"
import { config as pcdd } from "@/pages/pcdd/bet/index"

export default {
  lhc: { ...pingmaConfig, ...ptxwConfig, ...temaConfig, ...zxbzConfig },
  fc3,
  klb,
  klsf,
  ks,
  syxw,
  pks,
  qxc,
  ssc,
  pcdd,
}
