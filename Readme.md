
# 	jQuery.dragOrder
### A simple script for implementing a dragable ordering interface
![example image](https://shiboe.com/media/images/dragOrder.png)

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
        $('#photos').dragOrder({ callbackStringDelimiter:'#', callback: function(o){ alert(o); } });

        /* with loading a sync order */
        $('#photos').dragOrder({  loadSyncOrder: function(){ return document.getElementById('input#order').value; } });

        /* a complex call */
        $('#photos').dragOrder({
            delimiter: '/',
            loadSyncOrder: "0/2/3/1",
            callback: function( ord ){ alert( "First value is now '"+ord[0]+"'" },
            callbackOrderType: "array",
            callbackOnInitialize: true
        });

##      Options
Any of the following may be passed as an object parameter to the dragOrder call:
<ul>
<li><b>vertical</b><br><i>true || false (default: false)</i>
<p>Wheither the list of draggable items should be vertical or horizontal. This affects the location of the triggering hotzones, as well as the animation effects, though the later can be customized.</p>

<li><b>catchThreshhold</b><br><i>int (default: 3)</i>
<p>A buffer used to distinguish between an intended drag event, and an errant mouse click or mouse hold. The number of pixels that must be dragged before a true drag event is triggered.</p>

<li><b>moveStyles</b><br><i>jQuery selector (default: .dragContainer)</i> 
<p>A selector that determines what elements should recieve the moving effects given by the style .moveStyles, namely, the box shadow. Helpful if draggable elements consist of many elements, not all of which are in an opaque rectangle.</p>

<li><b>delimiter</b><br><i>string (default: '#')</i>
<p>The delimiter to use when parsing or passing the order as a string. For example, your callback function (if supplied) will receive the order as a string where this delimiter is used as the separator. Similarly, when loading an order with loadSyncOrder, if a string is passed, it is expected to be separated by this delimiter.</p>

<li><b>callback</b><br><i>function (default: false)</i>
<p>When supplied a function, this function will be called any time a re-order occurs, and will be passed the order as a parameter. Use this to make the reordering matter!</p>

<li><b>callbackOrderType</b><br><i>"string" || "array" (default: "string")</i>
<p>The type to send the order as to the callback function. So leaving this as "string" would send the callback "0#1#4#2#3" (assuming the delimiter is left on default, and "array" would send the callback [0,1,4,2,3]</p>

<li><b>callbackOnInitialize</b><br><i>true || false (default: false)</i>
<p>Boolean that determines whether the callback function is additionally called after the initial build of the script.</p>

<li><b>loadSyncOrder</b><br><i>function || string || array (default:false)</i>
<p>To load an order on script build, initializing the elements to an order state (synchronizing). The given order can be as a string (using the delimiter), an array, or a function that return either.</p>
</ul>

## 	License
Developed by [Stephen Cave](sccave@gmail.com) @ [shiboe.com](http://shiboe.com) Copyright 2012. 
[Licensed under the MIT License](http://opensource.org/licenses/mit-license.php)

##	TODO
1.      unit test!
2.      add reset and destroy functionality
3.      verify interoperability with multiple dragOrders
4.	rebuild for html 5 implementations where available

## 	History
### 1.4.0
*       added several options for usability
*       refined callback and presync functions for order usage
*       combined delimiters to single option

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
