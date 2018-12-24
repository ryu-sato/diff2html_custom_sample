/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

console.log('Hello World from Webpacker')

import 'bootstrap/dist/js/bootstrap';
import 'diff2html';
import 'datatables.net';
import 'datatables.net-bs4';

global.$ = global.jQuery = require('jquery');
global.dt = require( 'datatables.net' )( global.window, global.$ );
global.buttons = require( 'datatables.net-buttons' )( global.window, global.$ );

import './datatables';

// Styles
import '../src/application';
