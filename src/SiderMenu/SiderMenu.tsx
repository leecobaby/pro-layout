import { FunctionalComponent, computed } from 'vue';
import 'ant-design-vue/es/layout/style';
import Layout from 'ant-design-vue/es/layout';
import 'ant-design-vue/es/menu/style';
import Menu from 'ant-design-vue/es/menu';
import BaseMenu, { BaseMenuProps } from './BaseMenu';
import { FormatMessage, WithFalse, CustomRender } from '../typings';
import { SiderProps } from './typings';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
import { useRouteContext } from '../RouteContext';
import { getMenuFirstChildren } from '../utils';
import './index.less';

const { Sider } = Layout;

export type PrivateSiderMenuProps = {
  matchMenuKeys?: string[];
};

export interface SiderMenuProps
  extends Pick<BaseMenuProps, Exclude<keyof BaseMenuProps, ['onCollapse']>> {
  logo?: CustomRender;
  siderWidth?: number;
  collapsedWidth?: number;
  menuHeaderRender?: WithFalse<
    (logo: CustomRender, title: CustomRender, props?: SiderMenuProps) => CustomRender
  >;
  menuFooterRender?: WithFalse<(props?: SiderMenuProps) => CustomRender>;
  menuContentRender?: WithFalse<(props: SiderMenuProps, defaultDom: CustomRender) => CustomRender>;
  menuExtraRender?: WithFalse<(props: SiderMenuProps) => CustomRender>;
  collapsedButtonRender?: WithFalse<(collapsed?: boolean) => CustomRender>;
  breakpoint?: SiderProps['breakpoint'] | false;
  onMenuHeaderClick?: (e: MouseEvent) => void;
  fixed?: boolean;
  hide?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  onOpenKeys?: (openKeys: WithFalse<string[]>) => void;
  onSelect?: (selectedKeys: WithFalse<string[]>) => void;
}

export const defaultRenderLogo = (logo?: CustomRender): CustomRender => {
  if (!logo) {
    return null;
  }
  if (typeof logo === 'string') {
    return <img src={logo} alt="logo" />;
  }
  if (typeof logo === 'function') {
    return logo();
  }
  return logo;
};

export const defaultRenderLogoAndTitle = (
  props: SiderMenuProps,
  renderKey: string | undefined = 'menuHeaderRender',
): CustomRender | null => {
  const {
    logo = 'https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg',
    title,
    layout,
  } = props;
  const renderFunction = (props as any)[renderKey || ''];
  if (renderFunction === false) {
    return null;
  }
  const logoDom = defaultRenderLogo(logo);
  const titleDom = <h1>{title}</h1>;
  // call menuHeaderRender
  if (renderFunction) {
    // when collapsed, no render title
    return renderFunction(logoDom, props.collapsed ? null : titleDom, props);
  }
  if (layout === 'mix' && renderKey === 'menuHeaderRender') {
    return null;
  }
  return (
    <a>
      {logoDom}
      {props.collapsed ? null : titleDom}
    </a>
  );
};

export const defaultRenderCollapsedButton = (collapsed?: boolean): CustomRender =>
  collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />;

const SiderMenu: FunctionalComponent<SiderMenuProps> = (props: SiderMenuProps) => {
  const {
    collapsed,
    siderWidth,
    breakpoint,
    collapsedWidth = 48,
    menuExtraRender = false,
    menuContentRender = false,
    menuFooterRender = false,
    collapsedButtonRender = defaultRenderCollapsedButton,

    onCollapse,
    onOpenKeys,
    onSelect,
  } = props;
  const context = useRouteContext();
  const { getPrefixCls, i18n } = context;
  const baseClassName = getPrefixCls('sider');
  // const isMix = computed(() => props.layout === 'mix');
  // const fixed = computed(() => context.fixSiderbar);
  const runtimeTheme = computed(() => (props.layout === 'mix' && 'light') || props.navTheme);
  const runtimeSideWidth = computed(() =>
    props.collapsed ? props.collapsedWidth : props.siderWidth,
  );
  const classNames = computed(() => {
    return {
      [baseClassName]: true,
      [`${baseClassName}-${runtimeTheme.value}`]: true,
      [`${baseClassName}-${props.layout}`]: true,
      [`${baseClassName}-fixed`]: context.fixSiderbar,
    };
  });
  const hasSide = computed(() => (props.layout === 'mix' && props.splitMenus) || false);
  const flatMenuData = computed(() => {
    return (hasSide.value && getMenuFirstChildren(context.menuData, context.selectedKeys[0])) || [];
  });
  // call menuHeaderRender
  const headerDom = defaultRenderLogoAndTitle(props);
  const extraDom = menuExtraRender && menuExtraRender(props);
  if (hasSide.value && flatMenuData.value.length === 0) {
    return null;
  }
  const defaultMenuDom = (
    <BaseMenu
      prefixCls={getPrefixCls()}
      i18n={i18n as FormatMessage}
      theme={runtimeTheme.value === 'realDark' ? 'dark' : runtimeTheme.value}
      mode="inline"
      menuData={hasSide.value ? flatMenuData.value : context.menuData}
      collapsed={props.collapsed}
      openKeys={context.openKeys}
      selectedKeys={context.selectedKeys}
      menuItemRender={props.menuItemRender}
      subMenuItemRender={props.subMenuItemRender}
      style={{
        width: '100%',
      }}
      class={`${baseClassName}-menu`}
      {...{
        'onUpdate:openKeys': ($event: string[]) => onOpenKeys && onOpenKeys($event),
        'onUpdate:selectedKeys': ($event: string[]) => onSelect && onSelect($event),
      }}
    />
  );

  return (
    <>
      {context.fixSiderbar && (
        <div
          style={{
            width: `${runtimeSideWidth.value}px`,
            overflow: 'hidden',
            flex: `0 0 ${runtimeSideWidth.value}px`,
            maxWidth: `${runtimeSideWidth.value}px`,
            minWidth: `${runtimeSideWidth.value}px`,
          }}
        />
      )}
      <Sider
        class={classNames.value}
        theme={runtimeTheme.value === 'realDark' ? 'dark' : runtimeTheme.value}
        width={siderWidth}
        breakpoint={breakpoint || undefined}
        collapsed={collapsed}
        collapsible={false}
        collapsedWidth={collapsedWidth}
      >
        <div class={`${baseClassName}-logo`}>{headerDom}</div>
        {extraDom && (
          <div class={`${baseClassName}-extra ${!headerDom && `${baseClassName}-extra-no-logo`}`}>
            {extraDom}
          </div>
        )}
        <div style="flex: 1; overflow: hidden auto;">
          {(menuContentRender && menuContentRender(props, defaultMenuDom)) || defaultMenuDom}
        </div>
        <div class={`${baseClassName}-links`}>
          <Menu
            class={`${baseClassName}-link-menu`}
            inlineIndent={16}
            theme={runtimeTheme.value as 'light' | 'dark'}
            selectedKeys={[]}
            openKeys={[]}
            mode="inline"
            onClick={() => {
              if (onCollapse) {
                onCollapse(!props.collapsed);
              }
            }}
          >
            <Menu.Item
              key={'collapsed-button'}
              class={`${baseClassName}-collapsed-button`}
              title={null}
            >
              {collapsedButtonRender && collapsedButtonRender(collapsed)}
            </Menu.Item>
          </Menu>
        </div>
        {menuFooterRender && <div class={`${baseClassName}-footer`}>{menuFooterRender(props)}</div>}
      </Sider>
    </>
  );
};

export default SiderMenu;
