$('li.dropdown').hover(function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(100).fadeIn(500);
}, function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(100).fadeOut(500);
});
$(".bookpage").on("click", function () {
    var categorytype = $(this).attr('value')
    window.location = '/categorytype/' + categorytype;
});
$('#updatedata').on('click', function () {
    var data = {
        name: $("#username").val(),
        emailid: $("#useremail").val(),
        password: $("#userpassword").val(),
        phonenumber: $("#usernumber").val(),
    }
    if (data.name == '' || data.emailid == '' || data.password == '' || data.phonenumber == '') {
        $('#updatemessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">' + "Input Should not be empty" + "</div>")
        return false
    } else if (data.password.length < 6) {
        $('#updatemessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">' + "Password length should be greater than 6 " + "</div>")
        return false
    } else if (data.phonenumber.length < 10 || data.phonenumber.length > 10) {
        $('#updatemessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">' + "Invalid phonenumber" + "</div>")
        return false
    } else {
        $.ajax({
            url: '/updateprofile',
            type: 'post',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function (message) {
                if (message.success) {
                    $('#updatemessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">' + "Successfully Updated" + "</div>")

                    location.reload();

                }
            }
        });

    }
});
