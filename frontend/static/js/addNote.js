$(document).ready( function() {
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/get_classes",
        success: function(result) {
            console.log(result);
            result.classes.forEach(function(course) {
                var courseNameArr = course.name.split(" ");
                var courseName = "";
                for (let i = 0; i < courseNameArr.length; i++) {
                    courseName += courseNameArr[i] + "~";
                }
                var JSON_string = "{\"uuid\":\"" + course.uuid + "\",\"name\":\"" + courseName.substring(0, courseName.length-1) + "\"}";
                $('#class_dropdown').append('<option value=' + JSON_string + '>' + course.name + '</option>');
            });
        }
    });
});
           