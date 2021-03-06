$(function() {
    var ONEMB             = (1024 * 1024);
    var is_editing        = false;
    var state             = {};
    var edit_btn          = $("#profile-edit-btn"),
        cancel_btn        = $("#profile-cancel-btn"),
        header_upload_btn = $("#profile-header-edit-upload-btn"),
        header_remove_btn = $("#profile-header-edit-remove-btn"),
        header_form       = $("#profile-header-edit-form"),
        header_file       = $("#profile-header-edit-file"),
        header_spinner    = $("#profile-header-edit-spinner"),
        header_icon       = $("#profile-header-edit-icon"),
        header_color      = $("#profile-header-edit-color"),
        avatar_upload_btn = $("#profile-avatar-edit-upload-btn"),
        avatar_remove_btn = $("#profile-avatar-edit-remove-btn"),
        avatar            = $("#profile-avatar"),
        avatar_e          = $("#profile-avatar-edit"),
        avatar_form       = $("#profile-avatar-edit-form"),
        avatar_file       = $("#profile-avatar-edit-file"),
        avatar_spinner    = $("#profile-avatar-edit-spinner"),
        avatar_icon       = $("#profile-avatar-edit-icon"),
        avatar_navbar     = $("#navbar-avatar"),
        tagline           = $("#profile-tagline"),
        tagline_e         = $("#profile-tagline-edit"),
        location          = $("#profile-location"),
        location_e        = $("#profile-location-edit"),
        website           = $("#profile-website"),
        website_e         = $("#profile-website-edit"),
        bio               = $("#profile-bio"),
        bio_e             = $("#profile-bio-edit"),
        header            = $("#profile-header"),
        header_e          = $("#profile-header-edit"),
        track_deletes     = $(".card-media-remove-play"),
        favorite_deletes  = $(".card-media-remove-favorites"),
        remove_tag_btns   = $(".profile-tags-remove-btn");
    
    setState();
    
    edit_btn.on("click", function() {
        if (is_editing) {
            var header_img = header.css("background-image").replace(/url\("?(.*?)"?\)/, '$1');
            
            $.ajax({
                url: "/user/profile/bio/save",
                type: "post",
                data: {
                    text:     tagline_e.val(),
                    bio:      bio_e.val(),
                    location: location_e.val(),
                    website:  website_e.val(),
                    image:    avatar.attr("src"),
                    header:   header_img,
                    color:    header.css("background-color")
                }
            }).done(function(res) {
                tagline.text(res.text);
                tagline_e.val(res.text).removeClass("invalid");
                location.text(res.location);
                location_e.val(res.location).removeClass("invalid");
                website.text(res.website);
                website_e.val(res.website).removeClass("invalid");
                bio.html(nl2p(res.bio));
                bio_e.val(res.bio).removeClass("invalid");
                avatar_navbar.attr("src", avatar.attr("src"));
                
                setState();
                
                is_editing = false;
                hide();
            }).fail(function(jqXHR) {
                console.log(jqXHR.responseText);
                var obj = JSON.parse(jqXHR.responseText);
                if (obj.target) {
                    $(obj.target).addClass("invalid");
                }
                alert(obj.message);
            });
        } else {
            is_editing = true;
            show();
        }
    });
    
    cancel_btn.on("click", function() {
        tagline.text(state.text);
        tagline_e.val(state.text).removeClass("invalid");
        location.text(state.location);
        location_e.val(state.location).removeClass("invalid");
        website.text(state.website);
        website_e.val(state.website).removeClass("invalid");
        bio.html(nl2p(state.bio));
        bio_e.val(state.bio).removeClass("invalid");
        
        avatar.attr("src", state.image);
        header.css("background-image", state.header);
        header.css("background-color", state.color);
        
        is_editing = false;
        hide();
    });
    
    avatar_upload_btn.on("click", function() {
        avatar_file.trigger("click");
    });
    
    avatar_remove_btn.on("click", function() {
        avatar.attr("src", "/img/avatar.gif");
    });
    
    avatar_file.on("change", function() {
        var file = this.files[0];
        
        if(file.name.length < 1) {
            return;
        } else if(file.size > ONEMB) {
            return alert("The file is too big");
        } else if(file.type != 'image/png' && file.type != 'image/jpg' && file.type != 'image/gif' && file.type != 'image/jpeg') {
            return alert("The file does not match png, jpg or gif");
        }
    
        var form_data = new FormData(avatar_form[0]);
        $.ajax({
            url: "/user/profile/avatar/save",
            type: "post",
            data: form_data,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function() {
                avatar_spinner.show();
                avatar_icon.removeClass("glyphicon-picture");
            }
        }).done(function(res) {
            avatar.attr("src", res.src);
        }).fail(function() {
            alert("Error. Please try again in a minute.");
        }).complete(function() {
            avatar_spinner.hide();
            avatar_icon.addClass("glyphicon-picture");
        });
    });
    
    header_upload_btn.on("click", function() {
        header_file.trigger("click");
    });
    
    header_remove_btn.on("click", function() {
        header.css("background-image", "none");
        header.css("background-color", "#9609B5");
    });
    
    header_file.on("change", function() {
        var file = this.files[0];
    
        if(file.name.length < 1) {
            return;
        } else if(file.size > (5 * ONEMB)) {
            return alert("The file is too big");
        } else if(file.type != 'image/png' && file.type != 'image/jpg' && file.type != 'image/gif' && file.type != 'image/jpeg') {
            return alert("The file does not match png, jpg or gif");
        }
        
        var form_data = new FormData(header_form[0]);
        $.ajax({
            url:         "/user/profile/header/save",
            type:        "post",
            data:        form_data,
            cache:       false,
            contentType: false,
            processData: false,
            beforeSend: function() {
                header_spinner.show();
                header_icon.removeClass("glyphicon-picture");
            }
        }).done(function(res) {
            header.css("background-image", "url(" + res.src + ")");
        }).fail(function() {
            alert("Error. Please try again in a minute.");
        }).complete(function() {
            header_spinner.hide();
            header_icon.addClass("glyphicon-picture");
        });
    });
    
    track_deletes.on("click", function() {
        var target = $(this),
            parent = target.parents(".card:first"),
            pid    = target.data("pid");
        
        $.ajax({
            url: "/user/profile/track/delete",
            type: "post",
            data: {
                pid: pid,
                _csrf: csrfToken
            }
        }).done(function() {
            parent.fadeOut("fast");
        }).fail(function() {
            alert("Error. Please try that again in a minute.");
        });
    });
    
    favorite_deletes.on("click", function() {
        var target      = $(this),
            parent      = target.parents(".card:first"),
            favorite_id = target.data("favorite-id");
    
        $.ajax({
            url: "/user/profile/favorites/delete",
            type: "post",
            data: {
                favorite_id: favorite_id,
                _csrf: csrfToken
            }
        }).done(function() {
            parent.fadeOut("fast");
        }).fail(function() {
            alert("Error. Please try that again in a minute.");
        });
    });
    
    remove_tag_btns.on("click", function() {
        if (!confirm('Are you sure you want to remove this tag? Removing the tag does not remove the videos from your favorites, but it does remove the tag from the videos.')) {
            return;
        }
        
        var target = $(this),
            parent = target.parents(".tag:first"),
            tag    = target.data("tag");
    
        $.ajax({
            url: "/user/profile/tags/delete",
            type: "post",
            data: {
                tag: tag,
                _csrf: csrfToken
            }
        }).done(function() {
            parent.fadeOut("fast");
        }).fail(function() {
            alert("Error. Please try that again in a minute.");
        });
    });
    
    header_color.spectrum({
        color: header.css("background-color"),
        preferredFormat: "hex",
        showInput: true,
        clickoutFiresChange: true
    }).on("change", function () {
        var color = $(this).val();
        header.css("background-color", color);
    });
    
    function show() {
        header_e.show();
        avatar_e.show();
        cancel_btn.show();
    
        tagline.replaceWith(tagline_e);
        tagline_e.show();
        location.replaceWith(location_e);
        location_e.show();
        website.replaceWith(website_e);
        website_e.show();
        bio_e.height(bio.height() + 16);
        bio.replaceWith(bio_e);
        bio_e.show();
    
        edit_btn.text("Save");
    }
    
    function hide() {
        header_e.hide();
        avatar_e.hide();
        cancel_btn.hide();
    
        tagline_e.replaceWith(tagline);
        tagline_e.hide();
        location_e.replaceWith(location);
        location_e.hide();
        website_e.replaceWith(website);
        website_e.hide();
        bio_e.replaceWith(bio);
        bio_e.hide();
    
        edit_btn.text("Edit");
    }
    
    function setState() {
        state = {
            image:        avatar.attr("src"),
            header:       header.css("background-image"),
            color:        header.css("background-color"),
            text:         tagline_e.val(),
            location:     location_e.val(),
            website:      website_e.val(),
            bio:          bio_e.val()
        };
    }
    
    function nl2p(str) {
        str = '<p>' + str.replace(/\n([ \t]*\n)+/g, '</p><p>')
                .replace('\n', '<br />') + '</p>';
        return str;
    }
});