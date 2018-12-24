// Enable datatable of all tables
// ref: https://datatables.net/manual/options
$(document).ready(function () {
    $('table:not(.disableDatatable)').DataTable({
        paging: false
    });
});
