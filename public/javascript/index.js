$(document).ready(function () {
    var articleContainer = $('.article-container');
    $(document).on('click', '.btn.save', handleArticleSave);
    $(document).on('click', '.scrape-new', handleArticleScrape);
    $('.clear').on('click', handleArticleClear);

    function initPage() {
        $.get('/articles?saved=false').then(function (data) {
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
                    .attr('href', 'https://www.nytimes.com' + article.URL)
                    .text(article.headline),
            )
        );

        var cardBody = $("<div class='card-body'>").text(article.summary);
        var btn = $("<div class='card-body'><a class='btn btn-outline-secondary save'>Save Article</a>")

        card.append(cardHeader, cardBody, btn);
        card.data('_id', article._id);
        return card;
    }

    function renderEmpty() {
        var emptyAlert = $(
            [
                "<div style='margin-left: 70px; margin-right: 70px' class='alert alert-warning text-center'>",
                "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
                "</div>",
                "<div style='margin-left: 70px; margin-right: 70px' class='card'>",
                "<div style='color: white' class='card-header text-center bg-dark'>",
                "<h3>What Would You Like To Do?</h3>",
                "</div>",
                "<div class='card-body text-center'>",
                "<h4><a class='text-dark' href='/scrape'>Try Scraping New Articles</a></h4>",
                "</div>",
                "</div>"
            ].join('')
        );
        articleContainer.append(emptyAlert);
    }

    function handleArticleSave() {
        var articleToSave = $(this).parents('.card').data();
        console.log(articleToSave);
        $(this).parents('.card').remove();

        articleToSave.saved = true;
        $.ajax({
            method: 'PUT',
            url: '/articles/' + articleToSave._id,
            data: articleToSave
        }).then(function (data) {
            if (data.saved) {
                initPage();
            }
        });
    }

    function handleArticleScrape() {
        $.get('/scrape').then(function (data) {
            initPage();
            bootbox.alert($("<h3 class='text-center m-top-80'>").text(data.message));
            console.log('Scraping');
        });
    }

    function handleArticleClear() {
        $.get('/clear').then(function () {
            articleContainer.empty();
            initPage();
        });
    }
    initPage();
});
