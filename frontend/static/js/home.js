$(document).ready(function() {
    $("#click").click(function() {
        $.ajax({
            type: "GET",
            url: "http://127.0.0.1:3000/hitme",
            success: function(result) {
                console.log("success");
            }
        });
    });
});