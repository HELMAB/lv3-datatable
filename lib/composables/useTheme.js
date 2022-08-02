const theme = ({ rowClasses, colClasses, table, paginate }) => {
  return {
    row: rowClasses,
    col: colClasses,
    table,
    paginate
  }
}

const themeData = (design = 'bootstrap3') => {
  switch (design) {
    case 'bootstrap5':
      return theme({
        rowClasses: 'row',
        colClasses: 'col-md-12',
        table: {
          colClasses: 'col-md-12',
          tableClasses: 'table table-striped table-bordered table-sm',
          tableContainer: 'position-relative',
          formClasses: 'form-horizontal',
          inputSearchClasses: 'form-control',
          inputLengthOptionClasses: 'form-control'
        },
        paginate: {
          colClasses: 'col-md-12',
          containerClass: 'pagination',
          pageClass: 'page-item',
          pageLinkClass: 'page-link'
        }
      })
    case 'bootstrap4':
      return theme({
        rowClasses: 'row',
        colClasses: 'col-md-12',
        table: {
          colClasses: 'col-md-12',
          tableClasses: 'table table-striped table-bordered table-sm',
          tableContainer: 'position-relative',
          formClasses: 'form-horizontal',
          inputSearchClasses: 'form-control',
          inputLengthOptionClasses: 'form-control'
        },
        paginate: {
          colClasses: 'col-md-12',
          containerClass: 'pagination',
          pageClass: 'page-item',
          pageLinkClass: 'page-link'
        }
      })
    default:
      return theme({
        rowClasses: 'row',
        colClasses: 'col-md-12',
        table: {
          colClasses: 'col-md-12',
          tableClasses: 'table table-striped table-bordered',
          tableContainer: 'position-relative',
          formClasses: 'form-horizontal',
          inputSearchClasses: 'form-control',
          inputLengthOptionClasses: 'form-control'
        },
        paginate: {
          colClasses: 'col-md-12',
          containerClass: 'pagination',
          pageClass: 'page-item',
          pageLinkClass: null
        }
      })
  }
}

export default themeData
