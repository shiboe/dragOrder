/*
 * jQuery Drag Order - https://github.com/shiboe/dragOrder
 * 
 * A simple script for implementing a dragable ordering interface.
 * 
 * Developed by [Stephen Cave](sccave@gmail.com) Copyright 2012.
 * [Licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0)](http://http://creativecommons.org/licenses/by-nc-sa/3.0/)
 * 
 */

(function( $ ){

  var methods = {
     init : function( options ) {
         
        var settings = $.extend( {
            "updown":true,
            "catchThreshold": 3
        }, options);

       return this.each(function(){

           build( this, settings );

           var data = $(this).data("dragOrder");
           if( !data ){
               
               $(this).data('dragOrder',{
                   settings: settings
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
  
  function build( container, settings )
  {
      $(container).children().each(function(){
          var w = $(this).outerWidth(),
              h = $(this).outerHeight();
          $(this).wrap("<div class='dragContainer' style='width:"+w+"px; height:"+h+"px;' />")
                 .css({ "position":"relative" });
      });

      $(container).children(".dragContainer").on("mousedown.dragOrder",function(e){ if(e.which == 1){ e.preventDefault(); catchDrag(this,settings, e.pageY, e.pageX); } });

      console.log("dragorder built");
  }

  function catchDrag( element, settings, y, x )
  {
      jQuery(window).on("mousemove.dragOrder_catch", function(e){
            if( Math.abs( e.pageY - y ) > settings.catchThreshold || Math.abs( e.pageX - x ) > settings.catchThreshold ){
                jQuery(window).off("mousemove.dragOrder_catch").off("mouseup.dragOrder_catch");
                dragging(element,settings, e.pageY, e.pageX);
            }
      })
      .on("mouseup.dragOrder_catch", function(e){
            jQuery(window).off("mousemove.dragOrder_catch").off("mouseup.dragOrder_catch");
      });
  }

  function dragging( element, settings, y, x )
  {
      var newElement = jQuery(element).clone(true).appendTo("body").addClass("moving").css("position","absolute").append("<div class='moveIndex'></div>"),
            newElementCenterOffset = { y: y - jQuery(element).offset().top, x: x - jQuery(element).offset().left },
            hotzones = [],
            newPos = -1,
            oldPos = jQuery(element).index(),
            siblings = jQuery(element).siblings(".dragContainer"),
            parent = jQuery(element).parent();

        jQuery(element).addClass("moved");

        if(settings.updown)
        {
            siblings.each(function(){
                var thisPos = jQuery(this).index(),
                    thisOffset = jQuery(this).offset(),
                    thisMargin = { 
                        top: parseFloat( jQuery(this).children().css("marginTop") ),
                        bottom: parseFloat( jQuery(this).children().css("marginBottom") ) },
                    littleExtra = thisMargin.top > thisMargin.bottom ? thisMargin.top/2 : thisMargin.bottom/2; // extra hotzone as midpoint between 2 collapsed margins

                if( thisPos > oldPos )thisPos--;

                hotzones.push({
                    x: thisOffset.left,
                    y: thisOffset.top - littleExtra,
                    x2: thisOffset.left + ( jQuery(this).width() ),
                    y2: thisOffset.top + ( jQuery(this).height() / 2 ),
                    newPos: thisPos,
                    replacing: thisPos
                });
                hotzones.push({
                    x: thisOffset.left,
                    y: thisOffset.top + ( jQuery(this).height() / 2 ),
                    x2: thisOffset.left + jQuery(this).width(),
                    y2: thisOffset.top + jQuery(this).height() + littleExtra,
                    newPos: thisPos+1,
                    replacing: thisPos
                });
            });
        }
        else
        {
            siblings.each(function(){
                hotzones.push({
                    x:jQuery(this).offset().left - settings.hotzoneExtend,
                    y:jQuery(this).offset().top,
                    x2:jQuery(this).offset().left + ( jQuery(this).width() / 2 ),
                    y2:jQuery(this).offset().top + jQuery(this).height(),
                    newPos:jQuery(this).index()
                });
                hotzones.push({
                    x:jQuery(this).offset().left + ( jQuery(this).width() / 2 ),
                    y:jQuery(this).offset().top,
                    x2:jQuery(this).offset().left + jQuery(this).width() + settings.hotzoneExtend,
                    y2:jQuery(this).offset().top + jQuery(this).height(),
                    newPos:jQuery(this).index()+1
                });
            });
        }

        jQuery(window).on("mousemove.dragOrder", function(e){
            jQuery(newElement).css({ "top":e.pageY-newElementCenterOffset.y, "left":e.pageX-newElementCenterOffset.x });
            var hot = false,
                updateDisplay = newPos >= 0 ? newPos +1 : "-";

            jQuery(newElement).data("index",newPos).children(".moveIndex").html(updateDisplay);

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
            jQuery(window).off("mousemove.dragOrder").off("mouseup.dragOrder");
            siblings.removeClass("sidleBack sidleForward");
            jQuery(newElement).removeClass("moving").css({ "top":"auto","left":"auto","position":"relative" }).children(".moveIndex").remove();

            var preceeding = siblings.eq(newPos-1),
                noAction = false;

            if( newPos > 0 )jQuery(newElement).insertAfter(preceeding);
            else if( newPos == 0 ) jQuery(newElement).prependTo(parent);
            else {
                noAction = true;
                jQuery(newElement).remove();
                jQuery(element).removeClass("moved");
            }

            if( ! noAction )jQuery(element).remove();
            
        });
  }

})( jQuery );