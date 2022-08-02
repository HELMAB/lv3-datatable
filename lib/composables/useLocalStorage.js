const setState = (key, initValue) => {
  if (initValue === undefined || initValue === null) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, JSON.stringify(initValue))
  }
}

const getState = (key) => {
  return JSON.parse(localStorage.getItem(key))
}

const setDataTableState = (tableId, { length, search, page, start, defaultOrder, recordsTotal, recordsFiltered }) => {
  setState(`${tableId}_length`, length)
  setState(`${tableId}_search`, search)
  setState(`${tableId}_page`, page)
  setState(`${tableId}_start`, start)
  setState(`${tableId}_defaultOrder`, defaultOrder)
  setState(`${tableId}_recordsTotal`, recordsTotal)
  setState(`${tableId}_recordsFiltered`, recordsFiltered)
}

const getDataTableState = (tableId) => {
  const length = getState(`${tableId}_length`)
  const search = getState(`${tableId}_search`)
  const page = getState(`${tableId}_page`)
  const start = getState(`${tableId}_start`)
  const defaultOrder = getState(`${tableId}_defaultOrder`)
  const recordsTotal = getState(`${tableId}_recordsTotal`)
  const recordsFiltered = getState(`${tableId}_recordsFiltered`)

  return { length, search, page, start, defaultOrder, recordsTotal, recordsFiltered }
}

export default { setDataTableState, getDataTableState }
