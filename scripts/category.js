
$('.deletebook').on('click', function () {
    var val = $(this).attr('value')
    $.ajax({
        url: '/deleteproduct/' + val,
        type: "delete",
        dataType: 'json',
        success: function (msg) {
            if (msg == 'deleted') {
                location.reload()
            }
        }
    })
})
