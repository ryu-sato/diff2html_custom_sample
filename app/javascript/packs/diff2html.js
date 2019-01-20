// diff2htmlを表示する
$(function () {
    'use strict';

    // base template ref: https://github.com/rtfpessoa/diff2html/blob/master/src/templates/side-by-side-file-diff.mustache
    // anchor をつける際、左右を判別するため data-side を追加した
    var rawTemplates = {
        'side-by-side-file-diff': (function () {/*
            <div id="{{fileHtmlId}}" class="d2h-file-wrapper" data-lang="{{file.language}}">
                <div class="d2h-file-header">
                    {{{filePath}}}
                </div>
                <div class="d2h-files-diff">
                    <div class="d2h-file-side-diff" data-side="left">
                        <div class="d2h-code-wrapper">
                            <table class="d2h-diff-table">
                                <tbody class="d2h-diff-tbody">
                                {{{diffs.left}}}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="d2h-file-side-diff" data-side="right">
                        <div class="d2h-code-wrapper">
                            <table class="d2h-diff-table">
                                <tbody class="d2h-diff-tbody">
                                {{{diffs.right}}}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            */}).toString().match(/(?:\/\*(?:[\s\S]*?)\*\/)/).pop().replace(/^\/\*/, "").replace(/\*\/$/, "")
    };
    var diff_string = document.getElementById("diff_string").innerText
    var diffHtml = Diff2Html.getPrettyHtml(
        diff_string,
        { inputFormat: 'diff', showFiles: true, matching: 'lines', outputFormat: 'side-by-side', rawTemplates: rawTemplates }
    );
    document.getElementById("diff_html").innerHTML = diffHtml;
});

// 差分のある行全てにアンカーをつける(side-by-side表示のrightの行番号にのみアンカーをつける)
$(function () {
    'use strict';

    $(".d2h-file-wrapper").each(function (index, element) {
        var prev = null;
        $(this).find(".d2h-file-side-diff[data-side='right'] .d2h-code-side-linenumber.d2h-ins,.d2h-file-side-diff[data-side='right'] .d2h-code-side-linenumber.d2h-change").each(function (index, element) {
            var line_num = Number($(this).text());
            var anchor = $(`<a name="r_${line_num}" id="r_${line_num}" />`);
            if (prev != null) {
                anchor.attr('data-prev-change', prev.attr("name"));
                $(`#${prev.attr('id')}`).attr('data-next-change', anchor.attr("name"));
            }
            $(this).wrapInner(anchor);
            prev = anchor;
        });
    });
});

