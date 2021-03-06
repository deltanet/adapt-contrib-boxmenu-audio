define([
    'core/js/adapt',
    'core/js/views/menuView'
], function(Adapt, MenuView) {

    var DeltaBoxMenuView = MenuView.extend({

        className: function() {
            return MenuView.prototype.className.apply(this) + " deltaboxmenu-menu";
        },

        attributes: function() {
            return MenuView.prototype.resultExtend('attributes', {
                'role': 'main',
                'aria-labelledby': this.model.get('_id')+'-heading'
            }, this);
        },

        postRender: function() {
          this.listenTo(Adapt, "device:resize", this.resizeHeight);

            var nthChild = 0;
            this.model.getChildren().each(function(item) {
                if (item.get('_isAvailable') && !item.get('_isHidden')) {
                    item.set('_nthChild', ++nthChild);
                    this.$('.js-children').append(new DeltaBoxMenuItemView({model: item}).$el);
                }

                if (item.get('_isHidden')) {
                    item.set('_isReady', true);
                }
            });

            this.resizeHeight();
        },

        resizeHeight: function() {
          this.resizeWidth();
          if (Adapt.device.screenSize === 'large') {
            var titleHeight = 0;
            var bodyHeight = 0;
            var numItems = $(".js-children > .menu-item").length;

            var titleArray = [];
            var bodyArray = [];

            for(var i=1; i<=numItems; i++) {
              titleArray[i] = $('.nth-child-'+i).find('.menu-item-title-inner').height();
              if(titleArray[i]>titleHeight) {
                titleHeight = titleArray[i];
              }
            }

            for(var i=1; i<=numItems; i++) {
              bodyArray[i] = $('.nth-child-'+i).find('.menu-item-body-inner').height();
              if(bodyArray[i]>bodyHeight) {
                bodyHeight = bodyArray[i];
              }
            }

            $('.menu-item').find('.menu-item-title-inner').css('min-height',titleHeight);
            $('.menu-item').find('.menu-item-body-inner').css('min-height',bodyHeight);

          } else {
            $('.menu-item').find('.menu-item-title-inner').css('min-height',0);
            $('.menu-item').find('.menu-item-body-inner').css('min-height',0);
          }
        },

        resizeWidth: function() {
          // Full width
          if(this.model.get("_deltaBoxMenu")._fullwidth) {
            $('.menu-container').addClass('full-width');
          }

          if(this.model.get("_deltaBoxMenu")._inRow != undefined || this.model.get("_deltaBoxMenu")._inRow != "") {
            var numInRow = this.model.get("_deltaBoxMenu")._inRow;
          } else {
            return;
          }

          var width = 100 / numInRow;
          // Round down to one decimal place
          var itemWidth = Math.floor( width * 10 ) / 10;

          if (Adapt.device.screenSize === 'large') {
            $('.menu-item').css('width',itemWidth+'%');
            $('.menu-item-inner').css({
                'margin-left': '2%',
                'margin-right': '2%'
            });
          } else {
            $('.menu-item').css('width','100%');
            $('.menu-item-inner').css({
                'margin-left': '0%',
                'margin-right': '0%'
            });
          }
        }

    }, {
        template: 'deltaboxmenu'
    });

    var DeltaBoxMenuItemView = MenuView.extend({

        events: {
            'click button' : 'onClickMenuItemButton'
        },

        attributes: function() {
            return MenuView.prototype.resultExtend('attributes', {
                'role': 'listitem',
                'aria-labelledby': this.model.get('_id') + '-heading'
            }, this);
        },

        className: function() {
            var nthChild = this.model.get('_nthChild');
            return [
                'menu-item',
                'menu-item-' + this.model.get('_id') ,
                this.model.get('_classes'),
                this.model.get('_isVisited') ? 'visited' : '',
                this.model.get('_isComplete') ? 'completed' : '',
                this.model.get('_isLocked') ? 'locked' : '',
                'nth-child-' + nthChild,
                nthChild % 2 === 0 ? 'nth-child-even' : 'nth-child-odd'
            ].join(' ');
        },

        preRender: function() {
            this.model.checkCompletionStatus();
            this.model.checkInteractionCompletionStatus();

            if (this.model.get('_isComplete') || this.model.get('_isVisited')) {
                this.model.set('_isVisited', true);
            }
        },

        postRender: function() {
            var graphic = this.model.get('_graphic');
            if (graphic && graphic.src) {
                this.$el.imageready(this.setReadyStatus.bind(this));
                return;
            }

            this.setReadyStatus();
        },

        onClickMenuItemButton: function(event) {
            if (event && event.preventDefault) event.preventDefault();
            if (this.model.get('_isLocked')) return;
            Backbone.history.navigate('#/id/' + this.model.get('_id'), {trigger: true});
        }

    }, {
        template: 'deltaboxmenu-item'
    });

    Adapt.on('router:menu', function(model) {
        $('#wrapper').append(new DeltaBoxMenuView({model: model}).$el);
    });

});
