export default [
  {
    field: 'id',
    label: 'Id',
  },
  {
    field: 'status',
    label: 'Status',
    column: true,
  },
  {
    field: 'name',
    label: 'Name',
    column: {
      component: 'input',
    },
    form: {
      component: 'input',
    },
  },
  {
    field: 'age',
    label: 'Age',
    column: {
      component: 'input',
    },
    form: {
      component: 'input',
    },
  },
];
