<template>
  <div>
    <label>{{ label }}</label>
    <div>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CrudFormGroup',
  props: {
    label: {
      type: String,
      default: '',
    },
  },
};

</script>
