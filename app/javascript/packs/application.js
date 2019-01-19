/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

console.log('Hello World from Webpacker')

// use rails-ujs
import Rails from 'rails-ujs';
Rails.start();

// use jquery
import 'jquery';
import "popper.js/dist/popper";

// use bootstrap
import 'bootstrap/dist/js/bootstrap';

// use diff2html
import 'diff2html';

// use datatable
import 'datatables.net'
import 'datatables.net-bs4'
//   init datatable
import './datatables';
