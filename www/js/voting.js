$(function() {
    $(".vote-btn-group").on("click", "button", function() {
        var target    = $(this),
            parent    = target.parents(".btn-group:first"),
            up_button = parent.find(".vote-up:first"),
            up_value  = up_button.find(".vote-value:first"),
            dn_button = parent.find(".vote-down:first"),
            dn_value  = dn_button.find(".vote-value:first");
        
        var unvoting = false;
        if (target.is(".active")) {
            unvoting = true;
        }
        up_button.removeClass("active");
        dn_button.removeClass("active");
        if (!unvoting) {
            target.addClass("active");
        }
        
        $.ajax({
            url: "/voting/vote",
            type: "post",
            data: {
                vote: target.data("vote"),
                mid: parent.data("mid")
            }
        }).done(function(res) {
            up_value.text(res.up);
            dn_value.text(res.down);
        }).fail(function(xhr) {
            if (xhr.status == 401) {
                alert("You must be logged in to vote.");
            } else {
                alert("Error. Please try again in a minute.");
            }
        });
    });
});