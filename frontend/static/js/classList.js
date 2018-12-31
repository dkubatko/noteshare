$(document).ready(function() {
    let head = document.getElementById('header');
    let courses = document.querySelectorAll('.course:not(#header)');
    hideCourses(head, courses);

    $('#input').on('input', function() {
        if ($(this).val()=='') {
            hideCourses(head, courses);
            return;
        }
        let count = 0;
        let value = $(this).val().toUpperCase();
        courses.forEach( function(course) {
            let a = course.querySelector('.course-no').getElementsByTagName('a')[0];
            let txtValue = a.innerText || a.textContent; // returns A if A is true, else B
            if (txtValue.toUpperCase().indexOf(value) > -1) {
                course.style.display = 'flex';
                count+=1;
            } else {
                course.style.display = 'none';
            }
        });
        head.style.display = (count > 0) ? 'flex' : 'none';
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
    courses.forEach( function(course) {
        course.style.display = 'none';
    });
}