$('li.dropdown').hover(function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(100).fadeIn(500);
}, function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(100).fadeOut(500);
});
$(".privacy").on("click", function () {
    window.location = '/privacy';
});
$(".aboutpage").on("click", function () {
    window.location = '/about';
});
$(".terms").on("click", function () {
    window.location = '/terms';
});
$(".contactpage").on("click", function () {
    window.location = '/contact';
});
///
$(".bookpage").on("click", function () {
    var category = $(this).attr('value')
    window.location = '/category/' + category;
});
$(".search-button").on("click", function () {
    var ele = $('.search').val();
    window.location = '/search/' + ele;
});
$('.store').on('click', function (req, res) {
    var cartid = $(this).attr('value')
    var username = $("#username").val();
    $.ajax({
        url: '/addbook/' + cartid,
        type: 'post',
        datatype: JSON,
        success: function (msg) {
            if (msg == 'Do login') {
                window.location.replace("/login ");
            } else if (msg == 'inserted') {
                var value = document.querySelector('#counter').innerHTML;
                val = parseInt(value) + 1;
                document.getElementById("counter").innerText = val;

            } else if (msg == 'Already in Cart') {
                alert('Already in Cart')
            }
        }
    })
})
$('.deleteproduct').on('click', function () {
    var deleteitem = $(this).attr('value')
    // var username = $("#username").val();
    $.ajax({
        url: '/deleteproduct/' + deleteitem,
        type: 'put',
        datatype: 'json',
        success: function (msg) {
            if (msg == "deleted") {
                location.reload()
            }
        }
    })
})

// $('.deleterefresh').on('click', function () {
//     $.ajax({
//         url: '/cart/usercart',
//         type: 'get',
//         datatype: 'json',
//         success: function (msg) {
//             alert(JSON.stringify(msg))
//         }
//     })
// })
$(document).on("change", ".Bookquantity", function () {
    var id = $(this).attr("book_qua");
    // var $this = $(this);
    var quant = $(this).find(":selected").text();
    // console.log("val is", quant);
    $.ajax({
        url: "/book/" + quant + '/' + id,
        type: 'put',
        datatype: "json",
        success: function (message) {
            if (message == "Updated") {
                //                // window.location.replace("/cart/usercart");
                location.reload()
            }
        }
    })
})
$('.logout').on('click', function () {
    var username = $("#username").val();
    window.location = '/' + username + '/logout';
})
// $('#updatedata').on('click',function(){
//     var userid = $('#userid').val()
//     var data={
//         name:$("#username").val(),
//         emailid:$("#useremail").val(),
//         username:$("#userpassword").val(),
//         phonenumber:$("#phonenumber").val(),
//     } 
//     $.ajax({
//         url:'/updateprofile',
//         type: 'put',
//         contentType: 'application/json',
//         dataType: 'json',
//         data: JSON.stringify(data),
//         success: function (message) {
//             alert(JSON.stringify(message));
//         }
//     });
// })
$('#updatedata').on('click', function () {
    var data = {
        name: $("#username").val(),
        emailid: $("#useremail").val(),
        password: $("#userpassword").val(),
        phonenumber: $("#usernumber").val(),
    }
    var result = JSON.stringify(data)
    // alert(JSON.stringify(data))
    $.ajax({
        url: '/updateprofile/' + result,
        type: 'post',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(data),
        success: function (message) {
            if (message == 'updated') {
                $('#updatemessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">' + "successfully Updated" + "</div>")
                location.reload()
            }
        }
    });
});
$("#buyproduct").submit(function (e) {
    e.preventDefault();
    var presentDate = new Date();
    var data = {
        name: $('#name').val(),
        mobilenumber: $('#number').val(),
        pincode: $('#pincode').val(),
        landmark: $('#landmark').val(),
        town: $('#town').val(),
        state: $('#state').val(),
        orderData:presentDate
    }
    data = JSON.stringify(data)
    $.ajax({
        url: '/buyproduct/' + data,
        type: 'post',
        contentType: 'application/json',
        dataType: 'json',
        success: function (msg) {
            location.replace("/userorders")
        }
    })
});
$("#Feedback").submit(function (e) {
    e.preventDefault()
    var data = {
        name: $('#name').val(),
        email: $('#email').val(),
        query: $('#exampleFormControlTextarea1').val()
    }
    data = JSON.stringify(data)
    $.ajax({
        url: '/contactdata/' + data,
        type: 'post',
        contentType: 'application/json',
        dataType: 'json',
        success: function (message) {
            if(message.success){
                $('#successMessage').append('<div class="alert alert-success mt-4 mr-4 ml-4" role="alert">' + "Thank you, will contact you" + "</div>")
                setTimeout(function() {
                    location.reload();
                }, 1000);
            } 
        }
    })
});
$('.deleteorderproduct').on('click', function () {
    var deleteitem = $(this).attr('value')
    // var username = $("#username").val();
    $.ajax({
        url: '/deleteorderproduct/' + deleteitem,
        type: 'put',
        datatype: 'json',
        success: function (msg) {
            if (msg == "canceled") {
                location.reload()
            }
        }
    })
})

