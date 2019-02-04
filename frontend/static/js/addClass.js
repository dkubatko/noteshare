$(document).ready( function() {
    var prevClassNo = '';
    $('#class_no').on( "change paste keyup", function() {
        console.log(classRegex);
        console.log($(this).val());
        console.log(classRegex.test($(this).val()));
        if (classRegex.test($(this).val())) {
            prevClassNo = $(this).val();
        } else {
            $(this).val(prevClassNo);
        }
    });
});

function validateForm() {
    var classRegex = RegExp('([A-Z]+)([0-9]+)');
    let valid_no = classRegex.test($('#class_no').val());
    let valid_name = $('#class_name').val().length > 0;
    if (valid_no && valid_name) {
        return true;
    }
    if (!valid_no) {
        alert("Invalid class number\nFormat: ABC123");
        $('#class_no').val('');
    } else if (!valid_name) {
        alert("Invalid class name");
        $('#class_name').val('');
    }
    return false;
}