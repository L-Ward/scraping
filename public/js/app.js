// Submit comment
$(function () {
    $(".submit-btn").on("click", function (event) {
        console.log("are you listening")
        // Grab the id associated with the article from the submit button
        var thisId = $(this).attr("data-id");

        // Post comment to article
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                body: $("#textComment").val().trim()
            }
        })
            .then(function (data) {
                console.log(data);
                location.reload();
            });
    });
});