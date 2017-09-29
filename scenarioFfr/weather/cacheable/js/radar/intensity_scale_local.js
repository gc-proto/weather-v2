

/* function for standard activation */
function activateStandard() {
	$('.overlay-img').each(function(){
		imgAnimation = $(this).attr('src');
		imgAnim = imgAnimation.replace("radar/layers_detailed/", "radar/layers/");
		$(this).attr('src', imgAnim);
	});
	
	imgAnimation = $('#animation-image').attr('src');
	imgAnim = imgAnimation.replace("radar/detailed/temp_image/", "radar/temp_image/");
	$('#animation-image').attr('src', imgAnim);

	origSrc = $('#composite-cities-image').attr('src');
	if (typeof origSrc !== 'undefined') {
		newSrc = origSrc.replace("/layers_detailed/", "/layers/");
		$('#composite-cities-image').attr('src', newSrc);	
	}
	
}
/* function for detailed activation */
function activateDetailed() {
	$('.overlay-img').each(function(){
		imgAnimation = $(this).attr('src');
		imgAnim = imgAnimation.replace("radar/layers/", "radar/layers_detailed/");
		$(this).attr('src', imgAnim);
	});
	
	imgAnimation = $('#animation-image').attr('src');
	imgAnim = imgAnimation.replace("radar/temp_image/", "radar/detailed/temp_image/");
	$('#animation-image').attr('src', imgAnim);

	origSrc = $('#composite-cities-image').attr('src');
	if (typeof origSrc !== 'undefined') {
		newSrc = origSrc.replace("/layers/", "/layers_detailed/");
		$('#composite-cities-image').attr('src', newSrc);	
	}

}


	/* if standard intensity scale radio button is clicked */
	$('input#intensity-standard').click(function(){
		$('input#intensity-standard-mob').prop('checked', true);
		intensityCookie(0);
		activateStandard();
	});
	
	
	/* if detailed intensity scale radio button is clicked */
	$('input#intensity-detailed').click(function(){
		$('input#intensity-detailed-mob').prop('checked', true);
		intensityCookie(1);
		activateDetailed();
	});
