/*
 * Drag Order - https://github.com/shiboe/dragOrder
 * Version 1.4.0
 * 
 * A simple script for implementing a dragable ordering interface.
 * 
 * $(element).dragOrder({options});
 * 
 * Developed by [Stephen Cave](sccave@gmail.com) @ [shiboe.com](http://shiboe.com) Copyright 2012.
 * [Licensed under the MIT License](http://opensource.org/licenses/mit-license.php)
 * 
 */

(function( $ ){

  var methods = {
     init : function( options ) {
         
        var settings = $.extend( {
            "vertical":false, // wheither the items are listed vertically, false is for horizontal orientation
            "catchThreshold": 3, // to prevent clicks triggering a move, drag must hold over this many pixels
            "moveStyles": ".dragContainer", // the element(s) within the container to apply the moving styles to, defaults to the dragContainer
            "delimiter": "#", // sets the delimiter to use when passing the order to the callback and from the preorder function as a string
            "callback": false, // function to recieve the order as a parameter after each re-ordering
            "callbackOrderType": "string", // the parameter type to recieve the order as, can be (string||array)
            "callbackOnInitialize": false, // fires the callback after the initialization (in addition to the default fire whenever an item is dragged to a new position)
            "loadSyncOrder": false // order to use on load, can be string, array, or a function that returns a string or array. Primarily used to maintain state.
        }, options);

       return this.each(function(){ build( this, settings ); });
     },
     reset : function() {
        //TODO
     },
     destroy : function( ) {

       return this.each(function(){
           //TODO
       });
     }
  };

  $.fn.dragOrder = function( method ) {
    
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    }else if ( typeof method === 'object' ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.dragOrder' );
    }    

  };
  
  /*
   * builds our dragOrder group - wraps each element within the given container
   * with a .dragContainer that is in charge of handling our dragging. Applies 
   * the drag catching event mousedown on our drag Containers, firing the catchDrag
   * function should a mousedown occur. If a pre-order exists, the dragContainers
   * are ordered appropriately to match their historical order state. Finaly apply
   * our orientation class, moveStyles, and fire callback if desired.
   */
  function build( container, settings )
  {   
      $(container).children().each(function(){
          var w = $(this).outerWidth(),
              h = $(this).outerHeight(),
              margins = { l:$(this).css("marginLeft"), r:$(this).css("marginRight"), t:$(this).css("marginTop"), b:$(this).css("marginBottom") };
          $(this).wrap("<div class='dragContainer' style='width:"+w+"px; height:"+h+"px; margin-left:"+margins.l+"; margin-right:"+margins.r+"; margin-top:"+margins.t+"; margin-bottom:"+margins.b+";' />");
      });
     
      $(container).children(".dragContainer").each(function(){
          if( ! settings.vertical )$(this).addClass("horizontal");
          $(this).on("mousedown.dragOrder",function(e){ if(e.which == 1){ e.preventDefault(); catchDrag(this,settings, e.pageY, e.pageX ); } });
          this.setAttribute("data-order-index", $(this).index() );
      });
      
      if( settings.loadSyncOrder != false ) reorder( container, settings.loadSyncOrder, settings.delimiter );
                  
      if( settings.vertical )$(container).addClass("vertical");
      
      $(container).find( settings.moveStyles ).addClass("moveStyles");
      
      if( typeof settings.callback == "function" && settings.callbackOnInitialize ) settings.callback.call( this, order( container, settings.callbackOrderType, settings.delimiter ) );
  }
  
  
  
  /*
   * checks if the given order array is a valid order, meaning it has a 1 to 1 
   * mapping with the container elements to be used in dragOrder. If it is not,
   * an in order array mapping to the container elements is returned [1,2, 3, ..., n]
   */
  function valid_order( order, container )
  {
      var actuals = $(container).children(),
          reset = false,
          reset_array = [];
  
      if( actuals.length != order.length )reset = true;
      else
      {
          for( var i=0; i< actuals.length; i++ )
          {
              reset_array.push(i);
              if( ! ( i in order ) ) reset = true; // check values are real, every i must exist
              if( order[i] < 0 || order[i] >= actuals.length ) reset = true; // check keys are real, all i must be in valid range, since we already know they can't be duplicate
          }
      }
      
      if( reset ) return reset_array;
      return order;
  }
  
  /*
   * 
   */
  function reorder( container, order, delimiter )
  {
      if( typeof order == "function" ) order = order.call(); 
      if( typeof order == "string" && typeof delimiter == "string" ) order = order.split( delimiter );
      if( typeof order != "array" && typeof order != "object" )throw "Can only reorder elements using an array. Please provide an array of the desired order.";
      
      order = valid_order( order, container );
      
      var old_elements = $(container).children(),
          new_elements = [];
          
      for( var i=0; i<old_elements.length; i++ ) new_elements[i] = old_elements[ order[i] ];
      
      $( old_elements ).detach();
      
      $( container ).append( new_elements );
  }
  
  /*
   * returns order of elements marked from their original order. if delimiteredString
   * is passed the function will return a string separated with the given character(s),
   * otherwise, the function returns an array. The key marks the current index, the value
   * marks the original index.
   */
  function order( container, orderType, delimiter )
  {
      var order = [];
      
      $(".dragContainer", container ).each(function(){
          order.push( this.getAttribute('data-order-index') );
      });
      
      if( orderType != "string" )return order;
      else return order.join( delimiter );
  }

  /*
   * event function in charge of checking for drag initiators. When a mousedown
   * event is fired on one of our dragContainers, this function is called, which
   * then monitors the mousemove event, looking to see if the mouse is dragged 
   * beyond the settings.catchThreshhold. If it is, the monitoring event is halted,
   * and the dragging function is called to take over. If a mouseup occurs before
   * the catchThreshhold has been breeched, the mousemove monitor is halted, and
   * everything returns to normal.
   */
  function catchDrag( element, settings, y, x )
  {
      $(window).on("mousemove.dragOrder_catch", function(e){
            if( Math.abs( e.pageY - y ) > settings.catchThreshold || Math.abs( e.pageX - x ) > settings.catchThreshold ){
                $(window).off("mousemove.dragOrder_catch").off("mouseup.dragOrder_catch");
                dragging( element,settings, e.pageY, e.pageX );
            }
      })
      .on("mouseup.dragOrder_catch", function(e){
            $(window).off("mousemove.dragOrder_catch").off("mouseup.dragOrder_catch");
      });
  }


  /*
   * Our main function that handles dragging - triggered from catchDrag. First the
   * moving dragContainer is cloned, and given appropriate styles/classes for moving.
   * Next an array of hotzones are created, which act as triggering points left and
   * right of each dragContainer. Mousemoves check against these hotzones when dragging
   * with a floating clone of the moving element, and on mouseup, the clone is removed
   * and the moving element is moved to it's new location.
   * 
   */
  function dragging( element, settings, y, x )
  {
      var newElement = $(element).clone(true).appendTo("body").addClass("moving").css("position","absolute").append("<div class='moveIndex'></div>"),
            newElementCenterOffset = { y: y - $(element).offset().top, x: x - $(element).offset().left },
            hotzones = [],
            newPos = -1,
            oldPos = $(element).index(),
            siblings = $(element).siblings(".dragContainer"),
            container = $(element).parent();

        $(element).addClass("moved");

        if(settings.vertical)
        {
            siblings.each(function(){
                var thisPos = $(this).index(),
                    thisOffset = $(this).offset(),
                    thisMargin = { 
                        top: parseFloat( $(this).children().css("marginTop") ),
                        bottom: parseFloat( $(this).children().css("marginBottom") ) },
                    littleExtra = thisMargin.top > thisMargin.bottom ? thisMargin.top/2 : thisMargin.bottom/2; // extra hotzone as midpoint between 2 collapsed margins

                if( thisPos > oldPos )thisPos--;

                hotzones.push({
                    x: thisOffset.left,
                    y: thisOffset.top - littleExtra,
                    x2: thisOffset.left + ( $(this).width() ),
                    y2: thisOffset.top + ( $(this).height() / 2 ),
                    newPos: thisPos,
                    replacing: thisPos
                });
                hotzones.push({
                    x: thisOffset.left,
                    y: thisOffset.top + ( $(this).height() / 2 ),
                    x2: thisOffset.left + $(this).width(),
                    y2: thisOffset.top + $(this).height() + littleExtra,
                    newPos: thisPos+1,
                    replacing: thisPos
                });
            });
        }
        else
        {
            siblings.each(function(){
                var thisPos = $(this).index(),
                    thisOffset = $(this).offset(),
                    thisMargin = {
                        left: parseFloat( $(this).children().css("marginLeft") ),
                        right: parseFloat( $(this).children().css("marginRight") )
                    },
                    littleExtra = thisMargin.left > thisMargin.right ? thisMargin.left/2 : thisMargin.right/2;
                    
                if( thisPos > oldPos )thisPos--;
                
                hotzones.push({
                    x:thisOffset.left - littleExtra,
                    y:thisOffset.top,
                    x2:thisOffset.left + ( $(this).width() / 2 ),
                    y2:thisOffset.top + $(this).height(),
                    newPos:thisPos,
                    replacing: thisPos
                });
                hotzones.push({
                    x:thisOffset.left + ( $(this).width() / 2 ),
                    y:thisOffset.top,
                    x2:thisOffset.left + $(this).width() + littleExtra,
                    y2:thisOffset.top + $(this).height(),
                    newPos:thisPos+1,
                    replacing: thisPos
                });
            });
        }

        $(window).on("mousemove.dragOrder", function(e){
            $(newElement).css({ "top":e.pageY-newElementCenterOffset.y, "left":e.pageX-newElementCenterOffset.x });
            var hot = false,
                updateDisplay = newPos >= 0 ? newPos +1 : "-";

            $(newElement).data("index",newPos).children(".moveIndex").html(updateDisplay);

            for(var i=0; i<hotzones.length; i++)
            {
                if( e.pageX >= hotzones[i].x && e.pageX <= hotzones[i].x2 && e.pageY >= hotzones[i].y && e.pageY <= hotzones[i].y2 )
                {
                    hot = true;
                    var replacing = hotzones[i].replacing;

                    newPos = hotzones[i].newPos;
                    siblings.removeClass("sidleBack sidleForward");

                    if( replacing == newPos )siblings.eq(replacing).addClass("sidleForward");
                    else siblings.eq(replacing).addClass("sidleBack");
                }
            }

            if( ! hot )
            {
                newPos = -1;
                siblings.removeClass("sidleBack sidleForward");
            }

        }).on("mouseup.dragOrder", function(e){
            $(window).off("mousemove.dragOrder").off("mouseup.dragOrder");
            siblings.removeClass("sidleBack sidleForward");
            $(newElement).removeClass("moving").css({ "top":"","left":"","position":"relative" }).children(".moveIndex").remove();

            var preceeding = siblings.eq(newPos-1),
                noAction = false;

            if( newPos > 0 )$(newElement).insertAfter(preceeding);
            else if( newPos == 0 ) $(newElement).prependTo(container);
            else {
                noAction = true;
                $(newElement).remove();
                $(element).removeClass("moved");
            }

            if( ! noAction )$(element).remove();

            if( typeof settings.callback == "function" ) settings.callback.call( this, order( container, settings.callbackOrderType, settings.delimiter ) );
        });
  }

})( $ );