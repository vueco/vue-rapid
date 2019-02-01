import DataSource from './index';

export default {
  name: 'DataSourceStore',
  mixins: [DataSource],
  props: {
    id: {
      type: String,
      default: '',
    },
    entity: {
      type: String,
      default: '',
    },
    schema: {
      type: String,
      default: '',
    },
    fetchAction: {
      type: String,
      default: 'load',
    },
    selectAction: {
      type: String,
      default: 'select',
    },
    addAction: {
      type: String,
      default: 'add',
    },
    updateAction: {
      type: String,
      default: 'update',
    },
  },
  computed: {
    collection() {
      return this.$store[this.entity].state.collection;
    },
    loaded() {
      return this.$store[this.store].state.loaded;
    },
    saving() {
      return this.$store[this.store].state.saving;
    },
    selection() {
      return this.$store[this.store].state.selection;
    },
    fields() {
      return this.$schema[this.entity];
    },
  },
  watch: {
    loaded: 'load',
    $router: 'load',
    id: 'load',
  },
  mounted() {
    this.fetch();
  },
  methods: {
    fetch() {
      if (this.id === '-') {
        return;
      }

      this.$store.dispatch(
        `${this.entity}/${this.fetchAction}`,
        {
          filters: this.filters,
          limit: this.limit,
        },
      );
    },
    load() {
      if (!this.loaded) {
        this.fetch();
      }

      this.saving = false;

      if (this.id && this.collection[this.id]) {
        this.$emit('input', { ...this.collection[this.id] });
      }
    },
    select(ids) {
      this.$store.commit(`${this.store}/${this.selectAction}`, ids);
    },
    async save() {
      this.saving = true;

      if (this.id === '-') {
        await this.$store.dispatch(`${this.entity}/${this.addAction}`, this.value);
      } else {
        await this.$store.dispatch(`${this.entity}/${this.updateAction}`, {
          id: this.id,
          data: this.value,
        });
      }
      this.$emit('save');
    },
  },
};
