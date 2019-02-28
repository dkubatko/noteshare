$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/get_classes",
        success: function(result) {
            console.log(result);
            result.classes.forEach(function(course) {
                $('#courses').append('<tr><td class="number"> <a href="/">' + course.number + '</a> </td>' + 
                    '<td class="name"> <a href="/list_notes?class=' + course.name + '">' + course.name + '</a> </td>' + 
                    '<td class="count">' + course.count + '</td></tr>');
            });
            showCourses($('#head')[0], $('tr:not(#head)'));
        }  
    });
    $('#input').on('input', function() {
        if ($(this).val()=='') {
            showCourses($('#head')[0], $('tr:not(#head)'));
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
    $('#back').click( function() {
        document.location.href = '/';
    });
    $('#add').click( function() {
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