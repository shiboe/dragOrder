
# 	jQuery.dragOrder
### A simple script for implementing a dragable ordering interface

## 	Philosophy
To provide a simplistic script for implementing draggable sorting on a list of items. 
This should should probably be expanded to utilize html 5 draggability when available. 

## 	Features
*	draggability on a set of elements
*       re-ordering of elements through dragging
*       callback functionality for order parsing

##      Usage

        <div id='photos'>
            <img class='photo' />
            <img class='photo' />
            <img class='photo' />
        </div>

        /* basic call */
        $('#photos').dragOrder();

        /* with options */
        $('#photos').dragOrder({ vertical:true });

        /* with callback */
        $('#photos').dragOrder( function( new_order ){ console.log( new_order ); } );

        /* with options and callback */
        $('#photos').dragOrder({ callbackStringDelimiter:'#' }, function(o){ alert(o); });

##      Options
Any of the following may be passed as an object parameter to the dragOrder call:
*       **vertical**
        *true || false (default: false)*
        Wheither the list of draggable items should be vertical or horizontal. This affects the location of the triggering hotzones, as well as the animation effects, though the later can be customized.
*       **catchThreshhold**
        *int (default: 3)*
        A buffer used to distinguish between an intended drag event, and an errant mouse click or mouse hold. The number of pixels that must be dragged before a true drag event is triggered.
*       **moveStyles**
        *jQuery selector (default: .dragContainer)*
        A selector that determines what elements should recieve the moving effects given by the style .moveStyles, namely, the box shadow. Helpful if draggable elements consist of many elements, not all of which are in an opaque rectangle.
*       **callbackStringDelimiter**
        *string (default: false)*
        When given as a string, the output parameter to the callback function is given as a string (rather than the default array) where the orders are joined by the given string as a separator. So passing '#' would yield '0#1#3#2' to the callback function.

## 	License
Developed by [Stephen Cave](sccave@gmail.com) Copyright 2012.
[Licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0)](http://http://creativecommons.org/licenses/by-nc-sa/3.0/)

##	TODO
1.	rebuild for html 5 implementations where available
2.      verify interoperability with multiple dragOrders

## 	History
### 1.3.0
*       recoded to work both vertically and horizontally
*       added callback functionality
*       re-joined and tweaked styles, adding moveStyle
### 1.2.0
*       Conversion to jQuery plugin
*       Minor issue fixes, tweaks
### 1.1.1
* 	versioning start to github
* 	no known bugs with current build
