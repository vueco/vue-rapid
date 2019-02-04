export default (name, config) => (store) => {
  store.registerModule(name, config);
};
