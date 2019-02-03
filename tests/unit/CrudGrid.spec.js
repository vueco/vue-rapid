import { shallowMount } from '@vue/test-utils';
import CrudTable from '@/components/CrudTable.vue';

describe('CrudTable.vue', () => {
  it('renders props.source when passed', () => {
    const source = [];
    const wrapper = shallowMount(CrudTable, {
      propsData: { source },
    });
    expect(wrapper.text()).toMatch('');
  });
});
