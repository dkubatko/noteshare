$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/get_classes",
        success: function(result) {
            var usedDepartments = [];
            result.classes.forEach(function(course) {
                var classURL = "/class_list?class=";
                var classNameSplit = course.name.split(" ");
                $.each(classNameSplit, function(index, value) {
                    classURL += value + '~';
                });
                classURL = classURL.substring(0, classURL.length-1);
                var depURL = "/class_list?dep=" + course.department;
                if (!usedDepartments.includes(course.department)) {
                    $('#department').append('<tr><td class="dep"> <a href= ' + depURL + '>' + course.department + '</a> </td></tr>');
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
                                $('#notes').append('<tr><td class="note"><a href="' + noteURL + '" target="_blank">' + lectureTopic + '</a></td><td>' + lectureDate + '</td></tr>');
                            }
                            courses = $('#courses').find("td");
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


    var queryURLClass = new URLSearchParams(window.location.search).get("class");
    var queryURLDep = new URLSearchParams(window.location.search).get("dep");
    if ( queryURLClass && queryURLDep ) {
        $('#input').attr("placeholder", "Search for lectures...").blur();
        $('#input').on('input', function() {
            if ($(this).val().length == 0) {
                showLectures($('#head')[0], $('#notes').find('tr:not(#head)'));
            } else {
                $.ajax({
                    type: "GET",
                    url: "http://127.0.0.1:3000/get_lecture_name_trie?class=" + queryURLClass + "&val=" + $(this).val(),
                    success: function(result) {
                        let display_arr = result.valid_searches.sort();
                        let lectures = $('.note').sort( (element1, element2) => {
                            if (element1.innerText == element2.innerText) {
                                return 0;
                            }
                            return (element1.innerText < element2.innerText) ? -1 : 1; 
                        });
                        var display_index = 0;
                        for ( let i = 0; i < lectures.length; i++ ) {
                            if (display_arr[display_index] == lectures[i].innerText) {
                                display_index++;
                                lectures[i].parentElement.style = 'display: content';
                            } else {
                                lectures[i].parentElement.style = 'display: none';
                            }
                        }
                    }
                }); 
            }
        });
    } else {
        $('#input').on('input', function() {
            if ($(this).val().length == 0) {
                showCourses($('.head')[0], $('tr:not(.head)'));
                showCourses($('.head')[0], $('.number'));
            } else {
                let value = $(this).val().toUpperCase();
                let index = (value.search(/\d/) > -1) ? value.search(/\d/) : value.length;
                let department_val = value.substring(0, index);
                let course_val = value.substring(index);
                if ( department_val.length > 0 ) {
                    let departments = $('.dep');
                    for (let i = 0; i < departments.length; i++) {
                        let textValue = (departments[i].innerText || departments[i].textContent).toUpperCase();
                        if (textValue == department_val) {
                            departments[i].parentElement.style = 'display: content';
                            if (queryURLDep) {
                                if (textValue == queryURLDep) {
                                    showCourses($('.head')[0], $('.number'));
                                    showCourses($('.head')[0], $('tr:not(.head):not(.dep)'));
                                } else {
                                    course_val = -1;
                                }
                            }
                            break;
                        }
                        else if ( textValue.indexOf(department_val) == 0 ) {
                            departments[i].parentElement.style = 'display: content';
                            hideCourses($('.head')[0], $('.number'));
                        } else {
                            departments[i].parentElement.style = 'display: none';
                            hideCourses($('.head')[0], $('.number'));
                        }
                    }
                }            
                if ( course_val > 0) {
                    let course_numbers = $('.number');
                    for (let i = 0; i < course_numbers.length; i++) {
                        let textValue = course_numbers[i].innerText || course_numbers[i].textContent;
                        if (textValue.indexOf(course_val) == 0) {
                            course_numbers[i].parentElement.style = 'display: content';
                        } else {
                            course_numbers[i].parentElement.style = 'display: none';
                        }
                    }
                }
            }
        });
    }
        
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
 * Displays all courses, along with the table header
 * 
 * @param {element} head
 *      The table header element, <th>
 * @param {array} courses 
 *      The array of <tr> elements, representing the courses in the table
 */
function showCourses(head, courses) {
    head.style = 'display: content';
    for (let i = 0; i < courses.length; i++) {
        courses[i].style = 'display: content';
    }
}

/**
 * Hides all courses, only displaying the table header
 * 
 * @param {element} head
 *      The table header element, <th> 
 * @param {array} courses 
 *      The array of <tr> elements, represeting the courses in the table
 */
function hideCourses(head, courses) {
    head.style = 'display: content';
    for (let i = 0; i < courses.length; i++) {
        courses[i].style = 'display: none';
    }
}

/**
 * Displays all lectures, along with the table header
 * 
 * @param {element} head 
 *      The table header element, <th>
 * @param {array} lectures 
 *      The array of <tr> elements, represeting the lectures in the table
 */
function showLectures(head, lectures) {
    head.style = 'display: content';
    for (let i = 0; i < lectures.length; i++) {
        lectures[i].style = 'display: content';
    }
}
