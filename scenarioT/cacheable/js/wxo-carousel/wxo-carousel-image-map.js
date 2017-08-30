 //Handle image map funtionality for wxo-carousel
"use strict";

$(document).ready(function(){
    //WXO Carousel Image Map Module V 0.1 Feb 26/2015
    //Reid Miller


    //Shared jQuery selectors
    var canvasDiv = $('#wxo-carousel');
    var canvas = $('#wxo-canvas')[0];


    //Tooltip specfic selectors 
    var tipCanvas = $("<canvas class='tip'/>")[0];
    canvasDiv.append(tipCanvas);
    var tipContext = tipCanvas.getContext('2d');
    





    //Image map support
    //Link user on click, if image map location has URL
    $('#wxo-canvas').on('click', function(e){
        var region = pointInMapRegion(getCanvasCoords(e));
        if (region.href){
            window.location.href = region.href;
        }
    });

    //Restore default cursor when leaving canvas
    $('#wxo-canvas').mouseleave( function(e) {
        $('#wxo-canvas').css('cursor', 'default');
    });

    //Change cursor over image map loctions with URL's
    $('#wxo-canvas').mousemove(function(e){
        var region = pointInMapRegion(getCanvasCoords(e));
        if(region.href){
            state.lastMouse = getRawCoords(e);
            $('#wxo-canvas').css('cursor', 'pointer');
            if(state.lastMouseOverRegion != region.href){
                clearHover();
            }
            state.lastMouseOverRegion = region.href;

            if(state.mouseOverTimeout === null){
                state.mouseOverTimeout = setTimeout(function(){
                    if(state.mouseOverRegion = region.href){
                        drawHoverTitle(region.title);
                    } 
                }, 400);
            }
        } else {
            $('#wxo-canvas').css('cursor', 'default');
            clearHover();
            state.lastMouseOverRegion = null;
        }
    });

    function drawHoverTitle(title){
        tipCanvas.style.left = canvas.offsetLeft + state.lastMouse.x + 'px';
        tipCanvas.style.top = canvas.offsetTop + state.lastMouse.y - 24 + 'px'; //bump by 24 to push above pointer
        tipContext.font = "12pt calibri";
        tipCanvas.width = parseInt(tipContext.measureText(title).width) + 6;
        tipCanvas.height = 20;
        tipContext.beginPath();
        tipContext.textBaseline = 'top';
        tipContext.fillText(title, 8, 4);
        tipContext.fill();
        tipCanvas.style.visibility = 'visible';

    }

    function clearHover(){
        if(state.mouseOverTimeout != null){
            //console.log('clearin it!');
            tipCanvas.style.visibility = 'hidden';
            clearTimeout(state.mouseOverTimeout);
            state.mouseOverTimeout = null;
        }
    }


    //Adapted from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    //Only supports shape="poly"
    //Returns associated URL if it exists, false otherwise.
    //Uses data-orig-coords attribute, currently populated by map_resize_xs.js
    function pointInMapRegion(mouseCoords){
        var href = false;
        var title = false;
        var mapAreas = $('#wxo-carousel-map area');
        mapAreas.each(function (index) {
            var shape = mapAreas[index].attributes['shape'].value;
            if (shape != 'poly') { return false; }
            var coords = mapAreas[index].attributes['data-orig-coords'].value.split(','); //set by map_resize_xs.js
            var i, j;
            var coordsArr = new Array()
            for(i = 0; i< coords.length; i+=2){ //Arrange image map into 2-tuples
                coordsArr.push({ x: parseInt(coords[i]), y: parseInt(coords[i+1])});
            }

            var check = 0;
            for (i = 0, j = coordsArr.length - 1; ++i < coordsArr.length; j = i){
                ((coordsArr[i].y <= mouseCoords.y && mouseCoords.y < coordsArr[j].y) || (coordsArr[j].y <= mouseCoords.y && mouseCoords.y < coordsArr[i].y))
                    && (mouseCoords.x < (coordsArr[j].x - coordsArr[i].x) * (mouseCoords.y - coordsArr[i].y) / (coordsArr[j].y - coordsArr[i].y) + coordsArr[i].x)
                    && (check = !check);
            }
            if(check) {
                href = mapAreas[index].attributes['href'].value;
                title = mapAreas[index].attributes['title'].value;
                return false; //exits .each(), does not return from function.
            }
        });

        return {
            href: href,
            title: title
        };
    }

    //Retrieves coordinates of mouse click relative to where the click would occur if the image was not resized
    //Used to evaluate if clicks are within image map boundaries
    function getCanvasCoords(e){
        var raw_coords = getRawCoords(e);

        var factor = state.images[state.curImgNum].width / canvas.width;
        var coords = {
            x : Math.round(raw_coords.x*factor),
            y : Math.round(raw_coords.y*factor)
        }

        return coords
    }

    //Retrieves the raw pixel coordinates of a mouse click
    function getRawCoords(e){
    	var mousePos = canvas.getBoundingClientRect();
    	var coords = {
    		x : e.clientX - mousePos.left,
    		y : e.clientY - mousePos.top
    	}

    	return coords;
    }

});