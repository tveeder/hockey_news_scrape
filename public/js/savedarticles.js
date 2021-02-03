$(document).ready(function() {

    // this re-usable function lists the notes in the appropriate div respective to article
    function noteLister(articleID, notesDiv) {
        $.get("/api/all/" + articleID, function(data) {

        }).done(function(response) {
            notesDiv.empty();
            response.notes.forEach(function(item, i) {
                notesDiv.append(`
                    <div class="row grey lighten-3 valign-wrapper">
                        <div class="col s1">
                            <button type="button" class="btn-small red darken-2 noteDeletebtn" data-noteid="${item._id}"><i class="material-icons">delete</i></button>
                        </div>
                        <div class="col s11">
                            <span class="articleNote" id="note_${item._id}">${item.body}</span>
                            <p class="noteAddedDate grey-text ">${String(item.createdAt).substr(0,10)}</p>
                        </div>
                    </div>
                    `);
            });
        });
    }

    // lists the notes associated with the artcile and unhides the hidden div
    $(".articleNotesbtn").on("click", function() {
        var articleID = $(this).data("articleid");
        var parentNode = $(this).parent();
        var noteDiv = $("#notelist_" + articleID);

        noteLister(articleID, noteDiv);

        // this if / else checks to see if the textarea form for adding notes is visible
        // and toggles whether it is shown / hidden
        if ($(parentNode).find("form").is(":visible")) {
            // hide text area for adding notes
            parentNode.find("form").hide();
            parentNode.find("#notelist_" + articleID).hide();

        } else {
            // show text area to add notes
            parentNode.find("form").show();
            parentNode.find("#notelist_" + articleID).show();

        }



    });

    // sends note text to database and refreshes / updates the notes div to show latest note
    $(".noteSubmit").on("submit", function(e) {
        e.preventDefault();
        var form = $(this);
        var noteText = form[0].elements[0].value;
        var noteTextDiv = form[0].elements[0];
        var articleID = form[0].elements[1].value;
        var noteDiv = $("#notelist_" + articleID);
        var note = {
            textBody: noteText
        };

        // reset text area input box
        $(this).children().first().val("");
        $.ajax({
            type: "POST",
            url: "/api/notes",
            data: note,
            success: function(noteObject) {

                //noteObject returns as an object with the inserted Note ID and body
                // console.log(noteObject);

                var note_id = {
                    noteID: noteObject._id
                };

                $.ajax({
                    type: "POST",
                    url: "/api/articles/" + articleID,
                    data: note_id,
                    success: function(response) {
                        noteLister(articleID, noteDiv);
                    }
                });
            }
        }).done(function(response) {
            //response just returns the note object with _id, body, and createdAt
            $("#error_" + articleID).empty();
        }).fail(function(err) {
            $("#error_" + articleID).css("color", "red").text(err.responseJSON.errors.body.message);
        });

    });

    // clear all articles from db and reload page
    $("#clear").on("click", function() {
        var deleteConfirmation = confirm("Are you sure you want to delete all saved articles?");
        if (deleteConfirmation == true) {
            $.ajax({
                url: "/api/articles",
                type: "DELETE"
            }).done(function(response) {
                location.reload();
            }).fail(function(err) {
                console.log(err);
            });
        }
    });

    // handles deleting notes
    $(".articleContainer").on("click", ".noteDeletebtn", function() {
        var noteID = $(this).data("noteid");
        var parentNode = $(this).parent().parent().parent();
        console.log(parentNode);
        var articleID = parentNode.attr("id").slice(9);

        $.ajax({
            url: "/api/notes/" + noteID,
            type: "DELETE"
        }).done(function(response) {
            //note was successfully deleted
            noteLister(articleID, parentNode);

        }).fail(function(err) {
            console.log(err);
        });
    });

    // handles deleting an article
    $(".articleDeleteBtn").on("click", function() {
        var articleID = $(this).data("articleid");

        $.ajax({
            url: "/api/articles/" + articleID,
            type: "DELETE"
        }).done(function(response) {
            console.log(response);
            location.reload();
        }).fail(function(err) {
            console.log(err);
        });
    });

    $(".articleContainer").on("click", ".articleNote", function() {
        var noteText = $(this).text();


    });

    //activates modal
    $(".modal").modal();
});