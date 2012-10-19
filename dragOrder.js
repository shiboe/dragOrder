/* dragOrder
 * A simple script for implementing a dragable sort interface
 *
 *  @author Stephen Cave
 *  @email sccave@gmail.com
 *
 */

jQuery(document).ready(function(){

    var updown = false,
        hotpointExtension = 20;

    function dragging( element )
    {
        var newElement = jQuery(element).clone().appendTo("body").addClass("moving"),
            offsetY = jQuery(newElement).height() / 2,
            offsetX = jQuery(newElement).width() / 2,
            hotpoints = [],
            newPos = -1,
            siblings = jQuery(element).siblings(),
            parent = jQuery(element).parent();

        jQuery(element).addClass("moved");

        if(updown)
        {
            siblings.each(function(){
                hotpoints.push({
                    x:jQuery(this).offset().left,
                    y:jQuery(this).offset().top - hotpointExtension,
                    x2:jQuery(this).offset().left + ( jQuery(this).width() ),
                    y2:jQuery(this).offset().top + ( jQuery(this).height() / 2 ),
                    newPos:jQuery(this).index()
                });
                hotpoints.push({
                    x:jQuery(this).offset().left,
                    y:jQuery(this).offset().top + ( jQuery(this).height() / 2 ),
                    x2:jQuery(this).offset().left + jQuery(this).width(),
                    y2:jQuery(this).offset().top + jQuery(this).height() + hotpointExtension,
                    newPos:jQuery(this).index()+1
                });
            });
        }
        else
        {
            siblings.each(function(){
                hotpoints.push({
                    x:jQuery(this).offset().left - hotpointExtension,
                    y:jQuery(this).offset().top,
                    x2:jQuery(this).offset().left + ( jQuery(this).width() / 2 ),
                    y2:jQuery(this).offset().top + jQuery(this).height(),
                    newPos:jQuery(this).index()
                });
                hotpoints.push({
                    x:jQuery(this).offset().left + ( jQuery(this).width() / 2 ),
                    y:jQuery(this).offset().top,
                    x2:jQuery(this).offset().left + jQuery(this).width() + hotpointExtension,
                    y2:jQuery(this).offset().top + jQuery(this).height(),
                    newPos:jQuery(this).index()+1
                });
            });
        }

        jQuery(window).on("mousemove.dragOrder", function(e){
            jQuery(newElement).css({ "top":e.pageY-offsetY, "left":e.pageX-offsetX });

            for(var i=0; i<hotpoints.length; i++)
            {
                if( e.pageX >= hotpoints[i].x && e.pageX <= hotpoints[i].x2 && e.pageY >= hotpoints[i].y && e.pageY <= hotpoints[i].y2 )
                {
                    newPos = hotpoints[i].newPos;
                    jQuery(newElement).data("index",newPos+1);
                    siblings.removeClass("sidleBack sidleForward").eq(newPos).addClass("sidleForward");
                    if(newPos > 0)siblings.eq(newPos-1).addClass("sidleBack");
                    return;
                }
            }
        }).on("mouseup.dragOrder", function(e){
            jQuery(window).off("mousemove.dragOrder").off("mouseup.dragOrder");
            jQuery(newElement).removeClass("moving").css({ "top":"auto","left":"auto" });

            var preceeding = siblings.eq(newPos-1);

            if( newPos > 0 )jQuery(newElement).insertAfter(preceeding);
            else jQuery(newElement).prependTo(parent);
            
            jQuery(element).remove();
            jQuery(newElement).on("mousedown.dragOrder",function(e){ if(e.which == 1){ e.preventDefault(); dragging(this); } });
            siblings.removeClass("sidleBack sidleForward");
        });
    }

    jQuery(".categoryListItem").on("mousedown.dragOrder",function(e){ if(e.which == 1){ e.preventDefault(); dragging(this); } });
});