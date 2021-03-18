import { computed, defineComponent, onBeforeUnmount, onMounted, PropType, VNodeChild } from 'vue';
import { useProProvider } from '../ProProvider';
import { RouteContextProps, useRouteContext } from '../RouteContext';
import './index.less';

export interface FooterToolbarProps {
  extra?: VNodeChild | JSX.Element;
  renderContent?: (
    props: FooterToolbarProps & RouteContextProps & { leftWidth?: string },
    dom: JSX.Element,
  ) => VNodeChild | JSX.Element;
  getContainer?: (triggerNode: HTMLElement) => HTMLElement | null;
  prefixCls?: string;
}

const FooterToolbarProps = {
  extra: { type: Object as PropType<VNodeChild> },
  renderContent: {
    type: Function as PropType<FooterToolbarProps['renderContent']>,
  },
  getContainer: {
    type: Function as PropType<FooterToolbarProps['getContainer']>,
  },
  prefixCls: { type: String as PropType<string> },
};

const FooterToolbar = defineComponent({
  name: 'FooterToolbar',
  props: FooterToolbarProps,
  setup(props, ctx) {
    const { slots } = ctx;
    const routeContext = useRouteContext();
    const { getPrefixCls } = routeContext;
    const baseClassName = props.prefixCls || getPrefixCls('footer-bar');

    const width = computed(() => {
      const { hasSideMenu, isMobile, sideWidth, layout } = routeContext;
      if (!hasSideMenu) {
        return undefined;
      }
      if (!sideWidth || layout === 'top') {
        return '100%';
      }
      return isMobile ? '100%' : `calc(100% - ${sideWidth}px)`;
    });

    const dom = () => {
      return (
        <>
          <div class={`${baseClassName}-left`}>{props.extra}</div>
          <div class={`${baseClassName}-right`}>{slots.default?.()}</div>
        </>
      );
    };
    onMounted(() => {
      routeContext.setHasFooterToolbar && routeContext.setHasFooterToolbar(true);
    });
    onBeforeUnmount(() => {
      routeContext.setHasFooterToolbar && routeContext.setHasFooterToolbar(false);
    });

    return () => (
      <div class={baseClassName} style={{ width: width.value }}>
        {props.renderContent
          ? props.renderContent(
              {
                ...props,
                ...routeContext,
                leftWidth: width.value,
              },
              dom(),
            )
          : dom()}
      </div>
    );
  },
});

export default FooterToolbar;