// 現在の差分行へスタイルを適用する
$(function () {
    'use strict';

    // 現在の差分行へ適用したスタイルを全て取り除く
    function clearClassFromAllActiveLine() {
        $(".dcs-active-line").removeClass("dcs-active-line");
    }

    // 現在の差分行へスタイルを適用する
    function setActiveLineClass() {
        var currentAnchorName = location.hash.replace(/^#/, '');
        if (currentAnchorName === '') {
            return;
        }
        var activeTr = $(`a#${currentAnchorName}`).parents("tr");
        if (!activeTr) {
            return;
        }
        activeTr.addClass("dcs-active-line");
    }

    // アンカー変更時にスタイルを再適用する
    function handleHashChange() {
        clearClassFromAllActiveLine();
        setActiveLineClass();
    }
    handleHashChange();
    window.onhashchange = handleHashChange;
});

// 差分へ移動するボタンを有効化する
$(function () {
    'use strict';

    // 次の差分を表示させる
    function onClickNext(event) {
        var currentAnchorName = location.hash.replace(/^#/, '');
        var nextAnchor = null;
        if (currentAnchorName === '') {
            var nextAnchor = $(`.d2h-file-side-diff[data-side='right'] a[name^=r_]`).first().attr('name');
        } else {
            var currentAnchor = $(`#${currentAnchorName}`);
            if (!currentAnchor) {
                return;
            }
            nextAnchor = currentAnchor.attr('data-next-change');
        }
        if (!nextAnchor) {
            return;
        }
        location.href = `#${nextAnchor}`;
    }
    
    // 前の差分を表示させる
    function onClickPrev(event) {
        var currentAnchorName = location.hash.replace(/^#/, '');
        var nextAnchor = null;
        if (currentAnchorName === '') {
            var nextAnchor = $(`.d2h-file-side-diff[data-side='right'] a[name^=r_]`).last().attr('name');
        } else {
            var currentAnchor = $(`#${currentAnchorName}`);
            if (!currentAnchor) {
                return;
            }
            nextAnchor = currentAnchor.attr('data-prev-change');
        }
        if (!nextAnchor) {
            return;
        }
        location.href = `#${nextAnchor}`;
    }
    $("#next").on("click", onClickNext);
    $("#prev").on("click", onClickPrev);
});

/*
    コメントを表示する
*/
$(function () {
    // コメントタグを返す
    function commentTag(comment, visible = true) {
        var begCard = `<div id="comment-${comment.id}" data-comment-content="${comment.content}" data-comment-id="${comment.id}" data-comment-line="${comment.line}" class="card m-2">`;
        if (!visible) {
            begCard = `<div id="hidden-comment-${comment.id}" class="card m-2" style="visibility: hidden;">`;
        }
        return begCard
            + '<div class="card-body">'
            + '<pre>' + comment.content + '</pre>'
            + '<p class="card-text"><small class="text-muted">Updated at ' + comment.updated_at + '</small></p>'
            + '<button class="btn btn-sm btn-outline-dark mr-2">Edit</button>'
            + `<a href="/comments/${comment.id}" rel="nofollow" data-method="delete" data-confirm="Are you sure?"><button class="btn btn-sm btn-outline-danger">Delete</button></a>`
            + '</div>'
            + '</div>';
    }

    // コメントをafterログへ挿入する
    function appendCommentToBelowLine(comment) {
        var tr = null;
        $(`.d2h-file-side-diff[data-side='right'] td.d2h-code-side-linenumber`).each(function () {
            if ($(this).text() == comment.line) {
                tr = $(this).parent();
                return;
            }
        });
        if (!tr) {
            console.error('"tr" tag for comment is missing.');
            return;
        }
        tr.after('<tr><td colspan="2">' + commentTag(comment) + '</td></tr>');
        $(`#comment-${comment.id} button:contains("Edit")`).on('click', setCommentFormUpdateMode);
        return $(".d2h-file-side-diff[data-side='right'] table.d2h-diff-table tr").index(tr);
    }

    // 非表示のコメントをbeforeログへ挿入する(前提としているside-by-side表示で左右の行位置を揃えるために利用する)
    function appendHiddenCommentToBelowLine(comment, indexTr) {
        tr = $(".d2h-file-side-diff[data-side='left'] table.d2h-diff-table tr").eq(indexTr);
        if (!tr) {
            console.error('"tr" tag for comment is missing.');
            return;
        }
        tr.after('<tr class="d2h-cntx d2h-emptyplaceholder"><td colspan="2">' + commentTag(comment, false) + '</td></tr>');
    }

    // コメントタグを編集フォームに置き換える
    function setCommentFormUpdateMode() {
        var card = $(this).parents("div.card");
        if (!card) {
            console.error("Cannot found HTML tag for comment.");
            return;
        }
        var id = card.data('comment-id');
        var content = card.data('comment-content');
        var line = card.data('comment-line');
        if (!id || !content || !line) {
            console.error("Cannot get comment data.");
            return;
        }
        hiddenCommentTr = $(`#hidden-comment-${id}`).parents('tr');
        commentTr = card.parents('tr');
        if (!hiddenCommentTr || !commentTr) {
            console.error('"tr" tag for comment form or hidden comment form is missing.');
            return;
        }
        hiddenCommentTr.hide();
        commentTr.hide();
        var comment = { id: id, line: line, content: content }
        appendHiddenCommentForm(comment, hiddenCommentTr);
        commentTr.after('<tr><td colspan="2">' + commentFormTag(comment) + '</td></tr>');
        $(`#edit-comment-${comment.line} button:contains("Cancel")`).on('click', function () {
            var tr = $(this).parents("tr");
            if (!tr) {
                console.error('"tr" tag for comment form is missing.');
                return;
            }
            removeCommentForm(tr);
            commentTr.show();
            hiddenCommentTr.show();
        });
    }

    // コメント一覧を取得し、HTMLへ挿入する
    var base_url = location.pathname;
    $.ajax({
        url: `${base_url}/comments`,
        type: 'GET',
        dataType: 'json'
    })
    .always(function (comments) {
        $.each(comments, function (i, comment) {
            indexTr = appendCommentToBelowLine(comment);
            appendHiddenCommentToBelowLine(comment, indexTr);
        });
    });

    /*
      コメント追加機能
     */
    // コメントフォームタグを返す
    function commentFormTag(comment, visible = true) {
        var base_url = location.pathname;
        var diff_id = base_url.replace(/\/diffs\/(\d+)[^\d]*/, '$1');
        if (comment.id) {
            var begForm = `<form id="edit-comment-${comment.line}" class="edit-comment" action="/comments/${comment.id}" method="post">`;
            var methodTag = '<input type="hidden" name="_method" value="patch">'
            var submitBtn = '<input type="submit" class="btn btn-success" value="Update" />';
        } else {
            var begForm = `<form id="edit-comment-${comment.line}" class="edit-comment" action="/comments" method="post">`;
            var methodTag = '';
            var submitBtn = '<input type="submit" class="btn btn-success" value="Submit" />';
        }
        var begCard = '<div class="card">';
        if (!visible) {
            begForm = '<form class="hidden-edit-comment" action="#">';
            begCard = '<div class="card" style="visibility: hidden;">';
        }
        return begForm
            + begCard
            + '<div class="card-header">Comment</div>'
            + '<div class="card-body">'
            + '<div class="form-group">'
            + methodTag
            + `<input type="hidden" name="comment[line]" value="${comment.line}" />`
            + `<input type="hidden" name="comment[diff_id]" value="${diff_id}" />`
            + '<textarea name="comment[content]" class="form-control mb-3" id="comment" placeholder="Leave a comment">'
            + (comment.content || '')
            + '</textarea>'
            + '<button class="btn btn-outline-secondary mr-2">Cancel</button>'
            + submitBtn
            + '</div>'
            + '</div>'
            + '</form>';
    }
    
    // キャンセルボタンが押されたらフォームを削除する
    function removeCommentForm(formTr) {
        var indexNum = $(".d2h-file-side-diff[data-side='right'] table.d2h-diff-table tr").index(formTr);
        $(".d2h-file-side-diff[data-side='left'] table.d2h-diff-table tr").eq(indexNum).remove();
        formTr.remove();
    }
    
    // コメントフォームをafterログへ挿入する
    function appendCommentForm(comment, baseTr) {
        baseTr.after('<tr><td colspan="2">' + commentFormTag(comment) + '</td></tr>');
        $(`#edit-comment-${comment.line} button:contains("Cancel")`).on('click', function () {
            var tr = $(this).parents("tr");
            if (!tr) {
                console.error('"tr" tag for comment form is missing.');
                return;
            }
            removeCommentForm(tr);
        });
    }
    
    // 非表示のコメントフォームをbeforeログへ挿入する(前提としているside-by-side表示で左右の行位置を揃えるために利用する)
    function appendHiddenCommentForm(comment, baseTr) {
        baseTr.after('<tr><td colspan="2">' + commentFormTag(comment, false) + '</td></tr>');
    }

    // コメントフォーム追加ボタンが押されたときにafterログにフォームを追加し、beforeログに非表示のフォームを追加して高さを揃える
    function onClickAddComment() {
        var baseTr = $(this).parents("tr");
        if (!baseTr) {
            console.debug("invalid baseTr");
            return;
        }
        var lineNum = Number(baseTr.children('td').first().text());
        if (!lineNum) {
            console.debug("invalid lineNum");
            return;
        }
        var comment = { id: null, line: lineNum, content: null }
        appendCommentForm(comment, baseTr);
        indexNum = $(".d2h-file-side-diff[data-side='right'] table.d2h-diff-table tr").index(baseTr);
        baseTr = $(".d2h-file-side-diff[data-side='left'] table.d2h-diff-table tr").eq(indexNum);
        appendHiddenCommentForm(comment, baseTr);
    }
    
    // コメントフォームの挿入ボタンを各行に配置する(通常は非表示でマウスオーバした時のみ表示する)
    $(".d2h-file-wrapper").each(function (index, element) {
        $(this).find(".d2h-file-side-diff[data-side='right'] .d2h-code-side-linenumber").each(function (index, element) {
            var lineNum = Number($(this).text());
            var codeLine = $(this).next();
            if (!codeLine) {
                return;
            }
            addCommentBtn = $("<button class='btn dcs-add-comment'>&#43;</button>");
            addCommentBtn.css("visibility", "hidden");
            addCommentBtn.on("click", onClickAddComment);
            codeLine.prepend(addCommentBtn);
            codeLine.hover(
                function () {
                    var addCommentBtn = $(this).children(".dcs-add-comment");
                    if (!addCommentBtn) {
                        return;
                    }
                    addCommentBtn.css("visibility", "visible");
                },
                function () {
                    var addCommentBtn = $(this).children(".dcs-add-comment");
                    if (!addCommentBtn) {
                        return;
                    }
                    addCommentBtn.css("visibility", "hidden");
                }
            );
        });
    });
});