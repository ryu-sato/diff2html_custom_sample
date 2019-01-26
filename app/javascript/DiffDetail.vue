<template>
  <div :is="compiled"></div>
</template>

<script>
import Vue from "vue";
import { Diff2Html } from "diff2html";
import "diff2html/dist/diff2html.min.css";

var diff_id = location.pathname.replace(/\/diffs\/(\d+)[^\d]*/, "$1");
var rawTemplates = {
  "side-by-side-file-diff": function() {
    /*
    <div id="{{fileHtmlId}}" class="d2h-file-wrapper" data-lang="{{file.language}}">
        <div class="d2h-file-header">
            {{{filePath}}}
        </div>
        <div class="d2h-files-diff">
            <div class="d2h-file-side-diff">
                <div class="d2h-code-wrapper">
                    <diff-table side="left" class="d2h-diff-table">
                    <template slot-scope="slotProps">
                        <tbody class="d2h-diff-tbody">
                        {{{diffs.left}}}
                        </tbody>
                    </template>
                    </diff-table>
                </div>
            </div>
            <div class="d2h-file-side-diff">
                <div class="d2h-code-wrapper">
                    <diff-table side="right" class="d2h-diff-table">
                    <template slot-scope="slotProps">
                        <tbody class="d2h-diff-tbody">
                        {{{diffs.right}}}
                        </tbody>
                    </template>
                    </diff-table>
                </div>
            </div>
        </div>
    </div>
    */
  }
    .toString()
    .match(/(?:\/\*(?:[\s\S]*?)\*\/)/)
    .pop()
    .replace(/^\/\*/, "")
    .replace(/\*\/$/, ""),
  "generic-line": function() {
    /*
    <tr>
      <td class="{{lineClass}} {{type}}">
        {{{lineNumber}}}
      </td>
      <code-td :side="slotProps.side" line="{{lineNumber}}" class="{{type}}">
        <div class="{{contentClass}} {{type}}">
          {{#prefix}}
              <span class="d2h-code-line-prefix">{{{prefix}}}</span>
          {{/prefix}}
          {{#content}}
              <span class="d2h-code-line-ctn">{{{content}}}</span>
          {{/content}}
        </div>
      </code-td>
    </tr>
  */
  }
    .toString()
    .match(/(?:\/\*(?:[\s\S]*?)\*\/)/)
    .pop()
    .replace(/^\/\*/, "")
    .replace(/\*\/$/, "")
};

/**
 * イベントを通知させるための空コンポーネント
 */
var EventBus = new Vue();

/**
 * コメント追加ボタン用コンポーネント
 */
var AddBtn = Vue.component("add-btn", {
  props: {
    line: Number
  },
  template: '<button class="btn dcs-add-comment" @click="showCommentForm">&#43;</button>',
  methods: {
    showCommentForm: function() {
      EventBus.$emit('show-comment-form', this.line, -1);
    }
  }
});

/**
 * Diffテーブルのコード表示列コンポーネント
 */
var CodeTD = Vue.component("code-td", {
  props: {
    line: String,  // Numberにすると空文字列の場合にエラーとなるので一旦文字列で受け取っている
    side: String
  },
  data() {
    return {
      btnSeen: false
    };
  },
  components: {
    AddBtn
  },
  computed: {
    anchorId: function() {
      return (this.side == "left" ? "l" : "r") + "_" + this.line;
    },
    numberdLine: function() {
      return (parseInt(this.line) > 0);
    }
  },
  template:
    '<td @mouseenter="mouseEnter" @mouseleave="mouseLeave">' +
      '<a :name="anchorId" :id="anchorId" v-if="numberdLine"></a>' +
      '<add-btn refs="addBtn" v-if="btnSeen" v-bind:line="parseInt(line)"></add-btn>' +
      '<slot></slot>' +
      '</td>',
  methods: {
    mouseEnter: function() {
      if (this.line == "") {
        return;  // 行番号が無い場合はコメント追加できないので追加ボタンを表示させないで関数を終わらせる
      }
      this.btnSeen = true;
    },
    mouseLeave: function() {
      this.btnSeen = false;
    }
  }
});

/**
 * コメント挿入フォーム
 */
var CmtForm = Vue.component("comment-form", {
  props: {
    commentId: Number,
    line: Number,
    diffId: Number,
    content: String,
  },
  template: `
    <tr>
      <td colspan="2">
        <form id={"edit-comment-" + this.line} class="edit-comment" action={"/comments/" + this.commentId} method="post">
          <div class="card">
            <div class="card-header">Comment</div>
            <div class="card-body">
              <div class="form-group">
                <input type="hidden" name="_method" value="patch" />
                <input type="hidden" name="comment[line]" value={this.line} />
                <input type="hidden" name="comment[diff_id]" value={this.diffId} />
                <textarea name="comment[content]" class="form-control mb-3" id="comment" placeholder="Leave a comment">
                  {this.content}
                </textarea>
                <button class="btn btn-outline-secondary mr-2">Cancel</button>
                <input type="submit" class="btn btn-success" value="Update" />
              </div>
            </div>
          </div>
        </form>
      </td>
    </tr>
  `
})

/**
 * Diffテーブル全体のコンポーネント
 */
var DiffTable = Vue.component("diff-table", {
  props: {
    side: String
  },
  template: '<table><slot v-bind:side="side"></slot></table>'
})

/**
 * 全行Diff用コンポーネント
 */
export default {
  props: ["diffString"],
  data() {
    return {
      compiled: null
    };
  },
  mounted() {
    setTimeout(() => {
      console.log("this.diffString");
      console.log(this.diffString);
      this.compiled = Vue.compile(
        "<div>" +
          Diff2Html.getPrettyHtml(this.diffString, {
            inputFormat: "diff",
            showFiles: true,
            matching: "lines",
            outputFormat: "side-by-side",
            rawTemplates: rawTemplates
          }) +
          "</div>"
      );
    }, 500);
  },
  created() {
    EventBus.$on('show-comment-form', this.showCommentForm),
    EventBus.$on('hide-comment-form', this.hideCommentForm)
  },
  methods: {
    showCommentForm(codeLine, trIndex) {
      alert("showCommentForm: " + codeLine + ", " + trIndex);
    },
    hideCommentForm(codeLine, trIndex) {
      alert("hideCommentForm: " + codeLine + ", " + trIndex);
    }
  }
};
</script>
