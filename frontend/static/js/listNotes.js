$(document).ready( function() {
    var queryURL = new URLSearchParams(window.location.search);
    var class_name = queryURL.get("class").split(" ");
    var classURL = "";
    $.each(class_name, function(index, value) {
        classURL += value + '~';
    });
    classURL = classURL.substring(0, classURL.length-1);
    console.log(classURL);
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:3000/get_notes?class=" + classURL,
        success: function(result) {
            console.log(result);
            for (let i = 0; i < result.notes.length; i++) {
                let queryURL = result.notes[i].note_url;
                $('#notes').append('<a href="' + queryURL + '" target="_blank">' + result.notes[i].note_name + '</a><br>');
            }
        }
    });

    $("#addNoteButton").click( function() {
        document.location.href = "/add_note?class="+ classURL;
    });
});