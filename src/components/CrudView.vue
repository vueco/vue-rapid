<template>
  <div v-if="!id">
    <portal to="navigation">
      <b-button-toolbar>
        <b-btn @click="edit('-')">Add</b-btn>
        <b-btn @click="edit(ids[0])" :disabled="ids.length != 1">Edit</b-btn>
        <template v-for="filter in schema.filter(field => field.toolbarFilter)">
          <b-dropdown :key="`filter_${filter.field}`" :text="`${filter.label}: ${internalFilters[filter.field] || 'All'} (${count}+)`">
            <b-dropdown-item @click="setFilter(filter.field, null)">All</b-dropdown-item>
            <b-dropdown-item
              v-for="item in filter.values"
              :key="item.value"
              @click="setFilter(filter.field, item.value)">{{ item.label }}</b-dropdown-item>
          </b-dropdown>
        </template>
        <slot name="index-actions"></slot>
      </b-button-toolbar>
    </portal>

    <div class="table-responsive">
      <crud-table
        class="table table-bordered"
        v-model="ids"
        :source="collection"
        :columns="schema.filter(field => field.column)"
        :default-sort="orderBy[0]"
        :default-sort-order="orderBy[1] === 'desc' ? -1 : 1"
        v-bind="crudTableAttrs"
      />
      <div class="text-center m-5">
        <b-btn @click="fetch()">Load More</b-btn>
      </div>
    </div>
  </div>
  <div v-else>
    <portal to="navigation">
      <b-button-toolbar>
        <b-btn @click="index()" class="mx-1">Back</b-btn>
        <b-btn variant="primary" class="mx-1" @click="save">Save</b-btn>
        <slot name="actions"></slot>
      </b-button-toolbar>
    </portal>

    <b-card bg-variant="light">
      <crud-form v-model="entity" :schema="schema.filter(field => field.form)" formGroup="b-form-group" formGroupClass="m-2"/>
    </b-card>
    <slot name="footer"></slot>
  </div>
</template>

<script>
import _ from 'lodash'
import Vue from 'vue'

export default {
  name: 'CrudView',
  props: {
    id: {
      type: String,
      default: ''
    },
    store: {
      type: String,
      default: ''
    },
    value: {
      type: [Object, Boolean],
      default: false
    },
    filters: {
      type: Object,
      default: () => ({})
    },
    limit: {
      type: Number,
      default: 50
    },
    orderBy: {
      type: Array,
      default: () => ([])
    }
  },
  data: () => ({
    saving: false,
    ids: [],
    internalFilters: {},
    entity: {}
  }),
  watch: {
    $router: 'fetch',
    id: 'load',
    store: 'fetch',
    value (newVal) {
      this.entity = newVal
    },
    entity (newVal) {
      this.$emit('input', newVal)
    }
  },
  mounted () {
    this.fetch()
    this.internalFilters = { ...this.filters }
  },
  computed: {
    crudTableAttrs () {
      if (!this.$schema[this.store].views) {
        return {}
      }
      return this.$schema[this.store].views.index
    },
    schema () {
      return this.$schema[this.store].fields
    },
    collection () {
      return this.$store.state[this.store].collection
    },
    count () {
      return _.keys(this.$store.state[this.store].collection).length
    }
  },
  methods: {
    setFilter (field, value) {
      this.$store.commit(`${this.store}/RESET_VUEX_EASY_FIRESTORE_STATE`)
      Vue.set(this.internalFilters, field, value)
      this.fetch()
    },
    async fetch () {
      if (this.id === '-') {
        return
      }

      const where = []

      _.keys(this.internalFilters).forEach(field => {
        where.push([field, '==', this.internalFilters[field]])
      })

      await this.$store.dispatch(
        `${this.store}/fetchAndAdd`,
        {
          where,
          orderBy: this.orderBy,
          limit: this.limit
        }
      )

      this.load()
    },
    load () {
      this.saving = false

      if (this.id && this.collection[this.id]) {
        this.entity = { ...this.collection[this.id] }
      }

      if (this.id === '-') {
        this.entity = {}
      }
    },
    index () {
      this.$router.push(`/${this.store}`)
      this.$emit('index')
    },
    edit (id) {
      this.$router.push(`/${this.store}/${id}`)
      this.$emit('edit', id)
    },
    async save () {
      await this.$store.dispatch(`${this.store}/set`, this.entity)

      this.index()
    }
  }
}
</script>
