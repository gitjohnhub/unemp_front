import { createVNode } from "vue";
import * as IconsVue from "@ant-design/icons-vue";

export const Icon = (props: { icon: string }) => {
  const { icon } = props;
  var antIcon: { [key: string]: any } = IconsVue;
  return createVNode(antIcon[icon]);
};
