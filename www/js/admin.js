$(function() {
    $(".btn-edit-user").on("click", function() {
        document.location = "/admin/users/edit/" + $(this).data("id");
    });
    $(".btn-edit-alt").on("click", function() {
        document.location = "/admin/alts/edit/" + $(this).data("id");
    });
    $("#btn-create-alt").on("click", function() {
        document.location = "/admin/alts/create";
    });
});