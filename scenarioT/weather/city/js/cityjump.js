$(document).ready(function(){
	//Set elements to variables for better performance / don't traverse the DOM more than you have to
	var cityLabel = $('label[for=city]');
	var city = $('#city');
	var all = $('#city, #jump');
	var cityJump = $('#cityjump');
	var jumpMsg = $('#jumpmsg');
	var lang = $('input[name=lang]');
	var jump = $('#jump');
	//Hide necessary elements
//	all.hide();
	jump.addClass("btn btn-default btn-sm mrgn-rght-sm");
	//Add styling to label on hover
	/*cityLabel.hover(function(){
		cityLabel.css({
			'text-decoration':'underline',
			'cursor':'pointer'
		});
	}, function(){
		cityLabel.css({
			'text-decoration':'none',
			'cursor':'default'
		});
	});*/
	
	//Show form when label is clicked
	cityLabel.click(function(){
		all.show();
		$('#wxo-divider').addClass("wb-invisible");
		cityLabel.addClass("wb-invisible");
		cityJump.addClass("mrgn-bttm-lg");
		cityLabel.hide();
		city.focus();
		return false;
	});
	//For keyboard
	cityLabel.keypress(function(){
		all.show();
		cityLabel.addClass("wb-invisible");
		cityLabel.hide();
		city.focus();
		return false;
	});
	
	//If nothing is entered, block the submit and display a message
	//Not needed: uses HTML5 attribute
	/*cityJump.submit(function(e){
		if(city.val().length == 0){
			if(lang.val() == 'e') {
				jumpMsg.empty().append('<p>Location not found</p>');
			}else{
				jumpMsg.empty().append('<p>Ville non-trouv&eacute;e</p>');
			}
			e.preventDefault();
			city.select();
		}
	});*/
});
