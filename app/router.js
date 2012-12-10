define([
  // Application.
  "app",
  "modules/reddit",
  "modules/comments"
],

function(app, Reddit, Comments) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({

    initialize: function() {

      console.log('Starting Routes...');

      var collections = {
        reddit: new Reddit.Collection(),
        comments: new Comments.Collection()
      };

      _.extend(this, collections);

      app.useLayout('main-layout').setViews({
        ".reddit": new Reddit.Views.Stories(collections),
        ".flap-view": new Comments.Views.Layout(collections)
      }).render();

    },

    routes: {
      "": "index",
      "go/:zone/:state/:countIndex" : "index",
      "view/*splat" : "comments"
    },

    index: function(zone, state, countIndex) {

      console.log('Route [index]...');

      this.reset();

      if (zone) {
        this.reddit.state = state;
        this.reddit.zone = zone;
        this.reddit.countIndex = countIndex;
      }

      this.reddit.fetch();
    },

    comments: function(splat) {
      console.log('Route [comments]...');
      this.comments.splat = splat;

      // 
      if (this.reddit.length === 0) {
        this.reddit.fetch();
      }
      
      this.comments.fetch();
    },

    reset: function() {
      // Reset collections to initial state.
      if (this.reddit.length) {

        this.reddit.state = null;
        this.reddit.zone = null;
        this.reddit.countIndex = null;

        console.log(this.reddit);

        this.reddit.reset();
      }
    },

    // Shortcut for building a url.
    go: function() {
      return this.navigate(_.toArray(arguments).join("/"), true);
    }

  });

  return Router;
});
