import Vue from 'vue';
import CrudTable from './components/CrudTable.vue';
import CrudForm from './components/CrudForm.vue';
import CrudFormGroup from './components/CrudFormGroup.vue';

const Components = {
  CrudTable,
  CrudForm,
  CrudFormGroup,
};

Object.keys(Components).forEach((name) => {
  Vue.component(name, Components[name]);
});

export default Components;
