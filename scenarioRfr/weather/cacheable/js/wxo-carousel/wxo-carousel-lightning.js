"use strict";

var state = {};

$(document).ready(function(){
    //WXO Carousel V 0.6.3-xs Mar 18/2015
    //Reid Miller

    //Reset speed controls
    $('.wxo-anim-faster').prop('disabled', false);
    $('.wxo-anim-slower').prop('disabled', false);

    //Key elements
    var animator = $('#wxo-animator');
    var progress = $('.wxo-progress');
    var progress_text = $('.wxo-progress-text');
    var progress_text_end = $('.wxo-progress-text-end');
    var progress_time = $('.wxo-progress-time');


    //Canvas variables + loading message
    var canvasDiv = $('#wxo-carousel');
    var canvas = $('#wxo-canvas')[0];
    var context = canvas.getContext('2d');
    var carouselIE8 = $('#wxo-carousel-ie8');

    var ie8Timer = 1000 / 60; //constant for emulating getAnimFrame in lte IE8


    $('.wxo-anim-first').prop('disabled', false);
    $('.wxo-anim-prev').prop('disabled', false);
    $('.wxo-anim-next').prop('disabled', false);
    $('.wxo-anim-last').prop('disabled', false);
    $('.wxo-anim-play').prop('disabled', false);

    //Initiate state variables
    //Interval/play related variables
    state.speed = {
        initInterval : 2700,
        maxInterval : 9000,
        minInterval : 199,
        increaseDelta : 300,
        decreaseDelta : 300,
        lastFrameDelay : function(){
          if(state.interval === state.speed.minInterval){
            return 500;
          }else{
            return state.interval;
          }
        }
    };


    //If a setSpeed function is loaded by an external JS, load those settings
    if(typeof setSpeed !== 'undefined' && $.isFunction(setSpeed)){
        state.speed = setSpeed();
    }

    state.interval = state.speed.initInterval;
    state.intervalChange = 0;

    state.runningIE8 = 0; //track interval id while running, 0 otherwise
    state.running = 0; //Boolean tracking running progress for canvas
    state.lastUpdate = 0; //Stores time that last frame was drawn


    state.dirForward = true; //Animation direction
    state.totalImgNum  = parseInt(animator.attr('data-image-count'));
    state.curImgNum  =  parseInt(animator.attr('data-image-current'));

    //Time limit variables, controlled by #wxo-anim-from-time, #wxo-anim-to-time
    state.lowerLimit = 0;
    state.upperLimit = state.totalImgNum - 1;
    state.firstLoad = 1;

    state.overflowTime = 0; //true if animating between last and first image
    state.allImagesLoaded = null; //null = first load, false means we're in the middle of loading, and true means we've loaded
    state.imageSrcs = [];
    state.lastImageSrcDownloaded = null;
    state.mouseOverTimeout = null; //Used to detect if the mouse is held still over the canvas, emulating a browsers native image map handling
    state.lastMouseOverRegion = null; //Store region HREF that user last held mouse over
    state.lastMouse = {
        x : 0,
        y : 0
    };
    
    //Initilization routine
    if(state.totalImgNum == 0){
        $('#wxo-carousel-error').removeClass('hidden');
        $('.wxo-ie8-hide').addClass('hidden');
        $('.wxo-ie8-show').addClass('hidden');
        return;
    }

    state.canvasMode = $('.wxo-ie8-hide').is(':visible');

    state.imagesLoaded = false; //Count progress of loading images
    state.images = new Array();

    //Create image objects, load and display first image
    for (var i = 0; i < state.totalImgNum; i++){
        state.images.push(new Image());
        if(i==state.curImgNum){
            loadDisplayImage(i);
        }
        //load every IE8 image 
        if(!state.canvasMode){
            loadIE8FirstImage(i);
        }
    }

    //Attach resize listener to canvas only (IE8 handly by responsive-img class)
    if(state.canvasMode) {
        window.addEventListener('resize', resizeCanvas, false);
        resizeCanvas();
    } 

    $('#wxo-carousel-ie8 img').each(function(){
        $(this).attr('usemap', '#wxo-carousel-map');
    });

    //Functions
    function resizeCanvas() {
        var imageW = state.images[state.curImgNum].width;
        var imageH = state.images[state.curImgNum].height;
        //if (canvasDiv.width() >= imageW  || $('#wxo-carousel-ie8').width() >= imageW){
        if ($('div.wrapper').width() >= imageW){
            $('#wxo-carousel-ie8').addClass('wxo-ie8-show');
            $('#wxo-carousel').removeClass('hidden')
            canvas.width = imageW;
            canvas.height = imageH;
        } else {

            $('#wxo-carousel-ie8').removeClass('wxo-ie8-show');
            $('#wxo-carousel').addClass('hidden');
            canvas.width = canvasDiv.width();
            canvas.height = (imageH / imageW)*canvasDiv.width();
        }
        wxoDrawImage();
    }

    function loadIE8FirstImage(toImgNum){
        if($('img#wxo-anim-img-'+toImgNum).length === 0){
            var img = $('<img>');
            img.attr('id', 'wxo-anim-img-' + toImgNum);
            img.attr('class', 'hidden img-responsive center-block');
            img.attr('src', animator.attr('data-wxo-anim-' + toImgNum));
            img.attr('alt', 'Image.');
            carouselIE8.append(img);
        }
    }
    function loadIE8Image(toImgNum){
        if($('img#wxo-anim-img-'+toImgNum).length === 0){
            var img = $('<img>');
            img.attr('id', 'wxo-anim-img-' + toImgNum);
            img.attr('class', 'hidden img-responsive center-block');
            img.attr('src', state.imageSrcs[toImgNum]);
            img.attr('alt', 'Image.');
            carouselIE8.append(img);
        }
        else
        {
            $('img#wxo-anim-img-'+toImgNum).attr('src', state.imageSrcs[toImgNum]);
        }
    }

    //Draw curring image to screen.
    function wxoDrawImage(){
        if(state.firstLoad){
            //don't reveal controls
            //$(".wxo-nojs-hide").removeClass('hidden'); //TODO make optional for error handling (no images available)

            $(".wxo-loading-msg").remove();

            state.firstLoad = 0;
        }
        //if(state.canvasMode) {
            drawCanvasImage();
        //} else {
            drawIE8Image();
        //}
    }

    //Draw image to HTML5 canvas
    function drawCanvasImage(){
        try {
            context.drawImage($(state.images[state.curImgNum])[0], 0, 0, canvas.width, canvas.height);
        } catch (e) {
            throw(e);
        }
        setProgress(state.curImgNum, 0);
    }

    //Force browser to load image into cache.
    function loadFirstImage(imgNum){
        if(state.canvasMode){
            if(state.images[imgNum].src == ''){
                state.images[imgNum].src = animator.attr('data-wxo-anim-' + imgNum);
            }
        }
    }
    
    function loadImage(imgNum){
        if(state.canvasMode){
            //if(state.images[imgNum].src == ''){
                state.images[imgNum].src = state.imageSrcs[imgNum];
            //}
        }
    }

    //Jennifer-testing removing things
    
    //Force browser to load image into cache, then draw it.
    //The first image is loaded directly into DOM by PHP as a performance improvement.
    //Most browsers will cache the image, even though it is hidden
    //A listener is added incase the image hasn't been loaded by browser, or is still loading.
    function loadDisplayImage(imgNum){
        $(state.images[imgNum]).on('load', function(){
            wxoDrawImage(1);
        });
        //If image is .complete, and has a src, it is ready for display.
        if(state.images[imgNum].complete && state.images[imgNum].src != ''){
            wxoDrawImage(1);
        }
        loadFirstImage(imgNum); //If image wasn't
        //TEST: do we need this?
        //loadIE8FirstImage(imgNum);
    }

    //Update progress meters
    function setProgress(toImgNum){
        progress.attr('value', toImgNum);
        progress_text.text(toImgNum + 1 - state.lowerLimit);
        progress_time.text( animator.attr('data-wxo-label-' + toImgNum) );
        progress_text_end.text(state.upperLimit - state.lowerLimit + 1);
        progress.trigger("wb-update.wb-progress");
    }

    //Change which image is displayed for IE8
    function drawIE8Image(){
        var targetImg = $('img#wxo-anim-img-' + state.curImgNum);
        var lastTargetImg = $('img.wxo-active');
        if(lastTargetImg.attr('src') == targetImg.attr('src')){
            return;
        }
        targetImg.addClass('wxo-active');
        targetImg.removeClass('hidden');
        lastTargetImg.addClass('hidden');
        lastTargetImg.removeClass('wxo-active');
        setProgress(state.curImgNum);
    }

    //Get next image number
    function nextNum(){
        var retNum = 0;
        if(state.curImgNum == state.totalImgNum-1){
            retNum = 0;
        } else if(state.curImgNum != state.totalImgNum-1) {
            retNum = state.curImgNum+1;
        }

        if (retNum > state.upperLimit){
            retNum = state.lowerLimit;
        } else if (retNum < state.lowerLimit){
            retNum = state.lowerLimit;
        }

        return retNum;
    }

    //Update state next image and draw
    function nextImg(){
        state.curImgNum = nextNum();
        wxoDrawImage();
    }

    //Get previous image number
    function prevNum(){
        var retNum = 0;
        if(state.curImgNum == 0){
            retNum = state.totalImgNum-1;
        } else if( state.curImgNum != 0) {
            retNum = state.curImgNum-1;
        }

        if (retNum < state.lowerLimit){
            retNum = state.upperLimit;

        } else if(retNum > state.upperLimit ){
            retNum = state.upperLimit;

        }
        return retNum;
    }

    //Update state to previous image and draw
    function prevImg(){
        state.curImgNum = prevNum();
        wxoDrawImage();
    }

    //Main loop for IE8 mode, replaced by requestAnimationFrameShim for canvas mode
    function animateImg(){
        if(state.dirForward){
            nextImg();
        } else {
            prevImg();
        }
        if (state.intervalChange != 0){
            state.interval = nextInterval();

            state.intervalChange = 0;
            clearInterval(state.runningIE8);
            state.runningIE8 = setInterval(animateImg, state.interval);

        }
    }

    //Crossbrowser requestAnimationFrame
    //https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
    var requestAnimationFrameShim = (function(){
        return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(animate_main){
            window.setTimeout(animate_main, ie8Timer);
        };

    })();

    //Determine if the next animation should have a pause preceding it (at the end of the loop)
    function isNextFrameLast(){
        if(state.dirForward){
            if(nextNum()  == state.lowerLimit){
                return true;
            }
        } else {
            if(prevNum() == state.upperLimit){
                return true;
            }
        }
        return false;
    }


    //Handle animation action for canvas.
    //Paramater forceUpdate forces image to update even if interval is not reached (when user clicks play).
    function animate_main(forceUpdate){
        forceUpdate = forceUpdate || false;
        if (state.intervalChange != 0){ //adjust interval according to user inputs
            state.interval = nextInterval();
            state.intervalChange = 0;
        }
        var now = Date.now();
        var delta = (now-state.lastUpdate);
        var delayValue = function(){
          if(isNextFrameLast()){
            return state.speed.lastFrameDelay();
          }else{
            return state.interval;
          }
        };

        if (delta >= delayValue() || forceUpdate === true){ //If number of ms since last update >= interval, update image
            if(state.dirForward){
                nextImg();
            } else {
                prevImg();
            }
            state.lastUpdate = now;
        }

        if(state.running){
            requestAnimationFrameShim(animate_main);
        }

        //Before next animation, check to see if a delay should be added at end of animation loop
        /*if(isNextFrameLast() === true) {
            state.overflowTime = state.speed.lastFrameDelay();
        } else {
            state.overflowTime = 0;
        }*/
    }


    //Stops active animator.
    function wxostop(){
        $('.wxo-anim-first').prop('disabled', false);
        $('.wxo-anim-prev').prop('disabled', false);
        $('.wxo-anim-next').prop('disabled', false);
        $('.wxo-anim-last').prop('disabled', false);
        $('.wxo-anim-play').prop('disabled', false);
        // $('.wxo-anim-dir-forward').prop('disabled', false);
        // $('.wxo-anim-dir-back').prop('disabled', false);
        // $('.wxo-anim-from-time').prop('disabled', false);
        // $('.wxo-anim-to-time').prop('disabled', false);
        if(state.runningIE8){
            clearInterval(state.runningIE8);
            state.runningIE8 = 0;
        }
        state.running = false;
    }

    //Begins animation
    function wxoplay(){
        if(!state.runningIE8 && !state.running){
            $('.wxo-anim-first').prop('disabled', true);
            $('.wxo-anim-prev').prop('disabled', true);
            $('.wxo-anim-next').prop('disabled', true);
            $('.wxo-anim-last').prop('disabled', true);
            $('.wxo-anim-play').prop('disabled', true);
            // $('.wxo-anim-dir-forward').prop('disabled', true);
            // $('.wxo-anim-dir-back').prop('disabled', true);
            // $('.wxo-anim-from-time').prop('disabled', true);
            // $('.wxo-anim-to-time').prop('disabled', true);
            if(!state.canvasMode){
                animateImg(1);
                if(state.runningIE8 === 0) state.runningIE8 = setInterval(animateImg, state.interval);
            } else {
                state.running = true;
                animate_main(true);
                state.lastUpdate = Date.now();
            }
        }
    }
    
    function loadOnDemand(func)
    {
        if(state.allImagesLoaded == null)
        {
           state.allImagesLoaded = false;
          $.when(
               $.ajax({
                   type: 'GET',
                   url: 'https://gc-proto.github.io/weather/scenarioT/weather/lightning/include/xhr.php',
                    data: {id: animator.attr('data-image-lightning-id')}
               })).done(function(content) {
                   //state.imageSrcs = $.parseJSON(content)['imageSrc'];
              state.imageSrcs =["../data/lightning_images/lightning_1.png","../data/lightning_images/lightning_2.png","../data/lightning_images/lightning_3.png","../data/lightning_images/lightning_4.png","../data/lightning_images/lightning_5.png","../data/lightning_images/lightning_6.png","../data/lightning_images/lightning_7.png"];

           
                   for (var i = 0; i < state.totalImgNum; i++){ //load both in -xs
                       loadImage(i);
                      // loadIE8Image(i);
                   }
                    loadOnDemand(func);
                   state.lastImageSrcDownloaded = new Date();
            });
        }
        else if(state.allImagesLoaded == false)
        {
            var loadCount = 0;
            for (var imgNum = 0; imgNum < state.totalImgNum; imgNum++){
                if(state.images[imgNum].complete && state.images[imgNum].src != ''){
                    loadCount++;
                }
            }
            if(loadCount == state.totalImgNum) {
                state.allImagesLoaded = true;
                func();
            } else {
                setTimeout(function() { loadOnDemand(func); }, 150);
            }
        }
        else
        {
            if(new Date() - state.lastImageSrcDownloaded > 1000 * 60 * 2)
            {
                state.allImagesLoaded = null;
                loadOnDemand(func);
            }
            else
            {
                func();
            }
        }
    }

    //Control listeners
    $('.wxo-anim-play').click(function(e){
        loadOnDemand(wxoplay);
    }).mouseenter(function(e) {
        loadOnDemand(wxoDrawImage);
    });

    $('.wxo-anim-stop').click(function(e){
        wxostop();
    }).mouseenter(function(e) {
        loadOnDemand(wxoDrawImage);
    });

    $('.wxo-anim-next').click(function(e){
        loadOnDemand(nextImg);
    }).mouseenter(function(e) {
        loadOnDemand(wxoDrawImage);
    });

    $('.wxo-anim-last').click(function(e){
        state.curImgNum = state.upperLimit;
        loadOnDemand(wxoDrawImage);
    }).mouseenter(function(e) {
        loadOnDemand(wxoDrawImage);
    });

    $('.wxo-anim-prev').click(function(e){
        loadOnDemand(prevImg);
    }).mouseenter(function(e) {
        loadOnDemand(wxoDrawImage);
    });

    $('.wxo-anim-first').click(function(e){
        state.curImgNum = state.lowerLimit;
        loadOnDemand(wxoDrawImage);
    }).mouseenter(function(e) {
        loadOnDemand(wxoDrawImage);
    });

    $('.wxo-anim-dir-forward').click(function(e){
        state.dirForward = true;
        $('.wxo-anim-dir-back').removeClass('active');
        $('.wxo-anim-dir-forward').addClass('active');
    });

    $('.wxo-anim-dir-back').click(function(e){
        state.dirForward = false;
        $('.wxo-anim-dir-back').addClass('active');
        $('.wxo-anim-dir-forward').removeClass('active');
    });

    $('.wxo-anim-faster').click(function(e){
        state.intervalChange -= state.speed.increaseDelta;
        if(nextInterval() <= state.speed.minInterval){
            $('.wxo-anim-faster').prop('disabled', true);
        } else {
            $('.wxo-anim-faster').prop('disabled', false);
        }
        $('.wxo-anim-slower').prop('disabled', false);
    });

    $('.wxo-anim-slower').click(function(e){
        state.intervalChange += state.speed.decreaseDelta;
        if(nextInterval() >= state.speed.maxInterval){
            $('.wxo-anim-slower').prop('disabled', true);
        } else {
            $('.wxo-anim-slower').prop('disabled', false);
        }
        $('.wxo-anim-faster').prop('disabled', false);
    });

    $('.wxo-anim-speed-reset').click(function(e){
        state.intervalChange = -1*(state.interval - state.speed.initInterval);
        $('.wxo-anim-faster').prop('disabled', false);
        $('.wxo-anim-slower').prop('disabled', false);
    });

    $('.wxo-anim-from-time').change(function(e){
        state.lowerLimit = parseInt($('.wxo-anim-from-time').find(':selected').val());
        if(state.lowerLimit > state.upperLimit){
            state.upperLimit = state.lowerLimit;
            $('.wxo-anim-to-time').val(state.lowerLimit);
        }
        if (state.curImgNum < state.lowerLimit){
            state.curImgNum = state.lowerLimit;
        } else {
            state.curImgNum = state.lowerLimit;
        }
        if($('.wxo-anim-to-time').val() == $('.wxo-anim-from-time').val()){
            disableButtons(true);
        } else {
            disableButtons(false);
            wxostop();
        }
        wxoDrawImage();
    });

    $('.wxo-anim-to-time').change(function(e){
        state.upperLimit = parseInt($('.wxo-anim-to-time').find(':selected').val());
        if(state.upperLimit < state.lowerLimit){
            state.lowerLimit = state.upperLimit;
            $('.wxo-anim-from-time').val(state.upperLimit);
        }

        if (state.curImgNum > state.upperLimit){
            state.curImgNum = state.upperLimit;
        }
        if($('.wxo-anim-to-time').val() == $('.wxo-anim-from-time').val()){
            disableButtons(true);
        } else {
            disableButtons(false);
            wxostop();
        }
        wxoDrawImage();
    });



    //Guarantee image is displayed once the page (including initial image) is loaded.
    $(window).load(function(){
        if(state.canvasMode) {
            resizeCanvas();
            revealControls();
        } else {
            $(".wxo-nojs-hide").removeClass('hidden'); //reveal IE8 controls
        }
        wxoDrawImage();
    });

    function revealControls(){
        //Reset to/from values to default, FF maintains settings when refreshed.
        //Mantis item #3237
        $("#wxo-anim-from-time").prop('selectedIndex', state.curImgNum); 
        $("#wxo-anim-to-time").prop('selectedIndex', state.totalImgNum-1);
        $("#wxo-anim-dir-forward").prop('checked', 'checked')
        $("#wxo-anim-dir-forward").addClass('active');
        $("#wxo-anim-dir-backard").removeClass('active');
        $(".wxo-nojs-hide").removeClass('hidden');
        if(state.totalImgNum == 1){
            disableButtons(true);
        } else {
            disableButtons(false);
        }
    }

    //For mantis #3388. Animation buttons disabled when single image available/selected
    function disableButtons(state){

        $('.wxo-anim-first').prop('disabled', state);
        $('.wxo-anim-prev').prop('disabled', state);
        $('.wxo-anim-next').prop('disabled', state);
        $('.wxo-anim-last').prop('disabled', state);
        $('.wxo-anim-play').prop('disabled', state);
        $('.wxo-anim-stop').prop('disabled', state);
        $('.wxo-anim-speed-reset').prop('disabled', state);
        $('.wxo-anim-slower').prop('disabled', state);
        $('.wxo-anim-faster').prop('disabled', state);
        $('.wxo-anim-dir-forward').prop('disabled', state);
        $('.wxo-anim-dir-back').prop('disabled', state);
    }
    

    //Calculate next interval time based on user input (which is stored in state.intervalChange by listeners)
    function nextInterval(){
        var interval0 = state.interval;
        interval0 +=state.intervalChange;
        if(interval0 > state.speed.maxInterval){
            interval0 = state.speed.maxInterval;

        } else if(interval0 < state.speed.minInterval){
            interval0 = state.speed.minInterval;
        }

        return interval0;
    }

});
