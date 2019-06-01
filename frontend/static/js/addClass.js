$(document).ready( function() {
});

function validateForm() {
    var depRegex = RegExp('([A-Z]+)');
    var classRegex = RegExp('([0-9]+)');
    let valid_no = classRegex.test($('#class_no').val()) && $('#class_no').val().split(" ").length == 1;
    let valid_dep = depRegex.test($('#department').val()) && $('#department').val().split(" ").length == 1;
    let valid_name = $('#class_name').val().length > 0;
    if (valid_no && valid_name && valid_dep) {
        return true;
    }
    if (!valid_no) {
        alert("Invalid class number\nFormat: 123");
        $('#class_no').val('');
    } else if (!valid_name) {
        alert("Invalid class name");
        $('#class_name').val('');
    } else if (!valid_dep) {
        alert("Invalid department name");
        $('#department').val('');
    }
    return false;
}