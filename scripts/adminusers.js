$('#addadmin').on('click', function () {
    var admindata = {
        name: $("#adminname").val(),
        emailid: $("#adminemail").val(),
        username:$('#adminusername').val(),
        password: $("#adminpassword").val(),
        phonenumber: $("#adminnumber").val(),
        age: $("#adminage").val(),
        role: $('#adminrole').val()
    }
    var newadmin=JSON.stringify(admindata)
    var data=JSON.parse(newadmin)
    console.log(data.name)
    if(data.name==''||data.emailid==''||data.username==''||data.password==''||data.phonenumber==''||data.age==''||data.role==''){
        $('#successmessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">'+"Input Should not be empty"+"</div>")
        return false
    }else if(data.password.length<6){
        $('#successmessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">'+"Password length should be greater than 6 "+"</div>")
        return false
    }else if(data.phonenumber.length<10 || data.phonenumber.length>10){
        $('#successmessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">'+"Invalid phonenumber"+"</div>")
        return false
    }else{
        $.ajax({
            url: '/addadmin/' + newadmin,
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            success: function (msg) {
                if(msg=='successmessage'){
                    $('#successmessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">'+"successfully Created"+"</div>")
                    location.reload()
                }
            }
        })

    }
})