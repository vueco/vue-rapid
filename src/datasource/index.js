export default {
  name: 'DataSource',
  render() {
    return this.$scopedSlots.default({
      collection: this.collection,
      fields: this.fields,
      selection: this.selection,
      loaded: this.loaded,
    });
  },
};
