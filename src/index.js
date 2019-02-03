import Vue from 'vue';
import CrudTable from './components/CrudTable.vue';
import CrudForm from './components/CrudForm.vue';
import CrudFormGroup from './components/CrudFormGroup.vue';
import CrudCard from './components/CrudCard.vue';

const Components = {
  CrudTable,
  CrudForm,
  CrudFormGroup,
  CrudCard,
};

Object.keys(Components).forEach((name) => {
  Vue.component(name, Components[name]);
});

export default Components;
