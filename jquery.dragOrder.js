/*
 * $ Drag Order - https://github.com/shiboe/dragOrder
 * 
 * A simple script for implementing a dragable ordering interface.
 * 
 * $(element).dragOrder({options});
 * 
 * Developed by [Stephen Cave](sccave@gmail.com) Copyright 2012.
 * [Licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0)](http://http://creativecommons.org/licenses/by-nc-sa/3.0/)
 * 
 */

(function( $ ){

  var methods = {
     init : function( options, callback ) {
         
        var settings = $.extend( {
            "vertical":false, // wheither the items are listed vertically, false is for horizontal orientation
            "catchThreshold": 3, // to prevent clicks triggering a move, drag must hold over this many pixels
            "moveStyles": ".dragContainer", // the element(s) within the container to apply the moving styles to, defaults to the dragContainer
            "callbackStringDelimiter": false // sets the parameter for the callback to a delimitered string, with the given value as a separator. false returns an array
        }, options);

       return this.each(function(){

           build( this, settings, callback );

           var data = $(this).data("dragOrder");
           if( !data ){
               
               $(this).data('dragOrder',{
                   'settings': settings,
                   'callback': callback
               });
           }
       });

     },
     destroy : function( ) {

       return this.each(function(){
           
       });
     }
  };

  $.fn.dragOrder = function( method ) {
    
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    }else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.dragOrder' );
    }    

  };
  
  /*
   * builds our dragOrder group - wraps each element within the given container
   * with a .dragContainer that is in charge of handling our dragging. Applies 
   * the drag catching event mousedown on our drag Containers, firing the catchDrag
   * function should a mousedown occur. Applies our move styles to the settings element.
   */
  function build( container, settings, callback )
  {   
      $(container).children().each(function(){
          var w = $(this).outerWidth(),
              h = $(this).outerHeight(),
              margins = { l:$(this).css("marginLeft"), r:$(this).css("marginRight"), t:$(this).css("marginTop"), b:$(this).css("marginBottom") };
          $(this).wrap("<div class='dragContainer' style='width:"+w+"px; height:"+h+"px; margin-left:"+margins.l+"; margin-right:"+margins.r+"; margin-top:"+margins.t+"; margin-bottom:"+margins.b+";' />");
      });

      $(container).children(".dragContainer").each(function(){
          if( ! settings.vertical )$(this).addClass("horizontal");
          $(this).on("mousedown.dragOrder",function(e){ if(e.which == 1){ e.preventDefault(); catchDrag(this,settings, e.pageY, e.pageX, callback ); } });
          this.setAttribute("data-order-index", $(this).index() );
      });
                  
      if( settings.vertical )$(container).addClass("vertical");
      
      $(container).find( settings.moveStyles ).addClass("moveStyles");
      
      if( typeof callback == "function" ) callback.call( this, order( container, settings.callbackStringDelimiter ) );
  }
  
  /*
   * returns order of elements marked from their original order. if delimiteredString
   * is passed the function will return a string separated with the given character(s),
   * otherwise, the function returns an array. The key marks the current index, the value
   * marks the original index.
   */
  function order( container, delimiteredString )
  {
      var order = [];
      
      $(".dragContainer", container ).each(function(){
          order.push( this.getAttribute('data-order-index') );
      });
      
      if( typeof delimiteredString == "undefined" || delimiteredString === false )return order;
      else return order.join( delimiteredString );
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
  function catchDrag( element, settings, y, x, callback )
  {
      $(window).on("mousemove.dragOrder_catch", function(e){
            if( Math.abs( e.pageY - y ) > settings.catchThreshold || Math.abs( e.pageX - x ) > settings.catchThreshold ){
                $(window).off("mousemove.dragOrder_catch").off("mouseup.dragOrder_catch");
                dragging( element,settings, e.pageY, e.pageX, callback );
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
  function dragging( element, settings, y, x, callback )
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

            if( typeof callback == "function" ) callback.call( this, order( container, settings.callbackStringDelimiter ) );
        });
  }

})( $ );