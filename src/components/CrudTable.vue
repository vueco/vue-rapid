<template>
  <table>
    <thead v-if="showHead">
      <tr>
        <th class="row-padding">
          <input type="checkbox"
            :checked="value.length === rows.length"
            @input="selectAll(value.length !== rows.length)">
        </th>
        <template v-if="groupingEnabled">
          <th
            v-for="group in groupBy"
            :key="group">
            <div class="column-header"/>
          </th>
        </template>
        <!-- @slot Custom column header -->
        <slot
          v-for="column in visibleColumns"
          :name="'column-' + column.field"
          :column="column">
          <th
            :key="column.field"
            :title="getColumnLabel(column)"
            :class="getColumnClass(column)"
            @mouseup="isSortableColumn(column) && sortBy(column.field)">
            <div class="column-header">
              <template v-if="isSortableColumn(column)">
                <i
                  :class="sortKey != column.field
                    ? 'fa-sort'
                    : (sortOrders[column.field] > 0
                      ? 'fa-sort-asc'
                  : 'fa-sort-desc')"
                  class="no-print fa"/>
              </template>
              <template>
                {{ getColumnLabel(column) }}
              </template>
            </div>
          </th>
        </slot>
      </tr>

      <!-- @slot Custom totals rows (after header) -->
      <slot
        :colspan="calculatedColumns.length"
        name="totals"/>
    </thead>
    <tbody>
      <template v-for="(row, rowIndex) in rows">
        <template v-if="row.type == '_group' && !contains(hiddenRows, rowIndex)">
          <tr
            :class="'row-level-' + row.level"
            :key="rowIndex">
            <template v-if="groupingEnabled">
              <template v-for="(group, groupIndex) in groupBy">
                <td
                  v-if="groupIndex < row.level"
                  :class="'col-level-' + groupIndex"
                  :key="group">
                  <span/>
                </td>
              </template>
            </template>
            <td
              :colspan="calculatedColumns.length + groupBy.length + 1"
              @click="addIdsToSelection(row.children)">
              <i
                :class="contains(collapsedRows, rowIndex) ?
                'fa-plus-square-o' : 'fa-minus-square-o'"
                class="fa"
                @click.stop="triggerGroup(rowIndex)"/>
              {{ getColumnLabelById(row.key) }}: {{ row.value }}
            </td>
          </tr>
        </template>

        <!-- @slot Custom row -->
        <slot
          v-if="row.type != '_group' && !contains(hiddenRows, rowIndex)"
          :name="`row-${row.id}`"
          :entry="row">
          <tr
            :key="rowIndex"
            :class="{ 'table-info': isSelected(row.id) }"
            class="row-data">
            <td class="row-padding">
              <input type="checkbox"
                :checked="isSelected(row.id)"
                @click="selectIds([row.id], rowIndex, $event)">
            </td>
            <template v-if="groupingEnabled">
              <td
                v-for="(group, groupIndex) in groupBy"
                :key="group"
                :class="'col-level-' + groupIndex"
                class="row-padding">
                <span/>
              </td>
            </template>
            <!-- @slot Custom cell -->
            <td
              v-for="column in visibleColumns"
              :class="column.class"
              :key="column.field">
              <slot
                :name="column.field"
                :entry="row"
                :column="column"
                :value="getCellValue(row, column)">
                <component
                  v-bind:is="getCellComponent(row, column)"
                  :value="getCellValue(row, column)"
                >
                  {{ getCellValue(row, column) }}
                </component>
              </slot>
            </td>
          </tr>
        </slot>
      </template>
    </tbody>
  </table>
</template>

<script>
import _ from 'lodash';
import Vue from 'vue';

import nest from '../helpers/nest';
import plainify from '../helpers/plainify';
import CrudCard from './CrudCard.vue';

/**
 * Table with multiselect, grouping, sorting
 */
