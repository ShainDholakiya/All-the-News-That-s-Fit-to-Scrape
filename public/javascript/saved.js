$(document).ready(function () {
    var articleContainer = $('.article-container');
    $(document).on('click', '.btn.delete', removeFromSaved);
    $(document).on('click', '.btn.notes', handleArticleNotes);
    $(document).on('click', '.btn.save', handleNoteSave);
    $(document).on('click', '.btn.note-delete', handleNoteDelete);
    $('.clear').on('click', handleArticleClear);

    function initPage() {
        $.get('/articles?saved=true').then(function (data) {
            articleContainer.empty();
            if (data && data.length) {
                renderArticles(data);
            } else {
                renderEmpty();
            }
        });
    }

    function renderArticles(articles) {
        var articleCards = [];
        for (var i = 0; i < articles.length; i++) {
            articleCards.push(createCard(articles[i]));
        }
        articleContainer.append(articleCards);
    }

    function createCard(article) {
        console.log(article);
        var card = $("<div style='box-shadow: 3px 3px 20px lightslategrey; margin-left: 70px; margin-right: 70px; margin-top: 25px' class='card'>");
        var cardHeader = $("<div style='height: 50px; padding-top: 8px' class='card-header bg-dark'>").append(
            $('<h3>').append(
                $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
                    .attr('href', article.URL)
                    .text(article.headline)
            )
        );

        var cardBody = $("<div style='padding-bottom: 0px' class='card-body'>").text(article.summary);
        var btns = $("<div class='card-body'><a style='margin-right: 10px' class='btn btn-outline-secondary delete'>Delete Article From Saved</a><a class='btn btn-outline-secondary notes'>Article Notes</a>");

        card.append(cardHeader, cardBody, btns);
        card.data('_id', article._id);
        return card;
    }

    function removeFromSaved() {
        var articleToUnSave = $(this).parents('.card').data();
        $(this).parents('.card').remove();

        articleToUnSave.saved = false;
        $.ajax({
            method: 'PUT',
            url: '/articles/' + articleToUnSave._id,
            data: articleToUnSave
        }).then(function (data) {
            if (data.saved === false) {
                initPage();
            }
        });
    }

    function handleArticleNotes(event) {
        console.log("cool")
        var currentArticle = $(this).parents('.card').data();
        $.get('/api/notes/' + currentArticle._id).then(function (data) {
            var modalText = $("<div class='container-fluid text-center'>").append(
                $('<h4>').text('Notes For Article: ' + currentArticle._id),
                $('<hr>'),
                $("<ul class='list-group note-container'>"),
                $("<textarea placeholder='New Note' rows='4' cols='60'>"),
                $("<button class='btn btn-success save'>Save Note</button>")
            );
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            $('.btn.save').data('article', noteData);
            renderNotesList(noteData);
        });
    }

    function renderNotesList(data) {
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
            notesToRender.push(currentNote);
        } else {
            for (var i = 0; i < data.notes.length; i++) {
                currentNote = $("<li class='list-group-item note'>")
                    .text(data.notes[i].noteText)
                    .append($("<button class='btn btn-danger note-delete'>x</button>"));
                currentNote.children('button').data('_id', data.notes[i]._id);
                notesToRender.push(currentNote);
            }
        }
        $('.note-container').append(notesToRender);
    }

    function handleNoteSave() {
        var noteData;
        var newNote = $('.bootbox-body textarea').val().trim();
        if (newNote) {
            noteData = { _headlineId: $(this).data('article')._id, noteText: newNote };
            $.post('/api/notes', noteData).then(function () {
                bootbox.hideAll();
            });
        }
    }

    function handleNoteDelete() {
        var noteToDelete = $(this).data('_id');
        $.ajax({
            url: '/api/notes/' + noteToDelete,
            method: 'DELETE'
        }).then(function () {
            bootbox.hideAll();
        });
    }

    function renderEmpty() {
        var emptyAlert = $(
            [
                "<div style='margin-left: 70px; margin-right: 70px' class='alert alert-warning text-center'>",
                "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
                "</div>",
                "<div style='margin-left: 70px; margin-right: 70px' class='card'>",
                "<div style='color: white' class='card-header text-center bg-dark'>",
                "<h3>Would You Like to Browse Available Articles?</h3>",
                "</div>",
                "<div class='card-body text-center'>",
                "<h4><a class='text-dark' href='/'>Browse Articles</a></h4>",
                "</div>",
                "</div>"
            ].join('')
        );
        articleContainer.append(emptyAlert);
    }

    function handleArticleClear() {
        $.get('/clear').then(function () {
            articleContainer.empty();
            initPage();
        });
    }
    initPage();
});