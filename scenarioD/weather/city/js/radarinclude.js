//only run the event handler for collapsible widgets with the "data-url" attribute
$(document).delegate('.ui-collapsible[data-url] > .ui-collapsible-heading', 'click', function () {

    //cache the collapsible content area for later use
    var $this = $(this).siblings('.ui-collapsible-content');
    
    //check if this widget has been initialized yet
    if (typeof $this.data('state') === 'undefined') {
        
        //initialize this widget
        
        //update icon to gear to show loading (best icon in the set...)
        $this.siblings('.ui-collapsible-heading').find('.ui-icon').removeClass('ui-icon-plus').addClass('ui-icon-gear')
        
        //create AJAX request for data, in this case I'm using JSONP for cross-domain abilities
        $.ajax({
            
            //use the URL specified as a data-attribute on the widget
            url           : $this.closest('.ui-collapsible').data('url'),
            type          : 'get',
            dataType      : 'jsonp',
            success       : function (response) {
            
                //get the height of the new content so we can animate it into view later
                var $testEle   = $('<div style="position:absolute;left:-9999px;">' + response.copy + '</div>');
                $('body').append($testEle);
                var calcHeight = $testEle.height();
        
                //remove the test element
                $testEle.remove();
            
                //get data to store for this widget, also set state
                $this.data({
                    state         : 'expanded',
                    height        : calcHeight,
                    paddingTop    : 10,
                    paddingBottom : 10
                    
                //add the new content to the widget and update it's css to get ready for being animated into view
                }).html('<p>' + response.copy + '</p>').css({
                    height        : 0,
                    opacity       : 0,
                    paddingTop    : 0,
                    paddingBottom : 0,
                    overflow      : 'hidden',
                    display       : 'block'
                
                //now animate the new content into view
                }).animate({
                    height        : calcHeight,
                    opacity       : 1,
                    paddingTop    : $this.data('paddingTop'),
                    paddingBottom : $this.data('paddingBottom')
                }, 500);
                
                //re-update icon to minus
                $this.siblings('.ui-collapsible-heading').find('.ui-icon').addClass('ui-icon-minus').removeClass('ui-icon-gear')
            },
                    
            //don't forget to handle errors, in this case I'm just outputting the textual message that jQuery outputs for AJAX errors
            error         : function (a, b, c) { console.log(b); }
        });
    } else {
        
        //the widget has already been initialized, so now decide whether to open or close it
        if ($this.data('state') === 'expanded') {
        
            //update state and animate out of view
            $this.data('state', 'collapsed').animate({
                height        : 0,
                opacity       : 0,
                paddingTop    : 0,
                paddingBottom : 0
            }, 500);
        } else {
            
            //update state and animate into view
            $this.data('state', 'expanded').animate({
                height        : $this.data('height'),
                opacity       : 1,
                paddingTop    : $this.data('paddingTop'),
                paddingBottom : $this.data('paddingBottom')
            }, 500);
        }
    }
            
    //always return false to handle opening/closing the widget by ourselves
    return false;
});
