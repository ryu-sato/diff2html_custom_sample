const { environment } = require('@rails/webpacker')
const vue =  require('./loaders/vue')

const webpack = require('webpack');

// Add an ProvidePlugin
environment.plugins.append('Provide',  new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery',
  jquery: 'jquery',
  Popper: ['popper.js', 'default']
})
)

const config = environment.toWebpackConfig()

config.resolve.alias = {
  jquery: "jquery/src/jquery",
  'vue$': 'vue/dist/vue.esm.js'
}

environment.loaders.append('vue', vue)
module.exports = environment
