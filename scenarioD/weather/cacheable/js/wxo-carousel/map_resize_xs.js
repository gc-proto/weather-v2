/**
 * map_resize.js
 * Adjust the coordinates in the map element to match the image when it is smaller than its original size.
 * Works only with shape='poly'
 */
$(function(){
  var baseWidth = 590,
      baseCoords = [], // The original coordinates from when the map was its original size
      lastResize; // Whether or not to adjust the coordinates

  // Use wet events for load and resize. Resize is used for then a tablet is turned or window is resized.
  // This confirms that elements created by plugins (ie. tabs) are loaded
  $(document).on('wb-ready.wb win-rsz-width.wb', function(e){
    $('map area').each(function(){
      var thisMap = $(this);
      var coordsCopy = thisMap.attr('data-orig-coords');
      if(typeof(coordsCopy) == typeof(undefined)|| coordsCopy === false){
        thisMap.attr('data-orig-coords', thisMap.attr('coords'));
      }

    });
    if(e.type === 'wb-ready') lastResize = 0; //force resize at start

    $('img[usemap].wxo-active').each(function(){
      var thisImg = $(this);
      baseWidth = parseInt(thisImg[0].naturalWidth); // Original image size
      var currentWidth = thisImg.width(),
        ratio = parseFloat((currentWidth / baseWidth).toFixed(4)); // How big the current image is compared to the original size. ie. 0.8457 or 84.57% of the original size.

      // Only adjust coords if necessary (page load, map is small, or going from small -> normal map size
      if(currentWidth !== baseWidth && lastResize !== currentWidth){
        $(thisImg.attr('usemap')).children().each(function(){
          var thisArea = $(this);

          if(e.type === 'wb-ready' || e.type ==='win-rsz-width'){
            var coords = thisArea.attr('data-orig-coords').split(',');
            var coordsOutput = '';
            for(var i = 0; i < coords.length; i++){
              coordsOutput += parseInt(coords[i] * ratio) + ",";
            }
            thisArea.attr('coords', coordsOutput);
          }

        });

        lastResize = currentWidth;
      }
    });
  });
});