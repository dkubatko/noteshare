$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/get_classes",
        success: function(result) {
            console.log(result);
            var usedDepartments = [];
            result.classes.forEach(function(course) {
                var classURL = "/class_list?class=";
                var classNameSplit = course.name.split(" ");
                $.each(classNameSplit, function(index, value) {
                    classURL += value + '~';
                });
                classURL = classURL.substring(0, classURL.length-1);
                var depURL = "/class_list?dep=" + course.department;
                //$('#courses').append('<tr><td class="number"> <a href= ' + classURL + '>' + course.number + '</a> </td></tr>');
                if (!usedDepartments.includes(course.department)) {
                    $('#department').append('<tr><td class="number"> <a href= ' + depURL + '>' + course.department + '</a> </td></tr>');
                    usedDepartments.push(course.department);
                }
            });
            showCourses($('#head')[0], $('tr:not(#head)'));
        }  
    });

    
    var queryURLDep = new URLSearchParams(window.location.search).get("dep");
    if (queryURLDep != null) {
        $.ajax({
            type: "GET",
            url: "http://127.0.0.1:3000/get_courses_by_department?dep=" + queryURLDep,
            success: function(result) {
                departments= $('#department').find("td");
                for (let i = 0; i < departments.length; i++) {
                    if (departments[i].innerText == queryURLDep) {
                        departments[i].style.backgroundColor = "#6699FF";
                        break;
                    }   
                }
                for (let i = 0; i < result.courses.length; i++) {
                    var classURL = "/class_list?dep=" + queryURLDep + "&class=";
                    var classNameSplit = result.courses[i].name.split(" ");
                    $.each(classNameSplit, function(index, value) {
                        classURL += value + '~';
                    });
                    classURL = classURL.substring(0, classURL.length-1);
                    $('#courses').append('<tr><td class="number"> <a href= ' + classURL + '>' + result.courses[i].number + '</a> </td></tr>');
                }

                var queryURLClass = new URLSearchParams(window.location.search).get("class");
                if (queryURLClass != null) {
                    $.ajax({
                        type: "GET",
                        url: "http://127.0.0.1:3000/get_notes?class=" + queryURLClass,
                        success: function(result) {
                            for (let i = 0; i < result.notes.length; i++) {
                                let noteURL = result.notes[i].note_url;
                                let lectureTopic = result.notes[i].lecture_topic;
                                let lectureDate = result.notes[i].lecture_date;
                                $('#notes').append('<tr><td><a href="' + noteURL + '" target="_blank">' + lectureTopic + '</a></td><td>' + lectureDate + '</td></tr>');
                            }
                            courses = $('#courses').find("td");
                            console.log(courses);
                            console.log(result)
                            for (let i = 0; i < courses.length; i++) {
                                if (courses[i].innerText == result.class_num) {
                                    courses[i].style.backgroundColor = "#6699FF";
                                    break;
                                }   
                            }
            
                        }
                    });
                }
            }
        });
    }

    $('#input').on('input', function() {
        if ($(this).val()=='') {
            showCourses($('.head')[0], $('tr:not(.head)'));
            return;
        }
        let count = 0;
        let value = $(this).val().toUpperCase();
        let course_numbers = $('.number');
        for (let i = 0; i < course_numbers.length; i++) {
            let textValue = course_numbers[i].innerText || course_numbers[0].textContent;
            if (textValue.toUpperCase().indexOf(value) > -1) {
                course_numbers[i].parentElement.style = 'display: content';
                count++;
            } else {
                course_numbers[i].parentElement.style = 'display: none';
            }
        }
        $('#head')[0].style = (count > 0) ? 'display: content' : 'display: none';
    });
    $('#add_note').click( function() {
        var queryURLClass = new URLSearchParams(window.location.search).get("class");
        if (queryURLClass != null) {
            document.location.href = '/add_note?class=' + queryURLClass;
        } else {
            document.location.href = '/add_note';
        }
    });
    $('#add_course').click( function() {
        document.location.href = '/add_course';
    });

});



/**
 * @param {element} head
 * @param {array} courses 
 */
function showCourses(head, courses) {
    head.style = 'display: content';
    for (let i = 0; i < courses.length; i++) {
        courses[i].style = 'display: content';
    }
}

function fun() {
    console.log("TESTTT");
    return true;
}