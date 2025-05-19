<template>
  <div :class="`iconfont icon-${name}`" :style="getStyle()" @click="handleClick"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    name: {
      type: String,
      default: undefined,
    },
    color: {
      type: [String, Array],
      required: false,
      default: 'rgba(51, 51, 51, 1)',
    },
    size: {
      type: Number,
      required: false,
      default: 30,
    },
  },

  emits: ['click'],

  setup(props, { emit }) {
    const hex2rgb = (hex: string) => {
      const rgb: Array<number> = [];
      hex = hex.substring(1);
      if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
      }
      hex.replace(/../g, (color) => {
        rgb.push(parseInt(color, 0x10));
        return color;
      });
      return `rgba(${rgb.join(',')}, 1)`;
    };

    const fixColor = () => {
      const color = props.color as string | Array<string>;
      if (color) {
        if (typeof color === 'string') {
          return props.color.indexOf('#') === 0 ? hex2rgb(color) : color;
        } else {
          return color.map((item) => (item.indexOf('#') === 0 ? hex2rgb(item) : item));
        }
      }
    };

    /**
     * 获取样式
     */
    const getStyle = () => {
      const color =
        typeof props.color === 'string' ? fixColor() : fixColor()?.[0] || 'rgba(51, 51, 51, 1)';
      return `color: ${color}; font-size: ${props.size}px;`;
    };

    /**
     * 点击事件
     */
    const handleClick = () => {
      emit('click');
    };

    return {
      ...props,
      getStyle,
      handleClick,
    };
  },
});
</script>

<style lang="less" scoped>
/* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
@font-face {
  font-family: 'iconfont'; /* Project id 2815393 */
  src: url('//at.alicdn.com/t/c/font_2815393_qv76i4ssru.woff2?t=1724232264074') format('woff2'),
    url('//at.alicdn.com/t/c/font_2815393_qv76i4ssru.woff?t=1724232264074') format('woff'),
    url('//at.alicdn.com/t/c/font_2815393_qv76i4ssru.ttf?t=1724232264074') format('truetype');
}