export default {
  name: 'CrudTable',
  props: {
    /**
     * Data source. Can be array or hash object
     */
    source: {
      type: [Array, Object],
      default: () => ([]),
    },

    showHead: {
      type: Boolean,
      default: true,
    },

    // TODO: move all data operations out of the component
    type: {
      type: String,
      default: 'client',
    },

    /**
     * Configuration of columns
     */
    columns: {
      type: Array,
      default: () => ([]),
    },

    /**
     * Search filter key
     */
    // TODO: move search out of the component
    filterKey: {
      type: String,
      default: '',
    },

    value: {
      type: Array,
      default: () => ([]),
    },

    /**
     * Array of column ids to group by
     */
    // TODO: move grouping out of the component
    groupBy: {
      type: Array,
      default: () => ([]),
    },

    /**
     * Column id, which should be sorted on page load
     */
    // TODO: move sorting out of the component
    defaultSort: {
      type: String,
      default: 'id',
    },

    defaultSortOrder: {
      type: Number,
      default: 1,
    },
  },

  components: {
    CrudCard,
  },

  data() {
    const sortOrders = {};

    this.columns.forEach((column) => {
      sortOrders[column.field] = 1;
    });

    sortOrders[this.defaultSort] = this.defaultSortOrder;

    return {
      sortKey: this.defaultSort,
      sortOrders,
      selectStartCheckedStatus: true,
      lastSelectedRowIndex: 0,
      firstSelectedRowIndex: 0,
      collapsedRows: [],
      hiddenRows: [],
    };
  },

  computed: {
    calculatedColumns() {
      if (!this.columns.length && this.source.length) {
        return _.keys(this.source[0]).map(column => ({
          field: column,
          label: _.upperFirst(column),
        }));
      }

      return this.columns;
    },
    visibleColumns() {
      return this.calculatedColumns
        .filter(column => !this.groupingEnabled
         || this.groupBy.indexOf(column.field) === -1);
    },
    groupingEnabled() {
      return this.groupBy.length > 0;
    },

    /**
     * Filter and sort data for output
     */
    rows() {
      const filterKey = this.filterKey && this.filterKey.toLowerCase();
      const order = this.sortOrders[this.sortKey] || 1;
      let data = [];

      if (Array.isArray(this.source)) {
        data = this.source;
      } else {
        data = _.keys(this.source).map(id => this.source[id]);
      }

      if (filterKey) {
        data = data.filter(row => Object.keys(row)
          .some(key => String(row[key])
            .toLowerCase()
            .includes(filterKey)));
      }

      if (this.type === 'client' && this.sortKey) {
        data = data.slice().sort((a, b) => {
          a = a[this.sortKey]; // eslint-disable-line no-param-reassign
          b = b[this.sortKey]; // eslint-disable-line no-param-reassign

          if (a === b) {
            return 0;
          }

          return (a > b ? 1 : -1) * order;
        });
      }

      const rows = nest(data, this.groupBy);
      const { deepSequence } = plainify(rows, this.groupBy, (groupBy, key, level, index, ids) => ({
        type: '_group',
        level,
        key: groupBy[level],
        value: key,
        children: ids,
      }));

      return deepSequence;
    },
  },

  watch: {
    groupBy() {
      this.resetState();
    },
  },

  updated() {
    this.$emit('updated');
  },

  methods: {
    /**
     * Reset state of temporary properties
     */
    resetState() {
      this.collapsedRows = [];
      this.hiddenRows = [];
    },

    /**
     * Checks if value exists in sequence
     *
     * @param {Number}  rowIndex
     *
     * @return {Boolean}
     */
    triggerGroup(rowIndex) {
      const index = this.collapsedRows.indexOf(rowIndex);

      if (index === -1) {
        this.collapsedRows.push(rowIndex);
        this.hiddenRows = _.union(
          this.hiddenRows,
          _.range(this.rows[rowIndex].left + 1, this.rows[rowIndex].right + 1),
        );
      } else {
        this.collapsedRows.splice(index, 1);
        this.hiddenRows = _.difference(
          this.hiddenRows,
          _.range(this.rows[rowIndex].left + 1, this.rows[rowIndex].right + 1),
        );
      }
    },

    /**
     * Checks if value exists in sequence
     *
     * @param {Array}  sequence
     * @param {String} value
     *
     * @return {Boolean}
     */
    contains(sequence, value) {
      return _.indexOf(sequence, value) !== -1;
    },

    /**
     * Set sort column
     *
     * @param {String} key
     */
    sortBy(key) {
      this.sortKey = key;
      this.collapsedRows = [];
      this.hiddenRows = [];

      Vue.set(this.sortOrders, key, this.sortOrders[key] ? this.sortOrders[key] * -1 : 1);

      this.$emit('changeSorting', key, this.sortOrders[key]);
    },

    // TODO: move selection out of the component
    selectIds(ids, rowIndex, event) {
      let value = ids;

      if (typeof rowIndex === 'number') {
        if (event && event.shiftKey) {
          _.range(this.lastSelectedRowIndex, rowIndex).forEach((index) => {
            value.push(this.rows[index].id);
          });
        } else {
          this.lastSelectedRowIndex = rowIndex;
        }
      }

      if (event && (event.metaKey || event.ctrlKey)) {
        if (this.value.includes(value[0])) {
          value = _.difference(this.value, value);
        } else {
          value = _.union(this.value, value);
        }
      } else if (this.value.includes(value[0])) {
        value = [];
      }

      this.$emit('input', value);
    },

    selectAll(select) {
      if (select) {
        this.selectIds(this.rows.map(row => row.id));
      } else {
        this.selectIds([]);
      }
    },

    /**
     * Add ids to selection
     *
     * @param {Number[]} ids
     */
    addIdsToSelection(ids) {
      this.selectIds(ids);
    },

    /**
     * Check if row is in selectedIds list
     *
     * @param {Number} id
     *
     * @return {boolean}
     */
    isSelected(id) {
      if (!this.value.length) {
        return false;
      }

      return this.value.includes(id);
    },

    /**
     * Check if column is sortable
     *
     * @param {String} column
     *
     * @return {Boolean}
     */
    isSortableColumn(column) {
      return !_.has(column, 'sortable') || column.sortable === true;
    },

    /**
     * Get column label
     *
     * @param {GridColumn} column
     *
     * @return {String}
     */
    getColumnLabel(column) {
      if (typeof (column) === 'object' && typeof (column.label) === 'string') {
        return column.label;
      }
      return column;
    },

    /**
     * Get label of column by id
     *
     * @param {String} columnId
     *
     * @return {String}
     */
    getColumnLabelById(columnId) {
      if (!this.calculatedColumns) {
        return false;
      }

      const column = _.find(this.calculatedColumns, { field: columnId });

      if (!column) {
        return false;
      }

      return column.label;
    },

    /**
     * Get column class
     *
     * @param {GridColumn} column
     *
     * @return {String[]}
     */
    getColumnClass(column) {
      const classes = [];

      if (this.isSortableColumn(column)) {
        classes.push('sortable');
      }

      if (typeof (column) === 'object' && typeof (column.class) === 'string') {
        classes.push(column.class);
      }

      return classes;
    },

    getCellComponent(row, column) {
      if (column.component) {
        return column.component;
      }

      if (_.isObject(this.getCellValue(row, column))) {
        return 'CrudCard';
      }

      return 'div';
    },

    /**
     * Get cell value
     */
    getCellValue(row, column) {
      let value = _.get(row, column.field);

      if (!value) {
        return '';
      }

      let { filter } = column;
      const { getter } = column;

      let args = [];

      if (getter) {
        value = getter(value, row);
      }

      if (filter) {
        if (Array.isArray(filter)) {
          [filter, ...args] = filter;
        }

        if (this.$options.filters[filter]) {
          value = this.$options.filters[filter](value, ...args);
        }
      }

      return value;
    },
  },
};

/**
 * GridColumn
 *
 * @typedef {Object} GridColumn
 * @property {string} id
 * @property {string} label
 * @property {string} type
 * @property {string} sortable
 */
</script>

<style scoped>
  .table-hover tr .col-level-1,
  .table-hover .row-level-1 td {
    font-weight: bold;
    background: #ecedf0;
  }

  .table-hover tr .col-level-0,
  .table-hover .row-level-0 td {
    font-weight: bold;
    background: #e0e4e7;
  }

  table .sortable {
    cursor: pointer;
  }

  table th .fa {
    float: left;
    margin-top: 4px;
  }

  .column-header {
    overflow: hidden !important;
  }

  .column-header .fa {
    margin-right: 5px;
  }

  .header {
    margin-bottom: 0;
    box-shadow: 0 2px 2px #eee;
  }

  .hidden {
    display: none;
  }

  .row-padding {
    width: 30px !important;
  }

  @media screen {
    .no-screen {
      display: none;
    }
  }

  @media print {
    .no-print, .no-print * {
      display: none !important;
    }
  }
</style>
