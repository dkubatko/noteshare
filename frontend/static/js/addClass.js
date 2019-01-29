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
    if (classRegex.test($('#class_no').val()) && $('#class_no').val() != '') {
        return true;
    }
    $('#class_no').val('');
    $('#class_name').val('');
    return false;
}