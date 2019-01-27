<template>
  <div>
    <div class="d-flex p-2" style="position: sticky; z-index: 1000; top: 0px;">
      <label class="label mr-2 mt-1">Jump </label>
      <div class="btn-group" role="group" aria-label="First group">
        <button id="next" class="btn btn-secondary" @click="nextChange">Next</button>
        <button id="prev" class="btn btn-secondary" @click="prevChange">Prev</button>
      </div>
    </div>
    <component :is="compiled"></component>
  </div>
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
                    <diff-table side="l" class="d2h-diff-table">
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
                    <diff-table side="r" class="d2h-diff-table">
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
    <diff-tr :side="slotProps.side" :current-change="slotProps.currentChange" line="{{lineNumber}}" type="{{type}}">
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
    </diff-tr>
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
    side: "",
    line: Number
  },
  template: '<button class="btn dcs-add-comment" @click="showCommentForm">&#43;</button>',
  methods: {
    showCommentForm: function() {
      EventBus.$emit('show-comment-form', this.side, this.line);
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
  computed: {
    anchorId: function() {
      return this.side + "_" + this.line;
    },
    numberdLine: function() {
      return (parseInt(this.line) > 0);
    }
  },
  template:
    '<td @mouseenter="mouseEnter" @mouseleave="mouseLeave">' +
      '<a :name="anchorId" :id="anchorId" v-if="numberdLine"></a>' +
      '<add-btn refs="addBtn" v-if="btnSeen" :side="side" :line="parseInt(line)"></add-btn>' +
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
var commentForm = Vue.component("comment-form", {
  props: {
    commentId: Number,
    line: Number,
    content: String
  },
  data() {
    return {
      seen: true
    };
  },
  computed: {
    formId: function() {
      // [TODO] 必要なければ削除する
      return `edit-comment-${this.line}`;
    },
    formAction: function() {
      if (this.commentId > 0) {
        return `/comments/${this.commentId}`;
      } else {
        return '/comments/';
      }
    },
    diffId: function() {
      return location.pathname.replace(/\/diffs\/(\d+)[^\d]*/, "$1");
    }
  },
  methods: {
    destroyForm: function() {
      this.$delete(this);
    }
  },
  template: `
    <tr>
      <td colspan="2">
        <form :id="formId" class="edit-comment" :action="formAction" method="post" v-if="seen">
          <div class="card">
            <div class="card-header">Comment</div>
            <div class="card-body">
              <div class="form-group">
                <input type="hidden" name="_method" value="patch" />
                <input type="hidden" name="comment[line]" :value="line" />
                <input type="hidden" name="comment[diff_id]" :value="diffId" />
                <textarea name="comment[content]" class="form-control mb-3" id="comment" placeholder="Leave a comment">
                  {{content}}
                </textarea>
                <button class="btn btn-outline-secondary mr-2" v-on:submit.prevent="destroyForm">Cancel</button>
                <input type="submit" class="btn btn-success" value="Commit" />
              </div>
            </div>
          </div>
        </form>
      </td>
    </tr>
  `
});

/**
 * Diffテーブルの行コンポーネント
 */
var DiffTr = Vue.component("diff-tr", {
  props: {
    line: String,  // Numberにすると空文字列の場合にエラーとなるので一旦文字列で受け取っている
    side: String,
    type: "",
    currentChange: String
  },
  computed: {
    classObject: function() {
      var name = this.side + "_" + this.line
      return {
        'dcs-active-line': this.currentChange == name
      };
    }
  },
  created() {
    if (this.side == 'l') {
      this.$parent.$parent.$parent.$data.leftTrs.push(this);
    } else if (this.side == 'r') {
      this.$parent.$parent.$parent.$data.rightTrs.push(this);
    }
  },
  methods: {
    isChanged: function() {
      var typeClasses = this.type.split(' ');
      return typeClasses.indexOf('d2h-ins') != -1 || typeClasses.indexOf('d2h-change') != -1;
    }
  },
  template: '<tr :class="classObject"><slot :side="side"></slot></tr>'
})

/**
 * Diffテーブル全体のコンポーネント
 */
var DiffTable = Vue.component("diff-table", {
  props: {
    side: String
  },
  data() {
    return {
      currentChange: this.$parent.$parent.$data.currentChange
    };
  },
  created() {
    this.$parent.$parent.$data.tables.push(this);
  },
  template: '<table><slot :side="side" :current-change="currentChange"></slot></table>'
})

/**
 * 全行Diff用コンポーネント
 */
export default {
  props: ["diffString"],
  data() {
    return {
      compiled: null,
      currentChange: "",
      tables: [],
      leftTrs: [],
      rightTrs: []
    };
  },
  mounted() {
    setTimeout(() => {
      this.compiled = Vue.compile(
        '<div>' +
          Diff2Html.getPrettyHtml(this.diffString, {
            inputFormat: "diff",
            showFiles: true,
            matching: "lines",
            outputFormat: "side-by-side",
            rawTemplates: rawTemplates
          }) +
          '</div>'
      );
    }, 500);
  },
  created() {
    EventBus.$on('show-comment-form', this.showCommentForm);
    EventBus.$on('hide-comment-form', this.hideCommentForm);
    this.currentChange = location.hash.replace(/^#/, '');
  },
  methods: {
    // コメントフォームを表示する
    showCommentForm(side, codeLine) {
      // [TODO] 毎回ソートしなくてもよい方法に変更する
      this.leftTrs = this.leftTrs.sort((a, b) => { return a.line - b.line; });
      this.rightTrs = this.rightTrs.sort((a, b) => { return a.line - b.line; });

      var trs = (side == 'l' ? this.leftTrs : this.rightTrs);
      var index = trs.findIndex(tr => tr.line == codeLine);

      var CommentForm = Vue.component('comment-form');
      var instance = new CommentForm({
        propData: {
          line: codeLine
        }
      }).$mount();
      trs[index].$el.parentNode.insertBefore(instance.$el, trs[index].$el.nextSibling);
      alert("showCommentForm: " + side + ", " + codeLine);
    },

    // コメントフォームを閉じる
    hideCommentForm(codeLine, trIndex) {
      alert("hideCommentForm: " + codeLine + ", " + trIndex);
    },

    // 次の変更箇所の行へ進む
    nextChange() {
      this.changeCursor(1);
    },

    // 前の変更箇所の行へ戻る
    prevChange() {
      this.changeCursor(-1);
    },

    // 現在指している変更箇所から見て、進むか戻る方向へ変更箇所をカーソルを移動させる。
    // カーソルが当たっていない場合は、指定した方向から開始して初めて見つかった箇所にカーソルを当てる。
    changeCursor(direction) {
      if (!(direction > 0 || direction < 0)) {
        console.warn(`changedCursor() returned. "direction" should be less than zero or grater than zero.`);
        console.debug(`"direction" = ${direction}`);
        return;
      }
      // [TODO] 毎回ソートしなくてもよい方法に変更する
      this.leftTrs = this.leftTrs.sort((a, b) => { return a.line - b.line; });
      this.rightTrs = this.rightTrs.sort((a, b) => { return a.line - b.line; });

      var nextIndex = -1;
      var trs = (this.currentChange.charAt(0) == 'l' ? this.leftTrs : this.rightTrs);
      var line = (this.currentChange.slice(2));
      var index = trs.findIndex(tr => tr.line == line);
      if (direction > 0) {
        if (isNaN(parseInt(line))) {
          // カーソルが当たっていなければ最初に見つかった行にカーソルを当てる
          nextIndex = trs.findIndex(tr => tr.isChanged());
        } else {
          nextIndex = trs.findIndex(tr => (tr.line >= parseInt(line) + 1 && tr.isChanged()));
        }
      } else if (direction < 0) {
        if (isNaN(parseInt(line))) {
          // カーソルが当たっていなければ最終行から探して、最初に見つかった行にカーソルを当てる
          nextIndex = trs.reverse().findIndex(tr => tr.isChanged());
        } else {
          nextIndex = trs.reverse().findIndex(tr => (tr.line <= parseInt(line) - 1 && tr.isChanged()));
        }
      }
      if (nextIndex != -1) {
        this.currentChange = trs[nextIndex].$props.side + '_' + trs[nextIndex].$props.line;
        location.href = '#' + trs[nextIndex].$props.side + '_' + trs[nextIndex].$props.line;
        this.tables.forEach(e => e.currentChange = this.currentChange);
      }
    }
  }
};
</script>
