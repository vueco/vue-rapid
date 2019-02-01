import { storiesOf } from '@storybook/vue';
import CrudForm from '@/components/CrudForm.vue';
import rows from '../users.json';

storiesOf('CrudForm', module)
  .add('Basic', () => ({
    components: { CrudForm },
    data: () => ({
      rows,
    }),
    template: '<crud-form class="m-3" v-model="rows[0]"/>',
  }));
