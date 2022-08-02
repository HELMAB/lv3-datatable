<template>
  <DataTable
      table-id="datatable-02"
      ref="datatable"
      :columns="columns"
      :data-rows="dataRows"
      :locale="locale"
      saved-state
  >
    <template #action="{ row }">
      <p>{{ row.id }}</p>
    </template>
  </DataTable>

</template>
<script>
export default {
  data () {
    return {
      locale: 'en',
      dataRows: [],
    }
  },
  computed: {
    columns() {
      return [
        {
          data: "title",
          name: "title",
          title: "Title",
          orderable: true,
          searchable: true,
        },
        {
          data: "user.name",
          name: "user.name",
          title: "User",
          orderable: true,
          searchable: false,
        },
        {
          data: "created_at",
          name: "created_at",
          title: "Creation Date",
          orderable: true,
          searchable: false,
          width: "210px",
        },
        {
          data: "action",
          name: "action",
          title: "Action",
          orderable: false,
          searchable: false,
          slot: "action",
          width: "100px",
        },
      ];
    },
  },
  created() {
    this.dataRows = Array(10000)
        .fill(1, 0, 10000)
        .map((_, i) => {
          return {
            id: i + 1,
            title: `Title ${i + 1}`,
            user: {
              id: i + 1,
              name: `User ${i + 1}`,
            },
            created_at: new Date().toLocaleString(),
          };
        });
  },
}
</script>
