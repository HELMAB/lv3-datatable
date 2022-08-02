<template>
  <div :class="theme.row">
    <div :class="theme.col">
      <div class="table-header-container">
        <div class="table-header-length-options">
          {{ sLengthMenu[0] }}
          <div :class="theme.table.formClasses">
            <select
                v-model="length"
                :class="theme.table.inputLengthOptionClasses"
            >
              <option
                  v-for="(option, key) in lengthOptions"
                  :key="key"
                  :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          {{ sLengthMenu[1] }}
        </div>
        <div class="table-header-search">
          {{ selectedLocale.sSearch }}
          <div :class="theme.table.formClasses">
            <input
                v-model="search"
                :class="theme.table.inputSearchClasses"
                type="text"
                @keydown="onSearch"
            />
          </div>
        </div>
      </div>
    </div>

    <div :class="theme.table.colClasses">
      <div :class="theme.table.tableContainer">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-content">
            <p class="m-0">
              {{ selectedLocale.sLoadingRecords }}
            </p>
          </div>
        </div>
        <table :id="tableId" :class="theme.table.tableClasses">
          <thead>
          <tr>
            <th
                v-for="(column, headerIndex) in columns"
                :key="headerIndex"
                :style="`${
                  column.width ? `width: ${column.width}!important;` : ''
                }`"
            >
              <div
                  :class="{ 'cursor-pointer': column.orderable }"
                  class="table-header-th"
                  @click="onClickOrderColumn(headerIndex)"
              >
                <span>{{ column.title }}</span>
                <template v-if="column.orderable">
                  <template
                      v-if="
                        defaultOrder[0] !== null &&
                        defaultOrder[0] === headerIndex
                      "
                  >
                    <i
                        v-if="defaultOrder[1] === 'asc'"
                        class="fa-solid fa-arrow-down-short-wide"
                    />

                    <i
                        v-if="defaultOrder[1] === 'desc'"
                        class="fa-solid fa-arrow-up-short-wide"
                    />
                  </template>
                  <template v-else>
                    <i class="fa fa-sort" style="color: #dddddd"/>
                  </template>
                </template>
              </div>
            </th>
          </tr>
          </thead>
          <tbody>
          <template v-if="rows.length">
            <tr v-for="(row, key) in rows" :key="key">
              <td v-for="(column, _key) in columns" :key="_key">
                <template v-if="column.slot">
                  <slot :column="column" :name="column.slot" :row="row"/>
                </template>
                <template v-else>
                  <template v-if="column.data.split('.').length > 1">
                    {{ column.data.split('.').reduce((o, i) => o[i], row) }}
                  </template>
                  <template v-else>
                    {{ row[column.data] }}
                  </template>
                </template>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td :colspan="columns.length">
                <p class="text-muted text-center">
                  <template v-if="search">
                    {{ selectedLocale.sZeroRecords }}
                  </template>
                  <template v-else>
                    {{ selectedLocale.sEmptyTable }}
                  </template>
                </p>
              </td>
            </tr>
          </template>
          </tbody>
        </table>
      </div>
    </div>
    <div :class="theme.paginate.colClasses">
      <div class="table-paginate-container">
        <p>{{ sInfo }}</p>
        <paginate
            :click-handler="fetchData"
            :container-class="theme.paginate.containerClass"
            :force-page="page"
            :next-link-class="theme.paginate.pageLinkClass"
            :next-text="selectedLocale.oPaginate.sNext"
            :page-class="theme.paginate.pageClass"
            :page-count="pages"
            :page-link-class="theme.paginate.pageLinkClass"
            :prev-link-class="theme.paginate.pageLinkClass"
            :prev-text="selectedLocale.oPaginate.sPrevious"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {debounce} from "./composables/useDebounce";
import Paginate from "./components/Paginate.vue";
import themeData from "./composables/useTheme";
import useLocalStorage from "./composables/useLocalStorage";
import useLocale from "./composables/useLocale";

const {setDataTableState, getDataTableState} = useLocalStorage;

export default {
  name: "DataTable",
  components: {Paginate},
  props: {
    axios: {
      type: [Object, Function, null],
      default: null
    },
    tableId: {
      type: String,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    locale: {
      type: String,
      default: "en",
    },
    lengthOptions: {
      type: Array,
      default: () => {
        return [
          {label: 10, value: 10},
          {label: 25, value: 25},
          {label: 50, value: 50},
          {label: 100, value: 100},
        ];
      },
    },
    order: {
      type: [null, Array],
      default: null,
    },
    design: {
      type: String,
      default: "bootstrap3",
    },
    savedState: {
      type: Boolean,
      default: false,
    },
    serverSide: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: null,
    },
    dataRows: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      rows: [],
      length: this.lengthOptions[0].value,
      start: 0,
      pages: 0,
      page: 1,
      recordsTotal: 0,
      recordsFiltered: 0,
      search: null,
      draw: 0,
      locales: useLocale(),
      defaultOrder: [null, "asc"],
      isLoading: false,
    };
  },
  computed: {
    sInfo() {
      return this.selectedLocale.sInfo
          .replace("_START_", this.length * this.start + 1)
          .replace("_END_", this.length * (this.start + 1))
          .replace("_TOTAL_", this.recordsTotal);
    },
    sLengthMenu() {
      return this.selectedLocale.sLengthMenu.split(" _MENU_ ");
    },
    selectedLocale() {
      return this.locales[this.locale];
    },
    theme() {
      return themeData(this.design);
    },
  },
  watch: {
    length() {
      this.fetchData(this.page);
    },
  },
  methods: {
    refresh() {
      this.fetchData(this.page);
    },
    onClickOrderColumn(index = null) {
      if (index !== null && index >= 0) {
        if (index > this.columns.length - 1) {
          console.error(`The order column index ${index} is out of range`);
          return;
        }

        if (!this.columns[index].orderable) {
          return;
        }

        this.defaultOrder = [
          index,
          this.defaultOrder[1] === "asc" ? "desc" : "asc",
        ];

        this.fetchData(this.page);
      }
    },
    onSearch: debounce(function (event) {
      this.search = event.target.value;
      this.fetchData();
    }, 500),
    fetchData: function (page = 1) {
      if (this.serverSide) {
        this.requestDataApi(page);
      } else {
        this.requestLocalData(page);
      }
    },
    requestDataApi(page) {
      this.page = page;
      this.start = page - 1;
      this.draw++;
      const formData = new FormData();
      formData.append("draw", this.draw);
      this.columns.forEach((column, index) => {
        Object.keys(column).forEach((key) => {
          if (["data", "name", "orderable", "searchable"].includes(key)) {
            formData.append(`columns[${index}][${key}]`, column[key] ?? null);
            if (key === "searchable" && column[key]) {
              formData.append(`columns[${index}][search][value]`, "");
              formData.append(`columns[${index}][search][regex]`, "false");
            }
          }
        });
      });

      if (this.defaultOrder[0] !== null && this.defaultOrder[0] >= 0) {
        formData.append("order[0][column]", this.defaultOrder[0]);
        formData.append("order[0][dir]", this.defaultOrder[1]);
      }

      formData.append("start", this.start);
      formData.append("length", this.length);
      formData.append("search[value]", this.search ?? "");
      formData.append("search[regex]", "false");

      this.saveStates();

      this.isLoading = true;
      this.axios
          .post(this.url, formData)
          .then(({data}) => {
            if (data.data) {
              this.rows = data.data;
              const {recordsTotal, recordsFiltered} = data;
              this.recordsTotal = recordsTotal;
              this.recordsFiltered = recordsFiltered;
              this.pages = Math.ceil(this.recordsFiltered / this.length);
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
    },
    requestLocalData(page) {
      this.page = page;
      this.start = page - 1;

      this.saveStates();

      let recordFiltered = this.dataRows;

      const searchColumns = this.columns
          .map((column) => {
            if (column.searchable) {
              return column;
            }
          })
          .filter((column) => column !== undefined);

      if (searchColumns.length && (this.search !== "" && this.search !== null)) {
        recordFiltered = recordFiltered.map((row) => {
          for (const column in searchColumns) {
            const _column = searchColumns[column].data
            const value = (row[_column]).toString();
            if (value.includes(this.search)) {
              return row;
            }
          }
        }).filter((row) => row !== undefined);
      }

      recordFiltered = recordFiltered.sort(function (a, b) {
        return a > b ? 1 : -1
      });

      if (this.defaultOrder) {
        this.rows = recordFiltered.slice(
            this.start * this.length,
            this.start * this.length + parseInt(this.length)
        );
      }

      this.recordsTotal = this.dataRows.length;
      this.recordsFiltered = recordFiltered.length;
      this.pages = Math.ceil(this.recordsFiltered / this.length);
    },
    initStates() {
      if (this.savedState) {
        const {
          length,
          search,
          page,
          start,
          defaultOrder,
          recordsTotal,
          recordsFiltered,
        } = getDataTableState(this.tableId);
        this.length = length ?? this.lengthOptions[0].value;
        this.search = search ?? null;
        this.page = page ?? 1;
        this.start = start ?? 0;
        this.defaultOrder = defaultOrder ?? this.defaultOrder;
        this.recordsTotal = recordsTotal ?? 0;
        this.recordsFiltered = recordsFiltered ?? 0;
      }
    },
    saveStates() {
      if (this.savedState) {
        setDataTableState(this.tableId, {
          length: this.length,
          search: this.search,
          page: this.page,
          start: this.start,
          defaultOrder: this.defaultOrder,
          recordsTotal: this.recordsTotal,
          recordsFiltered: this.recordsFiltered,
        });
      }
    },
  },
  mounted() {
    if (this.order) {
      this.defaultOrder = this.order;
      this.onClickOrderColumn(this.defaultOrder[0]);
    }

    this.initStates();

    this.fetchData(this.page);
  },
};
</script>

<style>
.table-header-th {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.cursor-pointer {
  cursor: pointer;
}

.pagination {
  margin: 0;
}

.table-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-header-container .table-header-length-options {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.table-header-container .table-header-search {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 15vw;
  justify-content: flex-end;
  margin: 20px 0;
}

.table-paginate-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container {
  width: 100%;
  height: 100%;
  position: absolute;
  background: rgba(136, 136, 136, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.position-relative {
  position: relative;
}

.loading-container .loading-content {
  background-color: #888;
  color: white;
  padding: 10px;
  border-radius: 8px;
}

.m-0 {
  margin: 0;
}
</style>
