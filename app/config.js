// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file and the JamJS
  // generated configuration file.
  deps: ["../vendor/jam/require.config", "main"],

  paths: {
    plugins: "../vendor/js/plugins"
  },

  shim: {
    "plugins/infiniScroll": ["backbone"],
    "plugins/jquery.cookie": ["jquery"],
    "plugins/jquery.zoom" : ["jquery"]
  }

});
