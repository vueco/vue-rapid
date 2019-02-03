<template>
  <div class="crud-card">
    <div v-for="(val, key) in value" :key="key">
      <dt>{{ getLabel(key) }}</dt>
      <component v-bind:is="getComponent(val)" :value="val">{{ val }}</component>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'CrudCard',
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    getLabel(key) {
      return _.upperFirst(key);
    },
    getComponent(value) {
      if (_.isObject(value)) {
        return 'CrudCard';
      }
      return 'dd';
    },
  },
};

</script>

<style>
.crud-card {
  padding: 1em;
  border: solid 1px #ccc;
  border-radius: 5px;
}
</style>
