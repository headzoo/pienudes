$(function() {
    $(".btn-edit-user").on("click", function() {
        document.location = "/admin/users/edit/" + $(this).data("id");
    });
});