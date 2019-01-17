let added_data = false;

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/get_classes",
        success: function(result) {
            console.log(result);
            result.classes.forEach(element => {
                courseNoDiv = "<div class='course-no'>" + element.number + "</div>";
                courseNameDiv = "<div class='course-name'>" + element.name + "</div>";
                courseNoteCountDiv = "<div class='note-count'>" + 0 + "</div>";
                $("#header").append(courseNoDiv);
                $("#header").append(courseNameDiv);
                $("#header").append(courseNoteCountDiv);
            });
        }  
    });

    $('#input').on('input', function() {
        if (!added_data) {
            for (let i=0; i<results['class_no'].length; i+=1) {
                let code = '<div class="course">' + 
                           '<div class="course-no">' + 
                           '<a href="#">' + results['class_no'][i] + '</a>' + 
                           '</div>' + 
                           '<div class="course-name">' + 
                           '<a href="#">' + results['class_name'][i] + '</a>' +
                           '</div>' + 
                           '<div class="note-count">' +
                           '<a href="#">' + results['note_count'][i] + '</a>' + 
                           '</div>' + 
                           '</div>';
                $('#courses').append(code);
            }
            added_data = true;
            hideCourses($('#header')[0], $('.course:not(#header)'));
        }
/*
        if ($(this).val()=='') {
            hideCourses($('#header')[0], $('.course:not(#header)'));
            return;
        }
        let count = 0;
        let value = $(this).val().toUpperCase();
        $('.course:not(#header)').each( function(course) {
            let a = course.querySelector('.course-no').getElementsByTagName('a')[0];
            let txtValue = a.innerText || a.textContent; // returns A if A is true, else B
            if (txtValue.toUpperCase().indexOf(value) > -1) {
                course.style.display = 'flex';
                count+=1;
            } else {
                course.style.display = 'none';
            }
        });
        $('#header')[0].style.display = (count > 0) ? 'flex' : 'none';
        */
    });
    $('#back').click( function() {
        document.location.href = '/';
    });
    $('#add').click( function() {
        document.location.href = '/add-course';
    });

});



/**
 * @param {element} head
 * @param {array} courses 
 */
function hideCourses(head, courses) {
    head.style.display = 'none';
    courses.each( function(course) {
        course.style.display = 'none';
    });
}