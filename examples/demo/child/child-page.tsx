import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { i18n } from '../../index';
import { PageContainer } from '../../../src';

export default defineComponent({
  setup() {
    const route = useRoute();

    return () => (
      <PageContainer title={i18n(`${route.meta.title}`)}>
        <router-view />
      </PageContainer>
    );
  },
});
