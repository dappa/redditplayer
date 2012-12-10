// Comments module
define([
  // Application.
  "app",
  "plugins/jquery.zoom"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Comments = app.module();

  // Default Model.
  Comment.Model = Backbone.Model.extend({

  });

  // Default Collection.
  Comments.Collection = Backbone.Collection.extend({

    model: Comment.Model,

    parse: function(response){

      this.story = response[0].data.children[0].data;

      var _ref, _data;
      _ref = response[1].data.children;
      _data = _.pluck(_ref, 'data');

      return _data;
    },

    url: function(){
      var getUrl;
      getUrl = 'http://www.reddit.com/';
      getUrl += this.splat;
      getUrl += '.json?jsonp=?';
      return getUrl;
    },

    initialize: function(){
      
    }

  });

  // Comments view
  Comments.Views.Comments = Backbone.View.extend({
    template: "flap/comments",

    className: "flap-comments",

    data: function(){
      return { collection: this.collection };
    },

    beforeRender: function(){
      this.collection.each(function(comment){
        this.insertView(new Comments.Views.Comment({
          model: comment
        }));
      }, this);
    }
  });

  // Collection view comments
  Comments.Views.Comment = Backbone.View.extend({

    template: "flap/comment",

    className: 'flap-comment' ,

    data: function(){
      return { model: this.model };
    },

    beforeRender: function(){
      if (this.model.get('replies')) {
        this.replies(this.model);
      }
    },

    afterRender: function(){
      if (this.$el.parent('div').hasClass('odd')) {
        this.$el.removeClass('odd');
        this.$el.addClass('even');
      }
    },

    replies: function(model){

      var replies = _.pluck(model.get('replies').data.children, 'data');
      var self = this;
      
      _.each(replies, function(comment, index){

        var commentModel = new Comment.Model(comment);

        self.insertView(new Comments.Views.Comment({ model: commentModel, childComment:true }));
      });
    },

    initialize: function(model){
      if (model.childComment) {
        this.$el.addClass('odd');
      }
    }
  });

  // Media View
  Comments.Views.Media = Backbone.View.extend({
    template: 'flap/media',
    className: 'flap-media',

    data: function(){
      return { image: this.options.image };
    },

    beforeRender: function(){

    },

    initialize: function(){
      this.options.bind('change', this.render, this);
    }

  });

  Comments.Views.Story = Backbone.View.extend({

    template: 'flap/story',
    className: 'flap-story',

    data: function(){
      return { model: this.model };
    },

    afterRender: function(){

      var self = this;

      if (this.model.url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
        this.$el.append('<div class="media"><img src="'+ this.model.url +'"></div>');

        $('div.media').zoom({
          url: this.model.url
        });
      }

      // Get oEmbed content if there is any!
      $.ajax({
        url: 'http://noembed.com/embed?url=' + this.model.url + '&maxwidth=500',
        dataType: 'jsonp',
        success: function(data) {
          if (data.error) {
            return;
          }
         self.$el.append(data.html);
        }
      });
    },

    initialize: function(){
    }
  });

  // Default View.
  Comments.Views.Layout = Backbone.LayoutView.extend({

    template: "flap/layout",
    className: "container",

    beforeRender: function(){

      if (this.options.comments.length > 0) {
        this.insertView(new Comments.Views.Story({model: this.options.comments.story}));
        this.insertView(new Comments.Views.Comments({collection: this.options.comments}));
      }
    },

    afterRender: function(){

      var self = this;

      // Distance to the top from current position
      var toTop = $(window).scrollTop();
      
      // Tag a position as the starting point
      var prevY = toTop;

      if (toTop > 0) {
        this.$el.addClass('fixed').removeAttr('style');
      }

      var container = this.$el.offset().top;

      // Handle scroll events so scrolling closer to top fixes the position and free when scrolling down
      $(window).scroll(function(){

        // Current distance to top
        var y = $(window).scrollTop();
        var currentContainer = self.$el.offset().top;
        
        //Going down!
        if (y > prevY) {
          if (y >= container && self.$el.hasClass('fixed') === true) {
            self.$el.css('margin-top', (currentContainer - 86) + 'px').removeClass('fixed');
          }
        }
        // Going up!
        else {
          // Start of page, remove fixed
          if (y < 68) {
            self.$el.removeClass('fixed').removeAttr('style');
          }

          else if (y < currentContainer && self.$el.hasClass('fixed') === false) {
            self.$el.addClass('fixed').removeAttr('style');
          }
        }
        prevY = y;
      });
    },

    initialize: function(){
      this.options.comments.on('reset', this.render, this);
      this.options.comments.on('fetch', function(){
        this.$el.html('<div class="loading"><img src="/app/img/ajax-loader.gif"></div>');
      }, this);
    }

  });

  // Return the module for AMD compliance.
  return Comments;

});
