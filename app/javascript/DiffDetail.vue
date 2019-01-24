<template>
  <div :is="compiled"></div>
</template>

<script>
import Vue from 'vue';
import { Diff2Html } from "diff2html";
import "diff2html/dist/diff2html.min.css";

var diff_id = location.pathname.replace(/\/diffs\/(\d+)[^\d]*/, '$1');
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
    */}).toString().match(/(?:\/\*(?:[\s\S]*?)\*\/)/).pop().replace(/^\/\*/, "").replace(/\*\/$/, ""),
  'generic-line': (function () {/*
    <tr>
      <td class="{{lineClass}} {{type}}">
        !{{{lineNumber}}}
      </td>
      <td class="{{type}}">
        <div class="{{contentClass}} {{type}}">
          <diff-line>
            {{#prefix}}
                <span class="d2h-code-line-prefix">{{{prefix}}}</span>
            {{/prefix}}
            {{#content}}
                <span class="d2h-code-line-ctn">{{{content}}}</span>
            {{/content}}
          </diff-line>
        </div>
      </td>
    </tr>
  */}).toString().match(/(?:\/\*(?:[\s\S]*?)\*\/)/).pop().replace(/^\/\*/, "").replace(/\*\/$/, "")
};

var AddBtn = Vue.component('add-btn', {
    template: '<button class="btn dcs-add-comment" @click=onClick>&#43;</button>',
    methods: {
        onClick: function() {
            alert('add-btn');
        }
    }
});

var DiffLine = Vue.component('diff-line', {
    data () {
        return {
            seen: true
        }
    },
    components: {
        AddBtn
    },
    template: '<div @mouseenter="mouseEnter" @mouseleave="mouseLeave"><add-btn refs="addBtn" v-if="seen"></add-btn></div>',
    methods: {
        mouseEnter: function() {
            this.seen = true;
        },
        mouseLeave: function() {
            this.seen = false;
        }
    }
});


export default {
    props: ['diffString'],
    data () {
        return {
            compiled: null
        }
    },
    mounted(){ 
        setTimeout(() => { 
            console.log("this.diffString");
            console.log(this.diffString);
            this.compiled = Vue.compile('<div>' + Diff2Html.getPrettyHtml(this.diffString, {
                inputFormat: "diff",
                showFiles: true,
                matching: "lines",
                outputFormat: "side-by-side",
                rawTemplates: rawTemplates
                }) + '</div>');
        }, 500)
    }
};

</script>
