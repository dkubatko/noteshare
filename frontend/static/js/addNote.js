$(document).ready( function() {
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/get_classes",
        success: function(result) {
            console.log(result);
            result.classes.forEach(function(course) {
                $('#class_dropdown').append('<option value="' + course.name + '">' + course.name + '</option>');
            });
        }
    });
});
           