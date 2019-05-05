$(document).ready( function() {
    var queryURL = new URLSearchParams(window.location.search);
    var class_name = queryURL.get("class").split(" ");
    var classURL = "";
    $.each(class_name, function(index, value) {
        classURL += value + '~';
    });
    classURL = classURL.substring(0, classURL.length-1);
    console.log("CLASS URL: " + classURL);

    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/get_classes",
        success: function(result) {
            console.log("SUCCESSS " + result);
            result.classes.forEach(function(course) {
                var courseNameArr = course.name.split(" ");
                var courseName = "";
                for (let i = 0; i < courseNameArr.length; i++) {
                    courseName += courseNameArr[i] + "~";
                }
                var JSON_string = "{\"uuid\":\"" + course.uuid + "\",\"name\":\"" + courseName.substring(0, courseName.length-1) + "\"}";

                if ( courseName.substring(0, courseName.length-1) == classURL) {
                    $('#class_dropdown').append('<option value=' + JSON_string + ' selected="selected">' + course.name + '</option>');

                } else {
                    $('#class_dropdown').append('<option value=' + JSON_string + '>' + course.name + '</option>');
                }
            });
        }
    });
});
           