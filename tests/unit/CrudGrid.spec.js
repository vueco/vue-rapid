import { shallowMount } from '@vue/test-utils';
import Grid from '@/crud/Grid.vue';

describe('CrudGrid.vue', () => {
  it('renders props.source when passed', () => {
    const source = [];
    const wrapper = shallowMount(Grid, {
      propsData: { source },
    });
    expect(wrapper.text()).toMatch('');
  });
});