.iconfont {
  font-family: 'iconfont' !important;
  font-size: 16px;
  line-height: 1;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-jqt:before {
  content: '\e603';
}

.icon-qiao-gong-hui_line:before {
  content: '\e82c';
}

.icon-jfg_line:before {
  content: '\e82b';
}

.icon-qigongfu_line:before {
  content: '\e829';
}

.icon-jiashicang_line:before {
  content: '\e827';
}

.icon-authorization_line:before {
  content: '\e678';
}

.icon-love_line:before {
  content: '\e6c1';
}

.icon-law_line:before {
  content: '\e6d9';
}

.icon-trophy_line:before {
  content: '\e80b';
}

.icon-banner_line:before {
  content: '\e706';
}

.icon-article_line:before {
  content: '\e6fd';
}

.icon-activity_line:before {
  content: '\e6fe';
}

.icon-merchant_line:before {
  content: '\e6ff';
}

.icon-discussion_line:before {
  content: '\e700';
}

.icon-topic_line:before {
  content: '\e701';
}

.icon-data-panel_line:before {
  content: '\e704';
}

.icon-hint_line:before {
  content: '\e705';
}

.icon-authority_line:before {
  content: '\e707';
}

.icon-villager_line:before {
  content: '\e708';
}

.icon-playing-2:before {
  content: '\e60d';
}

.icon-playing-3:before {
  content: '\e60c';
}

.icon-audio-bg:before {
  content: '\e609';
}

.icon-recording:before {
  content: '\e608';
}

.icon-playing:before {
  content: '\e607';
}

.icon-visible:before {
  content: '\e6f4';
}

.icon-invisible:before {
  content: '\e6f5';
}

.icon-home_fill:before {
  content: '\e668';
}

.icon-home_line:before {
  content: '\e66a';
}

.icon-arrow-down:before {
  content: '\e6ee';
}

.icon-arrow-left:before {
  content: '\e6ef';
}

.icon-arrow-right:before {
  content: '\e6f0';
}

.icon-arrow-up:before {
  content: '\e6f1';
}

.icon-arrow-up_fill:before {
  content: '\e6f2';
}

.icon-arrow-down_fill:before {
  content: '\e6f3';
}

.icon-satisfied_fill:before {
  content: '\e666';
}

.icon-satisfied_line:before {
  content: '\e667';
}

.icon-service_fill:before {
  content: '\e68a';
}

.icon-service_line:before {
  content: '\e808';
}

.icon-picture_fill:before {
  content: '\e694';
}

.icon-picture_line:before {
  content: '\e695';
}

.icon-love_fill:before {
  content: '\e6c0';
}

.icon-love_line:before {
  content: '\e6c1';
}

.icon-positioning_fill:before {
  content: '\e6c8';
}

.icon-positioning_line:before {
  content: '\e6c9';
}

.icon-share_line:before {
  content: '\e6ca';
}

.icon-share_fill:before {
  content: '\e6cb';
}

.icon-instructions_fill:before {
  content: '\e664';
}

.icon-instructions_line:before {
  content: '\e665';
}

.icon-succeed_line:before {
  content: '\e66b';
}

.icon-error_line:before {
  content: '\e662';
}

.icon-about_line:before {
  content: '\e66e';
}

.icon-delete_fill:before {
  content: '\e6aa';
}

.icon-photograph_line:before {
  content: '\e6b4';
}

.icon-telephone_fill:before {
  content: '\e6b5';
}

.icon-telephone_line:before {
  content: '\e6b7';
}

.icon-video_line:before {
  content: '\e6b9';
}

.icon-trumpet_line:before {
  content: '\e6ce';
}

.icon-trumpet_fill:before {
  content: '\e6cf';
}

.icon-praise_fill:before {
  content: '\e6e0';
}

.icon-praise_line:before {
  content: '\e6e1';
}

.icon-star_fill:before {
  content: '\e6ea';
}

.icon-star_line:before {
  content: '\e6eb';
}

.icon-succeed_fill:before {
  content: '\e669';
}

.icon-error_fill:before {
  content: '\e660';
}

.icon-about_fill:before {
  content: '\e66f';
}

.icon-delete_line:before {
  content: '\e6a8';
}

.icon-photograph_fill:before {
  content: '\e6b2';
}

.icon-video_fill:before {
  content: '\e6b6';
}

.icon-select:before {
  content: '\e6c5';
}

.icon-assignment_line:before {
  content: '\e703';
}

.icon-discuss_line:before {
  content: '\e700';
}

.icon-speak_line:before {
  content: '\e701';
}

.icon-framework_line:before {
  content: '\e819';
}

.icon-three-service-public_line:before {
  content: '\e6fb';
}

.icon-party_line:before {
  content: '\e702';
}

.icon-shopping_line:before {
  content: '\e809';
}

.icon-wish_line:before {
  content: '\e80c';
}

.icon-control:before {
  content: '\e7a2';
}

.icon-weiji:before {
  content: '\e7a3';
}

.icon-invite:before {
  content: '\e7a6';
}

.icon-Survey_line:before {
  content: '\e80a';
}

.icon-carbon:before {
  content: '\e807';
}

.icon-questionnaire:before {
  content: '\e80a';
}

.icon-log:before {
  content: '\e676';
}
.icon-goods::before {
  content: '\e812';
}
.icon-vendor::before {
  content: '\e814';
}
.icon-stock::before {
  content: '\e813';
}
.icon-zone:before {
  content: '\e810';
}

.icon-hotline:before {
  content: '\e80f';
}

.icon-exercise:before {
  content: '\e80d';
}

.icon-blessing:before {
  content: '\e80e';
}
.icon-law:before {
  content: '\e824';
}
.icon-police:before {
  content: '\e81d';
}
.icon-fuer:before {
  content: '\e81f';
}
.icon-organization:before {
  content: '\e707';
}
.icon-organization-areas:before {
  content: '\e817';
}

.icon-safe-zhangqi:before {
  content: '\e818';
}

.icon-flag:before {
  content: '\e816';
}

.icon-croft:before {
  content: '\e815';
}

.icon-talent:before {
  content: '\e811';
}

.icon-bless::before {
  content: '\e80e';
}

.icon-cockpit_line::before {
  content: '\e6fc';
}

.icon-qiaorenda::before {
  content: '\e821';
}

.icon-zhucan::before {
  content: '\e81b';
}

.icon-microgrid::before {
  content: '\e81c';
}

.icon-bank::before {
  content: '\e823';
}

.icon-organization-spec::before {
  content: '\e825';
}

.icon-feedback::before {
  content: '\e820';
}

.icon-qunshangfa::before {
  content: '\e822';
}

.icon-qingzhiqiao::before {
  content: '\e828';
}

.icon-zones::before {
  content: '\e826';
}
.icon-zhouxiang::before {
  content: '\e82a';
}
</style>
