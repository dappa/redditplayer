// Reddit module
define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Reddit = app.module();

  // Default Model.
  Reddit.Model = Backbone.Model.extend({
    
  });

  // Reddit frontpage and subreddit collection
  Reddit.Collection = Backbone.Collection.extend({

    model: Reddit.Model,

    parse: function(response) {

      console.log('Parsing collection [reddit]...');

      this.afterId = response.data.after;
      this.beforeId = response.data.before;

      var _ref, _data;
      _ref = response.data.children;
      _data = _.pluck(_ref, 'data');
      
      return _data;
    },

    initialize: function(models, options){
      console.log('Started [reddit] collection...');

      if (options) {
        this.subreddit = options.subreddit;
        this.state = options.state;
        this.zone = options.zone;
        this.countIndex = options.countIndex;
      }
    },

    url: function() {
      var getUrl;
      getUrl = 'http://www.reddit.com/';

      if (this.subreddit) {
        getUrl += 'r/' + this.subreddit;
      }

      getUrl += '.json?jsonp=?';

      if (this.state == 'after')
      {
        getUrl += '&count=' + this.countIndex + '&after=' + this.zone;
      }

      if (this.state == 'before')
      {
        getUrl += '&count=' + this.countIndex + '&before=' + this.zone;
      }

      return getUrl;
    }

  });

 // Single Story View
  Reddit.Views.Story = Backbone.View.extend({
    template: "reddit/item",
    tagName: 'li',
    className: 'story hide clearfix',

    data: function(){
      return { model: this.model };
    },

    events: {
      'click .comments' : 'goComment',
      'click a' : function(){
        $.cookie('last_link', this.model.id);
        this.$el.addClass('visited');
      }
    },

    afterRender: function(){
      var self = this;
      _.delay(function(){
        self.$el.removeClass('hide');
      }, 100);
    },

    goComment: function(){

      this.$el.siblings().removeClass('selected');
      this.$el.addClass('selected');

      // If support for localStorage, go ahead an save the ID of the story to visited key pair
      if (localStorage) {

        var stored = localStorage.getObject('visited');

        if (_.isNull(stored)) {
          stored = {
            'id':this.model.id
          };
          insert = [stored];
        } else {

          var finder = _.find(stored, function(obj) {
            return obj.id == this.model.id;
          }, this);

          if (!finder) {
            stored.push({'id': this.model.id });
          }
            insert = stored;   
        }

        localStorage.setObject('visited', insert);
      }

      this.$el.addClass('visited');
    
      app.router.navigate('view' + this.model.attributes.permalink, true);
      return false;
    },

    initialize: function(){

      // If we have localStorage support, check for previously visited links
      if (localStorage) {
        var stored = localStorage.getObject('visited');
        var finder = _.find(stored, function(obj) {
            return obj.id == this.model.id;
        }, this);

        if (finder) {
          this.$el.addClass('visited');
        }
      }

      var last_link = $.cookie('last_link');
      if (last_link == this.model.id) {
        this.$el.addClass('visited');
      }
    }

  });

  // Bottom navigation for Back and Next
  /*Reddit.Views.Navigate = Backbone.View.extend({
    template: "reddit/navigate",
    className: 'navigate',

    data: function() {
      return {
        after: this.collection.afterId,
        before: this.collection.beforeId
      };
    },

    events: {
      'click #next-stories' : 'nextStories',
      'click #before-stories' : 'beforeStories',
    },

    nextStories: function(item){

      if (this.collection.countIndex == null) {
        app.router.go("go", this.collection.afterId, 'after', 25);
      }

      else {
        var num = parseInt(this.collection.countIndex, 10) + 25;
        if (this.collection.state == 'before') {
          var num = parseInt(this.collection.countIndex, 10) - 1;
        }
        app.router.go("go", this.collection.afterId, 'after', num);
      }

      return false;
    },

    beforeStories: function(item){
      if (this.collection.beforeId === null) {
        return false;
      }
      else {
        var num = parseInt(this.collection.countIndex, 10) + 1;
        if (this.collection.state == 'before') {
          num = parseInt(this.collection.countIndex, 10) - 25;
        }
        app.router.go("go", this.collection.beforeId, 'before', num);
      }
      return false;
    }
  });*/


  // Collection View Reddit
  Reddit.Views.Stories = Backbone.View.extend({

    tagName: 'ul',
    className: 'stories',

    data: function(){
      return { collection: this.options.reddit };
    },

    beforeRender: function() {

      this.options.reddit.each(function(story){
        this.insertView(new Reddit.Views.Story({
          model: story
        }));
      }, this);
    },

    // Code for navigating with buttons
    afterRender: function(){

      console.log('Rendering [Reddit.Views.Stories]...');

      /*this.insertView(new Reddit.Views.Navigate({
        collection: this.options.reddit,
        append: function(root, child){
          $(root).after(child);
        }
      }, this));*/

    },

    cleanup: function() {
      this.options.reddit.off(null, null, this);
    },

    
    initialize: function() {

      //collection
      var reddit = this.options.reddit;

      reddit.on("add", this.addStory, this);
      reddit.on("reset", function(){

        this.infiniScroll = new Backbone.InfiniScroll(reddit, {
          param: "after",
          pageSizeParam: "count",
          strict: true
        });

        this.render();
      }, this);

      reddit.on("fetch", function(){
        console.log('Fetching data for [reddit.collection] ' + reddit.afterId + ' ...');
      }, this);
    },

    addStory: function(story) {
      this.insertView(new Reddit.Views.Story({
        model: story
      })).render();
    }
  });

  // Return the module for AMD compliance.
  return Reddit;

});
