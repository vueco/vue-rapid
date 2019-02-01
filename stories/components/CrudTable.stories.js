import { storiesOf } from '@storybook/vue';
import CrudTable from '@/components/CrudTable.vue';
import rows from '../users.json';

storiesOf('CrudTable', module)
  .add('Basic', () => ({
    components: { CrudTable },
    data: () => ({
      rows,
      selectedIds: [],
    }),
    template: '<crud-table v-model="selectedIds" :source="rows" class="m-3 table table-bordered table-hover"/>',
  }));
