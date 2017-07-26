$(function(){
  // Display animation controls and JS powered overlays when JS enabled.

  $('#animator-controller > div:nth-child(1)').removeClass('hidden-sm hidden-md hidden-lg');
  $('#animator-controller > div:nth-child(2)').removeClass('hidden-xs hidden-sm hidden-md hidden-lg');
  $('#animation-overlays').removeClass('hidden-md hidden-lg hidden-sm');
  $('.no-js-hide').removeClass('hidden-xs');
  $('.no-js-city-hide').removeClass('hidden');
  $('html').css('overflow-x', 'hidden');
  $('img.wxo-radar-img-nojs').removeClass('hidden-xs');
  $('img.wxo-radar-img-nojs').removeClass('wxo-radar-img-nojs');
  $('img.overlay-img-nojs').removeClass('overlay-img-nojs');
  $('div.animation-frame-nat-nojs').removeClass('animation-frame-nat-nojs');
  $('.js-hide').addClass('hidden');
  $('img.overlay-img-tog').addClass('overlay-img');
  
});
