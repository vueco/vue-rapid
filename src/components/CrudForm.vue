<template>
  <component v-bind:is="form">
    <component v-bind:is="formGroup"
      v-for="field in fields"
      :key="field.field"
      :class="formGroupClass"
      :label="field.label">
      <component
        v-if="field.form"
        v-bind:is="field.form.component"
        v-bind="field.form"
        :value="getValue(field)"
        @input="val => setValue(field, val)"/>
    </component>
  </component>
</template>

<script>
import _ from 'lodash';
import CrudFormGroup from './CrudFormGroup.vue';

export default {
  name: 'CrudForm',
  components: {
    CrudFormGroup,
  },
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    schema: {
      type: Array,
      default: () => ([]),
    },
    form: {
      type: String,
      default: 'form',
    },
    formGroup: {
      type: String,
      default: 'crud-form-group',
    },
    formGroupClass: {
      type: String,
      default: '',
    },
  },
  computed: {
    fields() {
      if (!this.schema.length) {
        return _.keys(this.value).map(key => ({
          field: key,
          label: _.upperFirst(key),
          form: {
            component: _.isPlainObject(this.value[key]) ? 'CrudForm' : 'input',
            class: _.isPlainObject(this.value[key]) ? 'm-3' : 'form-control',
          },
        }));
      }
      return this.schema;
    },
  },
  methods: {
    setValue(field, value) {
      const data = { ...this.value };

      let newValue = value;
      if (newValue instanceof InputEvent) {
        newValue = newValue.target.value;
      }

      data[field.field] = newValue;
      this.$emit('input', data);
    },
    getValue(field) {
      let value = this.value[field.field] || field.form.value;

      if (field.form.filter) {
        if (!this.$options.filters[field.form.filter]) {
          console.warn(`Filter '${field.form.filter}' is not defined`);
        } else {
          value = this.$options.filters[field.form.filter](value);
        }
      }

      return value;
    },
  },
};
</script>
