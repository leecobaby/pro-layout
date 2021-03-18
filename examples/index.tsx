import 'ant-design-vue/dist/antd.less';
import { createApp, defineComponent, watch, ref, watchEffect, onMounted } from 'vue';
import { createRouter, createWebHashHistory, useRoute, useRouter, RouteRecord } from 'vue-router';
import { Avatar, Button, Space, Select, Switch } from 'ant-design-vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { default as ProLayout, FooterToolbar, WaterMark } from '../src/';
import { globalState as state } from './state';
import './demo.less';

import registerIcons from './_util/icons';

// demo pages
import Page1 from './demo/page1';
import Welcome from './demo/welcome';
import FormPage from './demo/form';
import ChildPage from './demo/child/child-page';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = () => {};

const getMenuData = (routes: RouteRecord[]) => {
  const childrenRoute = routes.find(route => route.path === '/');
  return childrenRoute?.children || [];
};

const BasicLayout = defineComponent({
  name: 'BasicLayout',
  inheritAttrs: false,
  setup() {
    const { getRoutes } = useRouter();
    const route = useRoute();

    const menuData = getMenuData(getRoutes());

    const updateSelectedMenu = () => {
      const matched = route.matched.concat().map(item => item.path);
      matched.shift();
      state.selectedKeys = matched;
    };

    onMounted(() => {
      // if sider collapsed, set openKeys is null.
      const cacheOpenKeys = ref<string[]>([]);
      watch(
        () => state.collapsed,
        (collapsed: boolean) => {
          if (collapsed) {
            cacheOpenKeys.value = state.openKeys;
            state.openKeys = [];
          } else {
            state.openKeys = cacheOpenKeys.value;
          }
        },
      );

      // watch route
      watchEffect(() => {
        updateSelectedMenu();
      });
    });

    return () => (
      <ProLayout
        layout={state.layout}
        navTheme={state.navTheme}
        i18n={(key: string) => key}
        isMobile={state.isMobile}
        fixSiderbar={state.fixSiderbar}
        fixedHeader={state.fixedHeader}
        contentWidth={'Fixed'}
        primaryColor={'#1890ff'}
        contentStyle={{ minHeight: '300px' }}
        siderWidth={state.sideWidth}
        splitMenus={state.splitMenus}
        menuData={menuData}
        collapsed={state.collapsed}
        openKeys={state.openKeys}
        selectedKeys={state.selectedKeys}
        onCollapse={$event => {
          state.collapsed = $event;
        }}
        onOpenKeys={$event => {
          state.openKeys = $event;
        }}
        onSelect={updateSelectedMenu}
        rightContentRender={props => (
          <div
            class={['right-content', `${props.layout}-${props.navTheme}`]}
            style={{ marginRight: '16px' }}
          >
            <span>
              <Avatar icon={<UserOutlined />} /> Sendya
            </span>
          </div>
        )}
        menuHeaderRender={() => (
          <a>
            <img src="https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg" />
            {state.collapsed && state.layout !== 'mix' ? null : <h1>Pro Preview</h1>}
          </a>
        )}
        // {...{
        //   'onUpdate:collapsed': noop,
        //   'onUpdate:openKeys': noop,
        //   'onUpdate:selectedKeys': noop,
        // }}
      >
        <WaterMark content="Ant Design Pro of Vue">
          <router-view />
        </WaterMark>
        <FooterToolbar>
          <Space>
            <Button
              onClick={() => {
                state.navTheme = state.navTheme === 'dark' ? 'light' : 'dark';
              }}
            >
              Theme Switch
            </Button>
            <Select
              getPopupContainer={triggerNode => triggerNode.parentNode}
              value={state.layout}
              onChange={val => {
                state.layout = val;
              }}
              style={{ width: '150px' }}
            >
              <Select.Option value="side">Side</Select.Option>
              <Select.Option value="top">Top</Select.Option>
              <Select.Option value="mix">Mix</Select.Option>
            </Select>
            <Switch
              checkedChildren="Fixed Header"
              unCheckedChildren="UnFixed Header"
              checked={state.fixedHeader}
              onChange={() => {
                state.fixedHeader = !state.fixedHeader;
              }}
            />
            <Switch
              checkedChildren="Fixed SideBar"
              unCheckedChildren="UnFixed SideBar"
              checked={state.fixSiderbar}
              onChange={() => {
                state.fixSiderbar = !state.fixSiderbar;
              }}
            />
            <Switch
              checkedChildren="Split Menus"
              unCheckedChildren="Un Split Menus"
              checked={state.splitMenus}
              onChange={() => {
                state.splitMenus = !state.splitMenus;
              }}
            />
          </Space>
        </FooterToolbar>
      </ProLayout>
    );
  },
});

const SimpleDemo = {
  setup() {
    return () => (
      <div style={{ height: '100%' }}>
        <router-view />
      </div>
    );
  },
};

const RouteView = defineComponent({
  setup() {
    return () => <router-view />;
  },
});

const routes = [
  {
    path: '/welcome',
    name: 'welcome',
    meta: { title: 'Welcome', icon: 'SmileOutlined' },
    component: Welcome,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: { title: 'dashboard', icon: 'SmileOutlined' },
    redirect: '/dashboard/analysis',
    component: RouteView,
    children: [
      {
        path: '/dashboard/analysis',
        name: 'analysis',
        meta: { icon: 'SmileOutlined', title: 'Analysis' },
        component: Page1,
      },
      {
        path: '/dashboard/monitor',
        name: 'monitor',
        meta: { icon: 'SmileOutlined', title: 'Monitor' },
        component: Page1,
      },
      {
        path: '/dashboard/workplace',
        name: 'workplace',
        meta: { icon: 'SmileOutlined', title: 'Workplace' },
        component: Page1,
      },
    ],
  },
  {
    path: '/form',
    name: 'form',
    meta: { title: 'Form', icon: 'SmileOutlined' },
    redirect: '/form/basic-form',
    component: RouteView,
    children: [
      {
        path: '/form/basic-form',
        name: 'basic-form',
        meta: { icon: 'SmileOutlined', title: 'Basic Form' },
        component: FormPage,
      },
      {
        path: '/form/step-form',
        name: 'step-form',
        meta: { icon: 'SmileOutlined', title: 'Step Form' },
        component: FormPage,
      },
      {
        path: '/form/advanced-form',
        name: 'advance-form',
        meta: { icon: 'SmileOutlined', title: 'Advanced Form' },
        component: FormPage,
      },
      {
        path: '/form/child',
        name: 'child-form',
        meta: { icon: 'SmileOutlined', hideInMenu: true, title: 'Child Form' },
        redirect: '/form/child/page1',
        component: ChildPage,
        children: [
          {
            path: '/form/child/page1',
            name: 'child-page1-form',
            meta: { title: 'Page1 Child' },
            component: FormPage,
          },
          {
            path: '/form/child/page2',
            name: 'child-page2-form',
            meta: { title: 'Page2 Child' },
            component: FormPage,
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  routes: [
    {
      path: '/',
      name: 'index',
      meta: { title: '' },
      redirect: '/welcome',
      component: BasicLayout,
      children: routes,
    },
  ],
  history: createWebHashHistory(),
});

const app = createApp(SimpleDemo);

registerIcons(app);

app.use(router).use(ProLayout).mount('#app');
