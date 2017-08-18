/* Animation Info Object {{{*/



 
Info = new Class();
Info.prototype = {
	constructor: function(element,text,options) {/*{{{*/
		this.info = $$(element);
		if (!this.info) throw Error;
		if (!isString(text)) options = text;
		this.options = {};
		this.options = Merge(this.options,options);
		if (isString(text)) this.setText(text);
	},/*}}}*/
	fakestuff: function() { 
		var fake=0;
	},
	setWidth: function(width) {/*{{{*/
		this.info.style.width = parseInt(width) + "px";
	},/*}}}*/
	hide: function() {/*{{{*/
		this.visible = false;
		this.info.style.visibility = "hidden";
		this.info.style.display = "none";
	},/*}}}*/
	show: function() {/*{{{*/
		this.visible = true;
		this.info.style.visibility = "visible";
		this.info.style.display = "block";
	},/*}}}*/
	testVisibility: function() {/*{{{*/
		if (!this.visible || (getStyle(this.info,'display') == 'none')) {
			this.visible = true;
			this.info.style.display = "block";
			this.info.style.visibility = "visible";
		}
	},/*}}}*/
	addText: function(str) {/*{{{*/
		this.testVisibility();
		this.info.innerHTML += str; 
	},/*}}}*/
	setText: function(str) {/*{{{*/
		this.testVisibility();  
/*HERE loading text into top strip and hiding checkboxes*/ this.info.innerHTML = str;
	}/*}}}*/
};/*}}}*/

/* Animation Frame Object {{{*/
Frame = new Class();
Frame.prototype = {
	constructor: function(element,imageWrapper,image,options) {/*{{{*/
		this.pages = {};
		this.pageCount = 0;
		this.overlays = {};
		this.overlayCount = 0;
		this.lastWidth = -1;
		this.frame = $$(element);
		this.image = $$(image);
		if (!this.image) {
			this.image = document.createElement('img');
			this.frame.appendChild(this.image);
		}
		if ($$(imageWrapper)) {
			this.wrapper = $$(imageWrapper);
		} else {
			this.wrapper = document.createElement('div');
			this.wrapper.id = imageWrapper;
			this.wrapper.appendChild(this.image);
			this.frame.appendChild(this.wrapper);
		}
		var pages = childNodes(this.wrapper);
		for (var i = 0; i < pages.length; ++i)
			if (pages[i].getAttribute('page_id'))
				this.pages[pages[i].getAttribute('page_id')] = pages[i];
		this.hideOverlays();
		this.options = {};
		this.options = Merge(this.options,options);
		// skipthis.absolutize(this.image);
		// toggleCityOverlay(true);   ADD maybe
		//addCityOverlay(); //based on checkbox initial state maybe?

	},/*}}}*/
	hide: function() {/*{{{*/
		this.frame.style.display = "none";
	},/*}}}*/
	hidePages: function() {/*{{{*/
		for (var page in this.pages) {
			this.pages[page].style.display = 'none';
		}
	},/*}}}*/
	hideImage: function() {/*{{{*/
		this.image.style.display = 'none';
		this.hideOverlays();
		this.hidden = true;
	},/*}}}*/
	hideOverlays: function() {/*{{{*/
		for (var overlay in this.overlays) {
			this.overlays[overlay].style.display = 'none';
		}
		this.overlaysHidden = true;
	},/*}}}*/
	show: function() {/*{{{*/
		this.frame.style.display = '';
	},/*}}}*/
	showImage: function() {/*{{{*/
		this.image.style.display = '';
		//this.showOverlays();
		for (var overlay in this.overlays) {
			this.overlays[overlay].style.display = '';
		}
		this.overlaysHidden = false;
		this.hidden = false;
	},/*}}}*/
	showPages: function() {/*{{{*/
		for (var i = 0; i < this.pages.length; ++i) {
			this.pages[i].style.display = '';
		}
	},/*}}}*/
	showOverlays: function() {/*{{{*/
		for (var overlay in this.overlays) {
			this.overlays[overlay].style.display = '';
		}
		this.overlaysHidden = false;
	},/*}}}*/
	absolutize: function(el) {/*{{{*/
		el.style.cssFloat = "left";
		el.style.position = "absolute";
		el.style.left = "0";
	},/*}}}*/
	setImage: function(el) {/*{{{*/
		if (this.hidden) this.showImage();

		if (!el.src){
			this.image.src = el;
		} else { 

			if (document.getElementById('intensity-detailed')) {
				if (document.getElementById('intensity-detailed').checked){
					this.image.src = el.src_detailed;
					activateDetailed();
				} else {
					activateStandard();
					if(typeof(el.src_standard) !== "undefined"){
						this.image.src = el.src_standard;
					} else {
						this.image.src = el.src;
					}
				}
			} else { this.image.src = el.src; }
		}

		//} this.image.src = el.src;
		//this.restoreHeight();
		//if(this.lastWidth != $(window).width()){
		//	this.lastWidth = $(window).width();

		//}
	},/*}}}*/
	pageExists: function(id) {/*{{{*/
		if (this.pages[id]) return true;
		var children = childNodes(this.wrapper);
		for (var i = 0; i < children.length; ++i) {
			if (children[i].getAttribute('page_id') == id) return true;
		}
	},/*}}}*/
	getPage: function(id) {/*{{{*/
		if (this.pages[id]) return this.pages[id];
		var children = childNodes(this.wrapper);
		for (var i = 0; i < children.length; ++i) {
			if (children[i].getAttribute('page_id') == id) return children[i];
		}
	},/*}}}*/
	addPage: function(el,id) {/*{{{*/
		if (!this.pageExists(id)) {
			var page = el;
			if (isString(el)) {
				page = document.createElement('div');
				page.innerHTML = el;

			}
			page.className = "error";
			serviceErrorTrigger();
			page.setAttribute('page_id',id);
			//page.append("Stardard error message from js.");
			this.pages[id] = page;
			this.wrapper.appendChild(page);
			this.pageCount++;
		} else {
			this.wrapper.removeChild(this.getPage(id));
			if (this.pages[id]) delete this.pages[id];
			this.addPage(el,id);
		}
		this.removeHeight();
	},/*}}}*/
	removePage: function(id) {/*{{{*/
		if (this.pageExists(id)) {
			this.wrapper.removeChild(this.getPage(id));
			this.pageCount--;
		}
	},/*}}}*/
	setHeight: function(height) {/*{{{*/
		if (this.closed) return;
		this.height = height;
		this.frame.style.height = parseInt(height) + "px";
		if (navigator.userAgent.match(/msie [56]/i))
			this.frame.style.height = (parseInt(height) + 12) + "px";
	},/*}}}*/
	restoreHeight: function() {/*{{{*/
		this.setHeight(this.height);
	},/*}}}*/
	removeHeight: function() {/*{{{*/
		this.frame.style.height = "";
	},/*}}}*/
	setWidth: function(width) {/*{{{*/
		if (this.closed) return;
		this.frame.style.width = parseInt(width) + "px";
		if (navigator.userAgent.match(/msie [56]/i))
			this.frame.style.width = (parseInt(width) + 12) + "px";
		
	},/*}}}*/
	addOverlay: function(src,rank,title) {/*{{{*/
		if (this.closed) return;
		if (!this.beenPositioned) {
			this.absolutize(this.image);
			this.beenPositioned = true;
		}
		var el = document.createElement('img');
		el.src = src;
		el.alt = title;
		el.className = 'overlay-img img-responsive';
		//el.className = 'overlay-img';
		el.width = 580;
		el.height= 480;
		//this.absolutize(el);
		el.style.zIndex = (rank || this.overlayCount);
		this.overlays[src] = el;
		if (this.overlaysHidden) this.hideOverlays();
		this.wrapper.appendChild(el);
		this.overlayCount++;
		// if (document.getElementById('intensity-detailed')) {
			// if (document.getElementById('intensity-detailed').checked){
				// activateDetailed();
			// } else {
				// activateStandard();
			// }
		// }
	},/*}}}*/
	removeOverlay: function(src) {/*{{{*/
		//alert(src);
		var srcOrg = src;
		
		if (src.indexOf("/layers_detailed/") > 0) {
			srcOrg = src.replace("radar/layers_detailed/", "radar/layers/");
		} else if (src.indexOf("/radar/layers/") > 0) {
			srcOrg = src.replace("radar/layers/", "radar/layers_detailed/");
		}
		

		if (this.closed) return;

		if (this.overlays[src]) {
			try {
				this.wrapper.removeChild(this.overlays[src]);
			} catch (e) {}
			b=1;
			this.overlayCount--;


		}
		if (this.overlays[srcOrg]) {
			try {
				someres2 = this.wrapper.removeChild(this.overlays[srcOrg]);
			} catch (e) {}
			a=1;
			this.overlayCount--;
		}
		remove_lock = 0;
	}/*}}}*/
};/*}}}*/

/* Animator Object {{{ */
Animator = new Class();
Animator.prototype = {
	/* Constructor: initialises the animator instance, loads options, and gets the default product {{{*/
	constructor: function(region,options) {
		this.infoText = document.getElementById('animation-info');
		this.infoText.innerHTML = _('Downloading...');
		this.region = region;
		this.products = [];
		this.imageArray = [];
		this.counter = 0;
		this.updateInfo = false;
		this.loadTimer = window.setTimeout(function(){
			this.updateProductType(options);
			this.getProduct(this.clean(this.options.products.active));

			this.products = {};
			this.imageArray = new Array();//clear out the array contining the list of already loaded images
			this.counter = 0; //Reset the image counter to 0
		}.bind(this),300000);//Clear the products after 10 mins of inactivity 300000 milliseconds
		/* A rudimentary Linked list for cycling methods {{{*/
		this.cycleMethods = {
			'Loop': 'Backtrack',
			'Backtrack': 'Loop'
		};/*}}}*/
		/* A rudimentary Linked list for directions {{{*/
		this.directions = {
			'Forward': 'Reverse',
			'Reverse': 'Forward'
		};/*}}}*/
		/* Fill the options object with default values {{{*/
		this.options = {
			ajaxUrl: 'xhr.php',
			ids: {/*{{{*/
				animation: 'animation',
				frame: 'animation-frame',
				image: 'animation-image',
				imageWrapper: 'animation-image-wrapper',
				printableImage: 'animation-image-print',
				controller: 'animator-controller',
				customize: 'animator-customize',
				closeCustomize: 'close-customize',
				info: 'animation-info',
				overlays: 'animation-overlays',
				durations: 'animation-duration'
			},/*}}}*/
			overlay: ['480px','480px'],
			image: ['580px','480px'],
			speeds: {/*{{{*/
				start: 9,
				steps: 15,
				min: 2000,
				max: 100,
				method: 'sinusoidal'
			},/*}}}*/
			frameSkip: 1,
			products: {/*{{{*/
				available: ['PRECIPET - Rain','PRECIPET - Snow','CAPPI - Rain','CAPPI - Snow', 'COMPOSITE - Rain', 'COMPOSITE - Snow', 'COMPOSITE - Rain', 'COMPOSITE - Snow'],
				'short': ['precip_rain','precip_snow','cappi_rain','cappi_snow', 'comp_precip_rain', 'comp_precip_snow','comp_cappi_rain', 'comp_cappi_snow'],
				active: 'precip_rain'
			},/*}}}*/
			durations: {/*{{{*/
				available: ['Short (1hr)','Long (3hr)'],
				'short': ['short','long'],
				active: 'short'
			},/*}}}*/
			direction: {/*{{{*/
				value: 'Forward',
				follow: false
			},/*}}}*/
			cycling: {/*{{{*/
				value: 'Loop',
				follow: false
			},/*}}}*/
			connections: {/*{{{*/
				first: {/*{{{*/
					deactivate: ['first-frame-button','previous-frame-button'],
					activate: ['last-frame-button','next-frame-button']
				},/*}}}*/
				next: {/*{{{*/
					activate: ['first-frame-button','previous-frame-button']
				},/*}}}*/
				last: {/*{{{*/
					deactivate: ['last-frame-button','next-frame-button'],
					activate: ['first-frame-button','previous-frame-button']
				},/*}}}*/
				previous: {/*{{{*/
					activate: ['last-frame-button','next-frame-button']
				},/*}}}*/
				slower: {/*{{{*/
					activate: ['speedup-button']
				},/*}}}*/
				faster: {/*{{{*/
					activate: ['slowdown-button']
				},/*}}}*/
				speedreset: {/*{{{*/
					activate: ['slowdown-button','speedup-button']
				},/*}}}*/
				pause: {/*{{{*/
					deactivate: ['pause-button'],
					activate: ['first-frame-button','previous-frame-button','next-frame-button','last-frame-button']
				},/*}}}*/
				play: {/*{{{*/
					deactivate: ['play-button','first-frame-button','previous-frame-button','next-frame-button','last-frame-button'],
					activate: ['pause-button']
				},/*}}}*/
				load: {/*{{{*/
					deactivate: ['play-button','first-frame-button','previous-frame-button','next-frame-button','last-frame-button','pause-button'],
					activate: []
				}/*}}}*/
			}/*}}}*/
		};/*}}}*/
		if (options.settings != 'final') {
			/****************************************************
			  Adding random number to fix IE6 bug with ajax calls
			******************************************************/
			var random = Math.random();
			/* Create the url for the options loading Ajax call {{{*/
			var url = this.options.ajaxUrl + Query({
				action: 'retrieve',
				target: 'options',
				region: this.region,
				lang: EC.lang || 'en-CA',
				format: 'json',
				rand: random
			});/*}}}*/
			var ajax = new XHR(url,{async:false},this.loadOptions,this,options,true);
		} else {
			this.options = Merge(this.options,options);
		}
		this.regionName = this.options.regionName;
		//$$(this.options.ids.animation).style.width = "100%";
		this.frame = new Frame(this.options.ids.frame,this.options.ids.imageWrapper,this.options.ids.image);
		
		// originally included, but now much be set when resized occurs
		//this.frame.setHeight(this.options.image.height);


//		this.frame.removeHeight();
//		this.frame.setWidth(this.options.image.width);

		
		this.info = new Info(this.options.ids.info);
		//this.info.setWidth(this.options.image.width);
		this.loadDurations();
		this.getProduct(this.options.products.active,this.options.display);
//skip		this.getOverlays();
		this.startOverlays();
		var links = document.getElementsByTagName('a');
		var animator = this;
		for (var i = 0; i < links.length; ++i) 
			if (links[i].href.match(/_templatePrint/i))
				links[i].onclick = function() {
					var clean = animator.clean(animator.current);
					var duration = animator.options.durations.active;
					var current = animator.products[clean]['current'][duration];
					try{
						var src = animator.products[clean]['images'][duration][current]['src'].split(/\//).pop();
					} catch(err){}
					var args = this.href.split(/\?/);
					var href = args.shift();
					args = Query(args.join('?').replace(/.?b_templatePrint=true/,''));
					args['display'] = src;
					args['b_templatePrint'] = true;
					args = Query(args,true);
					this.href = href + args;
				};

	},/*}}}*/
	loadDurations: function() {/*{{{*/
		var durationList = $$(this.options.ids.durations);
		var durations = this.options.durations.available;
		if (isSettingOn('duration_short')){
			active = 'short';
		} else {
			active = 'long';
		}
		for (var i = 0; i < durations.length; ++i) {
			o = document.createElement('li');
			o.setAttribute('class', 'duration-li');
			var input;
			if (navigator.userAgent.match(/msie [567]/i)) {
				input = document.createElement('<input name="duration">');
			} else {
				input = document.createElement('input');
				input.setAttribute('name', 'duration');
			}

			input.setAttribute('type','radio');
			input.setAttribute('id',this.options.durations['short'][i]);
			input.setAttribute('value',this.options.durations['short'][i]);
			var duration_label = document.createElement('label');
			duration_label.setAttribute('for', this.options.durations['short'][i]);
			duration_label.setAttribute('class', "wxo-lbl-clr");
			duration_label.innerHTML = _(durations[i]);
			//duration_label.className = duration_label.className + " wxo-lbl-clr";
			o.onmouseover = function(){
				this.durationMouse();
			}.bind(this);
			o.appendChild(input);
			o.appendChild(duration_label);
		   //o.appendChild(document.createTextNode(_(durations[i])));
			durationList.appendChild(o);
			Event.addListener(input,'click',function(event,animator) { animator.callEvent('durationClick',this,true); },this);
			if (this.options.durations['short'][i] == active) {
				input.checked = true;
			}
		}
		if (durations.length == 0) { 
			durationList.parentNode.parentNode.removeChild(durationList.parentNode);
		}
	},/*}}}*/
	startOverlays: function() {/*{{{*/ 
		var mainAnimationImage = document.getElementById(this.options.ids.image); // Get a link thru DOM to the animation image
		mainAnimationImage.onload = this.methodize(this.getOverlays, this, mainAnimationImage);// Assign a method to run when image is loaded. 
		if(mainAnimationImage.offsetWidth != 0 && mainAnimationImage.offsetHeight != 0){   //chrome doesn't run onload on page refresh
			this.getOverlays();
		}
	},/*}}}*/
	showOperationalMessage: function() {/*{{{*/

		this.operationalMessage = document.getElementById('operational');
		if(this.operationalMessage != null){
			this.operationalMessage.style.display = "block";
		}
		var clean = this.clean(this.current);
		//alert(this.products);
		var duration; // = this.options.durations.active;
		if (isSettingOn('duration_short')){
			duration = 'short';
		} else {
			duration = 'long';
		}
		
		if (!this.products[clean]) return;
		
		
		var current = this.products[clean]['current'][duration];
		if (this.products[clean]['images'][duration]) {
		
			var images = [];
			if (!this.products[clean]['images_loaded'][duration]) {
				images = this.products[clean]['images'][duration];
			} else {
				images = this.products[clean]['frames'][duration];
			}
			//console.log(images);
		}
		if (images.length == 0 || images[current] == null) return;
		var str = "";
		if (this.options.displayProduct)
			str += '<span class="product name">' + _(this.products[clean]['name']) + '</span> <span class="frame info">';
		str += images[current]['timestring'];
		str += ', ';
		str += (current+1) + "/" + this.products[clean]['images'][duration].length;
		if (this.options.displayProduct)
			str += '</span>';
		//this.frame.setImage(images[current]);
	
		if ((this.counter) == this.products[clean]['images'][duration].length || (this.counter) == 0)
			this.info.setText(str);
			
			
	

			
		
	},/*}}}*/
	/************************************************************************************
	  The following method is used becuase witout it IE will evaluate a passed function when
	  the onload is fired instead of calling the requierd function.
	  For more on this function you can read http://www.tapper-ware.net, the article about OOP
	  and Event Handlers.
	****************************************************************************************/
	methodize: function(methodize_func,methodize_scope){/*{{{*/ 
		/* Copy the arguments array, which contains all parameters to
			methodize_args, except entries #0 and #1 (methodize_func, methodize_scope) */
		var methodize_args=new Array();
		for(var i=2;i<arguments.length; i++) methodize_args.push(arguments[i]); 
		/*Return a function that takes an event parameter itself
		 and passes it on to methodize_func, along with methodize_args*/
		return (function(evt){methodize_func.call(methodize_scope,evt,methodize_args);});
	},/*}}}*/
	/*************************************************************************************
	*	imageCounter: Used by the onload event of the radar images to keep track of how many
	*					  images are actually load in the browser.
	*					  Utilized to allow for more information to the user (primarily dial up
	*					  users) so they have more information to what is actually happening.
	*
	*	Author:		  Shayne Brioux (14-DEC-06)
	***************************************************************************************/
	imageCounter: function(evt,args) {/*{{{*/
		var el=args[0];
		var clean = this.clean(this.current);//Get the current product ie precip_rain
		var duration = this.options.durations.active;//Get's the active durration short or long
		var callingImage = el.getAttribute('src');//get's the calling elemtents src
		//If the image counter is greater then the amount of images we reset the counter to zero
		
		if (typeof this.products[clean] != 'undefined') {
			if (this.counter > this.products[clean]['images'][duration].length){
				this.counter = 0;
			}
		}
		//Check our array of image src's if it does not exist we add to the array an increment our counter and set the 
		//image info bar to notify the user
		if( this.imageArray.indexOf(callingImage) == -1 ){
			this.imageArray.push(callingImage);
			this.counter ++;
			this.imageInfoText();
		}
   },/*}}}*/
	/*************************************************************************************
	*	animateOnce:  Used basically as an image preloader. Once the play button is selected
	*					  by the user all images are loaded into an invisible iframe to effectively
	*					  place them in the users cache. Once all images have been loaded animation
	*					  will ensue.
	*					 
	*	Author:		  Shayne Brioux 
	*  Creation Date:14-DEC-06
	***************************************************************************************/
	animateOnce: function(){/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		var durations = this.options.durations.available;
		var radio = [];
		this.products[clean]['isPlaying'] = true;
		this.checkConnections("load");
		for(var i = 0; i < durations.length; ++i){
			radio[i] = document.getElementById(this.options.durations['short'][i]);
			//radio[i].setAttribute('disabled','disabled');
		}

		newDiv = document.createElement("div");//Create a new DIV element
		newDiv.setAttribute('id','hidden-Preloaded-Images');//Add an id to the element so that the CSS can affect it
		//newDiv.addClassName('wxo-off-screen');
		newImgArray = [];//Create an array to store the images that will be preloaded into a hidden element, and cache
		//create an img element for every image avail in this durration
		for(i = 0; i < this.products[clean]['images'][duration].length; i++){
			newImgArray[i] = document.createElement("img");//Create the img tag 
			//associate the onload with the required function
			newImgArray[i].onload = this.methodize(this.imageCounter, this, newImgArray[i]);
			newImgArray[i].setAttribute('id','preloadedImage');//Add an id to the tag just incase.. although not required.

			newImgArray[i].src = this.products[clean]['images'][duration][i].src;//Set the source of the img tag to the appropriate image.
			newDiv = '<div id="hidden-Preloaded-Images"><img id="preloadedImage" src="../data/radar/detailed/temp_image//XFT/XFT_PRECIP_RAIN_2017_08_18_14_40.GIF"><img id="preloadedImage" src="../data/radar/detailed/temp_image//XFT/XFT_PRECIP_RAIN_2017_08_18_14_50.GIF"><img id="preloadedImage" src="../data/radar/detailed/temp_image//XFT/XFT_PRECIP_RAIN_2017_08_18_15_00.GIF"><img id="preloadedImage" src="../data/radar/detailed/temp_image//XFT/XFT_PRECIP_RAIN_2017_08_18_15_10.GIF"><img id="preloadedImage" src="../data/radar/detailed/temp_image//XFT/XFT_PRECIP_RAIN_2017_08_18_15_20.GIF"><img id="preloadedImage" src="../data/radar/detailed/temp_image//XFT/XFT_PRECIP_RAIN_2017_08_18_15_30.GIF"><img id="preloadedImage" src=",,/data/radar/detailed/temp_image//XFT/XFT_PRECIP_RAIN_2017_08_18_14_40.GIF"></div>';
			
			//newDiv.appendChild(newImgArray[i]);//append the newly created img tag to the div.
		}
		animationImage = document.getElementById(this.options.ids.imageWrapper);//Get a reference to the image wrapper div
		animationImage.appendChild(newDiv);//append our created div with hidden images to the document.
		//Setup a polling interval to check if all our images are loaded.. when they are start the animation.
		var animateInterval = window.setInterval( function(){
			if(typeof this.products[clean] != 'undefined') {
				//if ((this.counter) == this.products[clean]['images'][duration].length){
				this.checkConnections("play");
				this.animate();
				clearInterval(animateInterval);//Clear the interval
				for(var i = 0; i < durations.length; ++i){
					radio[i] = document.getElementById(this.options.durations['short'][i]);
					if(radio[i].disabled){
						radio[i].disabled = false;
					}
				}
				//}
			}
		}.bind(this),300);
						 
	},/*}}}*/
	imageInfoText: function() {/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		this.info.show();
		this.info.setText(_("Loading... ") + this.counter + _(" of ") + this.products[clean]['images'][duration].length);
   },/*}}}*/
	getOverlays: function() {/*{{{*/

		this.showOperationalMessage();
	
		var mainAnimationImage = document.getElementById(this.options.ids.image);
		mainAnimationImage.onload = "";
		/***********************************************************
		  On an ajax call in order to eliminate issues with IE6 cache
		  i have added a random number to the end of the query string
		*************************************************************/
		/*var random = Math.random(); 
		var url = this.options.ajaxUrl + Query({
			action: 'retrieve',
			target: 'overlays',
			region: this.region,
			lang: EC.lang || 'en-CA',
			format: 'json',
			rand: random
		});
		var ajax = new XHR(url,this.loadOverlays,this,true);*/
	},/*}}}*/
	refreshOverlay: function(el) {/*{{{*/
		var overlay_src='';
		if (document.getElementById('intensity-detailed').checked){
			overlay_src = el.getAttribute("overlay_srcdetailed");
			//overlay_src = el.getAttribute("overlay_src");
		} else {
			overlay_src = el.getAttribute("overlay_srcstandard");
			//overlay_src = el.getAttribute("overlay_src");
		}
		//overlay_src = el.getAttribute("overlay_src");
		if (el.checked) {
			//alert(overlay_src);
			this.frame.addOverlay(overlay_src,el.getAttribute("overlay_rank"), el.getAttribute("overlay_title"));
		} else {
			//alert(overlay_src);
			this.frame.removeOverlay(overlay_src);
		}
	},/*}}}*/
	loadOverlaysNew: function(){

	},
	loadOverlays: function(response,animator) {/*{{{*/
		var overlayList = $$(this.options.ids.overlays);
		if (overlayList) {
			var tbody = document.createElement('tbody');
			overlayList.appendChild(tbody);
			overlayList = tbody;
			var overlays = this.evalJSON(response.responseText);
			var active = getActive();
			var available = overlays['available'];
			var tr_temp;
			/*if (document.getElementById('intensity-detailed').checked){
				
			} else {
				
			}*/
			for (var i = 0; i < available.length; ++i) {
				if (i % 3 == 0) { 
					var tr = document.createElement('tr');
				}
				var left = document.createElement('td');
				left.className = "check";
				var cbx = document.createElement('input');
				cbx.setAttribute('type','checkbox');
				cbx.setAttribute('overlay_rank',available[i]['rank']);
				cbx.setAttribute('overlay_src',available[i]['src']);
				cbx.setAttribute('overlay_srcstandard',available[i]['srcstandard']);
				cbx.setAttribute('overlay_srcdetailed',available[i]['srcdetailed']);
				cbx.setAttribute('overlay_id',available[i]['id']);
				cbx.setAttribute('overlay_title', _(available[i]['title']));
				cbx.setAttribute('class', 'overlay-box');
				cbx.setAttribute('id', available[i]['id']);
				left.appendChild(cbx);
				var right = document.createElement("td");
				var label = document.createElement("label");
				label.setAttribute('for', available[i]['id']);
				label.setAttribute('class', "wxo-lbl-clr");
				label.innerHTML = _(available[i]['title']);
				right.appendChild(label);
				//right.innerHTML = _(available[i]['title']);
				tr.appendChild(left);
				tr.appendChild(right);
				if (i % 3 == 2) {
					overlayList.appendChild(tr_temp);
				} else {
					tr_temp = tr;
				}
				Event.addListener(cbx,'click',function(event,animator) { animator.callEvent('overlayClick',this,true); },this);
				
				if (active.indexOf(available[i]['id']) != -1) {
					cbx.checked = true;
					this.refreshOverlay(cbx);
				}
			} 
			/*for(var overlay in this.frame.overlays){
			}*/
			if (available.length == 0) {
				overlayList.parentNode.parentNode.parentNode.removeChild(overlayList.parentNode.parentNode);
			}
		}
	},/*}}}*/
	/* loadOptions: Load the downloaded options over the default ones, then overload those with any user supplied ones {{{*/
	loadOptions: function(response,animator,options) {
		this.options = Merge(this.options,options);
		this.options = Merge(this.options,this.evalJSON(response.responseText));
	},/*}}}*/
	getProductName: function(productName) {/*{{{*/
		var clean = this.clean(productName);
		for (var i = 0; i < this.options.products['short'].length; ++i)
			if (this.options.products['short'][i].toLowerCase() == clean.toLowerCase())
				return this.options.products.available[i] || productName;
		return null;
	},/*}}}*/
	updateProductType: function(options){/*{{{*/
		var t_url = this.options.ajaxUrl + Query({
			action: 'retrieve',
			target: 'options',
			region: this.region,
			lang: EC.lang || 'en-CA',
			format: 'json',
			rand: Math.random()
		});
		var t_ajax = new XHR(t_url,{async:false}, this.loadOptions,this,options,true);
		this.updateInfo = true;//Force the info bar to update
	},/*}}}*/
	getProduct: function(productName,display,play) {/*{{{*/
		var clean = this.clean(productName);
		var duration = this.options.durations.active;
		if (isSettingOn('duration_short')){
			duration = "short";
		} else{
			duration = "long";
		}
		if (this.options.products['short'].indexOf(this.clean(productName)) != -1) {
			this.current = this.clean(productName);
			var lang = 'en-CA';
			if(typeof(EC['text']['fr-CA']) != 'undefined'){
				lang = 'fr-CA';
			}
			if (typeof this.products[this.clean(productName)] == 'undefined') {
				var random = Math.random();
				var url = this.options.ajaxUrl + Query({/*{{{*/
					action: 'retrieve',
					target: 'images',
					region: this.region,
					product: productName,
					lang: lang,
					format: 'json',
					rand: random
				});/*}}}*/
				//alert('test');
				this.ajaxProduct = new XHR(url,this.loadProduct,this,productName,display,play,true);
			} else {
				this.displayProduct(productName,play);
			}
		} else {
			this.frame.hideImage();
			this.info.hide();
			this.frame.addPage("<h1>" + _("Error") + "</h1><p>" + _("This product does not exist for this region") + "</p>",'error-message');
		}

	},/*}}}*/
	getImages: function(){/*{{{*/
		var random = Math.random();
		var url = this.options. Url + Query({
			action: 'retrieve',
			target: 'images',
			region: this.region,
			product: this.clean(this.current),
			lang: EC.lang || 'en-CA',
			format: 'json',
			rand: random
		});
		var ajaxProduct = new XHR(url,this.loadImages,this,this.clean(this.current),true);
	},/*}}}*/
	loadImages: function(response,animator,product){/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		if (!response.responseText) throw Error;
		this.products[clean]['images'] = this.evalJSON(response.responseText);
		for (var i = 0; i < this.options.durations['short'].length; ++i) {
			var d = this.options.durations['short'][i];
			if (isString(this.products[clean]['images'])) {
				this.products[clean]['errorMessage'][d] = this.products[clean]['images'];
			} else {
				this.products[clean]['current'][d] = 0;
				if (isArray(this.products[clean]['images'][d])) {
					this.products[clean]['current'][d] = this.products[clean]['images'][d].length - 1;
				} else if (isString(this.products[clean]['images'][d])) {
					this.products[clean]['errorMessage'][d] = this.products[clean]['images'][d];
				}
			}
		}
   },/*}}}*/
	loadProduct: function(response,animator,product,display,play) {/*{{{*/
		var clean = this.clean(product);
		var duration;
		if (isSettingOn('duration_short')){
			duration = "short";
		} else{
			duration = "long";
		}
		if (!response.responseText) throw Error;
		if (!this.products[clean]) this.products[clean] = {};
		this.products[clean]['name'] = this.getProductName(clean);
		this.products[clean]['images'] = this.evalJSON(response.responseText);
		this.products[clean]['speed'] = this.options['speeds']['start'];
		this.products[clean]['cycle'] = this.options['cycling']['value'];
		this.products[clean]['direction'] = this.options['direction']['value'];
		this.products[clean]['isPlaying'] = false;
		this.products[clean]['current'] = {};
		this.products[clean]['frames'] = {};
		this.products[clean]['images_loaded'] = {};
		this.products[clean]['errorMessage'] = {};
		// Give each duration a default current index
		for (var i = 0; i < this.options.durations['short'].length; ++i) {
			var d = this.options.durations['short'][i];
			if (isString(this.products[clean]['images'])) {
				this.products[clean]['errorMessage'][d] = this.products[clean]['images'];
			} else {
				this.products[clean]['current'][d] = 0;
				if (isArray(this.products[clean]['images'][d])) {
					this.products[clean]['current'][d] = this.products[clean]['images'][d].length - 1;
				} else if (isString(this.products[clean]['images'][d])) {
					this.products[clean]['errorMessage'][d] = this.products[clean]['images'][d];
				}
			}
		}
		// Set up the current index for the active duration
		if (typeof display != 'undefined') {
			var i = 0, images = isString(this.products[clean]['images']) ? [] : this.products[clean]['images'][duration];
			for (; i < images.length; ++i)
				if (images[i]['src'].match(new RegExp(display + "$")))
					break;
			this.products[clean]['current'][duration] = i;
		}
		if(this.updateInfo || this.products[clean] ){
			this.showOperationalMessage();
			this.updateInfo = false;
		}
		this.displayProduct(clean,play);

	},/*}}}*/
	displayProduct: function(productName,play) {/*{{{*/
		this.setActiveProduct(productName);
		var clean = this.clean(productName);
		var duration = this.options.durations.active;
		if (isSettingOn('duration_short')){
			duration = "short";
		} else{
			duration = "long";
		}
		if (this.products[clean]['errorMessage'][duration]) {
			$$(this.options.ids.controller).style.display = "none";
			this.info.hide();
			this.frame.hideImage();
			this.frame.showPages();
			this.frame.addPage(this.products[clean]['errorMessage'][duration],'error-message');

		} else if (this.products[clean]['images'][duration].length > 0) {
			$$(this.options.ids.controller).style.display = "block";
			this.frame.hidePages(); 
			this.frame.showImage();
			if (play) {
				this.callEvent('play',null,true);
			} else if (this.isPlaying()) {
				this.animate();
				this.checkConnections('play');
			} else {
				this.updateFrame(); 
				this.checkConnections('pause');
			}
		} else {
			$$(this.options.ids.controller).style.display = "none";
			this.info.hide();
			this.frame.hideImage();
			this.frame.showPages();
			//this.frame.addPage("<h1>" + _("No Data") + "</h1><p>" + _("No data available for") + " " + _(this.products[clean]['name']) + "</p>",'error-message');
			//this.frame.addPage("<h1>" + _("No Data") + "</h1><p>" + _(this.regionName || "") + " " + this.region + " - " + _("image not available") + "</p>",'error-message');

			this.frame.addPage("<br>");
		}
		var play_button = document.getElementById('play-button');
		play_button.setAttribute('href','#');
		this.checkButtons();

	},/*}}}*/
	setActiveProduct: function(productName) {/*{{{*/
		this.current = this.clean(productName);
	},/*}}}*/
	checkButtons: function() {/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		var play_button = document.getElementById('play-button');
		var pause_button = document.getElementById('pause-button');
		var ff_button = document.getElementById('first-frame-button');
		var pf_button = document.getElementById('previous-frame-button');
		var nf_button = document.getElementById('next-frame-button');
		var lf_button = document.getElementById('last-frame-button');

		if (!this.products[clean] || !this.products[clean]['images'][duration]) {
			ButtonHelper.deactivate('play-button','pause-button');
			ButtonHelper.deactivate('first-frame-button','previous-frame-button','next-frame-button','last-frame-button');
			ButtonHelper.deactivate('speedup-button','slowdown-button','speed-reset-button');
			return;
		} else {
			ButtonHelper.activate('play-button','pause-button');
			ButtonHelper.activate('first-frame-button','previous-frame-button','next-frame-button','last-frame-button');
			ButtonHelper.activate('speedup-button','slowdown-button','speed-reset-button');
		}
		if (this.isPlaying()) {
			ButtonHelper.deactivate('play-button');
		} else {
			ButtonHelper.deactivate('pause-button');
		}
		if (this.isLastFrame() || this.isPlaying()) {
			nf_button.removeAttribute('href');
			lf_button.removeAttribute('href');
			pf_button.setAttribute('href','#');
			ff_button.setAttribute('href','#');
			ButtonHelper.deactivate('next-frame-button','last-frame-button');
		}
		if (this.isFirstFrame() || this.isPlaying()) {
			ff_button.removeAttribute('href');
			pf_button.removeAttribute('href');
			nf_button.setAttribute('href','#');
			lf_button.setAttribute('href','#');
			ButtonHelper.deactivate('first-frame-button','previous-frame-button');
		}
		if (this.isSlowest()) {
			ButtonHelper.deactivate('slowdown-button');
		}
		if (this.isFastest()) {
			ButtonHelper.deactivate('speedup-button');
		}
		if (this.isFirstFrame() && this.isLastFrame()) {
			ButtonHelper.deactivate('play-button','pause-button');
			ButtonHelper.deactivate('speedup-button','slowdown-button','speed-reset-button');
		}
	},/*}}}*/
	preloadImages: function(product,duration) {/*{{{*/
		var clean = this.clean(product || this.current);
		//var duration = duration || this.options.durations.active;
		var duration;
		if (isSettingOn('duration_short')){
			duration = 'short';
		} else {
			duration = 'long';
		}
		this.products[clean]['frames'][duration] = [];
		for (var i = 0; i < this.products[clean]['images'][duration].length; ++i) {
			this.info.setText(_("Loading... ") + this.products[clean]['images'][duration][i]['timestring']);
			var img = new Image();
			img.src = this.products[clean]['images'][duration][i]['src'];
			this.products[clean]['frames'][duration].push(img);
			
		}
	},/*}}}*/
	updateFrame: function(stringUpdate) {/*{{{*/
		if(typeof stringUpdate == "undefined"){
			stringUpdate = false;
		}   
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		if (!this.products[clean]) throw Error;
		var current = this.products[clean]['current'][duration];
		if (this.products[clean]['images'][duration]) {
			var images = [];
			if (!this.products[clean]['images_loaded'][duration]) 
				images = this.products[clean]['images'][duration];
			else
				images = this.products[clean]['frames'][duration];
			if(stringUpdate == true){ 
				var str = "";
				if (this.options.displayProduct)
					str += '<span class="product name">' + _(this.products[clean]['name']) + '</span> <span class="frame info">';
				str += images[current]['timestring'];
				str += ', ';
				str += (current+1) + "/" + this.products[clean]['images'][duration].length;
				if (this.options.displayProduct)
					str += '</span>'; 
				this.info.setText(str); 
			}
			this.frame.setImage(images[current]);

		}
	},/*}}}*/
	updatePrintImage: function() {/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		// !products[clean] || !products[clean]['current'][duration] can not exists 
		// when we're still loading a products data from the server
		// thus we protect against it
		if (this.products[clean] && this.products[clean]['current'][duration]) {
			var current = this.products[clean]['current'][duration];
			var src = this.products[clean]['images'][duration][current]['src'].split(/\//).pop();
			var args = this.printLink.href.split(/\?/);
			var href = args.shift();
			args = Query(args.join('?').replace(/.?b_templatePrint=true/,''));
			args['display'] = src;
			args['b_templatePrint'] = true;
			args = Query(args,true);
			this.printLink.href = href + args;
		}
	},/*}}}*/
	durationMouse: function() {/*{{{*/	
		var clean = this.clean(this.current);
		var durations = this.options.durations.available;
		var radio = [];
		var durationCheckInterval;
		if (!this.products[clean] ){
			this.getProduct(clean);
			this.info.setText(_('Loading')+ " ...");
			for(var i = 0; i < durations.length; ++i){
				radio[i] = document.getElementById(this.options.durations['short'][i]);
				radio[i].disabled = true;
			}
			if(!durationCheckInterval){//Only do the following if the interval has not been set yet
				durationCheckInterval = window.setInterval( function() {
					if (this.products[clean]){//Check to see if products has been repopulated
						clearInterval(durationCheckInterval);//clear the interval
						this.showOperationalMessage();//return the info bar to date stamp
						for(var i = 0; i < durations.length; ++i){//loop through the radio buttons
							//get a handle to the radio buttons
							radio[i] = document.getElementById(this.options.durations['short'][i]);
							radio[i].disabled = false;//re enable the radio buttons
						}
					}
				}.bind(this),300);
			}
		}
	},
	callEvent: function(type,el,skipTest) {
		var clean = this.clean(this.current);
		if (!this.products[clean]){
			this.updateInfo = true;
			this.updateProductType(this.options);
			this.getProduct(this.clean(this.options.products.active));
			//this.getProduct(clean);
		}
		if (isFunction(this.events[type])) { 
			if (skipTest || ButtonHelper.tests.isActive(el)) {
				var r = this.events[type].call(this,type,el); 
				return r || false;
			} else {
				return false;
			}
		}
		return false;
	}, 
	
	/***************************************************************************************************************** 
	 *	Method: buttonMatch(el)
	 *	Use: return true depending on which button is selected.
	 * Author: Shayne Brioux
	 * *** NO LONGER USED ***
	 *	This method was used to check the for a specific set of buttons and used by the CallEvent so that if the button
	 *	was moused over that the products would get reloaded.. we are now just going to reload the product when any
	 *	button is moused over.
	 ***************************************************************************************************************/
	buttonMatch: function(el){/*{{{*/
		var reg = /(play|first|prev)/;  
		if((el.firstChild.src).match(reg)){
			return true;
		}
		return false;
 	},/*}}}*/
	isPlaying: function() {/*{{{*/
		var clean = this.clean(this.current);
		return this.products[clean]['isPlaying'];
	},/*}}}*/
	stop: function() {/*{{{*/
		var durations = this.options.durations.available;
		var radio = [];
		if (document.getElementById('intensity-detailed')){
			document.getElementById('intensity-detailed').disabled = false;
			document.getElementById('intensity-standard').disabled = false;
			document.getElementById('intensity-detailed-mob').disabled = false;
			document.getElementById('intensity-standard-mob').disabled = false;
			document.getElementById('play-button').disabled = false;
			document.getElementById('first-frame-button').disabled = false;
			document.getElementById('previous-frame-button').disabled = false;
			document.getElementById('next-frame-button').disabled = false;
			document.getElementById('last-frame-button').disabled = false;
		}
		for(var i = 0; i < durations.length; ++i){
			radio[i] = document.getElementById(this.options.durations['short'][i]);
			if(radio[i].disabled){
				radio[i].disable = false;
			}
		}
		this.pause();
		this.last();
	},/*}}}*/
	pause: function() {/*{{{*/
		var clean = this.clean(this.current);
		if (this.products[clean]['timer']) window.clearTimeout(this.products[clean]['timer']);
		this.products[clean]['isPlaying'] = false;
	},/*}}}*/
	isFirstFrame: function() {/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		return this.products[clean]['current'][duration] == 0;
	},/*}}}*/
	isLastFrame: function() {/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		return this.products[clean]['current'][duration] == this.products[clean]['images'][duration].length - 1;
	},/*}}}*/
	last: function() {/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		this.products[clean]['current'][duration] = this.products[clean]['images'][duration].length - 1;
		this.updateFrame(true);
	},/*}}}*/
	first: function() {/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		this.products[clean]['current'][duration] = 0;
		this.updateFrame(true);
	},/*}}}*/
	previous: function() {/*{{{*/
	
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		this.products[clean]['current'][duration] = this.getPreviousFrameIndex();
		this.updateFrame(true);
	},/*}}}*/
	next: function() {/*{{{*/


		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		this.products[clean]['current'][duration] = this.getNextFrameIndex();
		this.updateFrame(true);
	},/*}}}*/
	getPreviousFrameIndex: function() {/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		var index = this.products[clean]['current'][duration];
		index -= this.options.frameSkip;
		if (index < 0) {
			if (this.isPlaying()) {
				index += this.products[clean]['images'][duration].length;
			} else {
				index = 0;
			}
		}
		return index;
	},/*}}}*/
	getNextFrameIndex: function() {/*{{{*/
		var clean = this.clean(this.current);
		var duration = this.options.durations.active;
		var index = this.products[clean]['current'][duration];
		index += this.options.frameSkip;
		if (index > this.products[clean]['images'][duration].length - 1) {
			if (this.isPlaying()) {
				index -= this.products[clean]['images'][duration].length;
			} else {
				index = this.products[clean]['images'][duration].length - 1;
			}
		}
		return index;
	},/*}}}*/
	changeDuration: function(newDuration) {/*{{{*/
		if (this.options.durations['short'].indexOf(newDuration) != -1) {
			this.options.durations.active = newDuration; 
			this.updateFrame(true);
		}
		
	},/*}}}*/
	changeCycleMethod: function() {/*{{{*/
		var clean = this.clean(this.current);
		this.products[clean]['cycle'] = this.cycleMethods[this.products[clean]['cycle']];
	},/*}}}*/
	changeDirection: function() {/*{{{*/
		var clean = this.clean(this.current);
		this.products[clean]['direction'] = this.directions[this.products[clean]['direction']];
	},/*}}}*/
	getSpeed: function() {/*{{{*/
		var clean = this.clean(this.current);
		/* A group of simple function that allow various speed growth techniques */
		var methods = {
			'linear': function(s,e,t,c) { return parseInt(s+(c/t)*(e-s)); },
			'sinusoidal': function(s,e,t,c) { return parseInt(s+Math.sin(((c/t)*90)*(Math.PI/180))*(e-s)); },
			'exponential': function(s,e,t,c) { return parseInt(s+(Math.pow(c/t,2))*(e-s)); }
		};
		var method = methods[this.options['speeds']['method']] || methods['linear'];
		var result = method(this.options['speeds']['min'],this.options['speeds']['max'],this.options['speeds']['steps'],this.products[clean]['speed']);
		return result;
	},/*}}}*/
	slower: function() {/*{{{*/
		var clean = this.clean(this.current);
		if( typeof(this.products[clean]) != "undefined" ){
			if (this.products[clean]['speed'] > 0){
				this.products[clean]['speed']--;
			}
		}
	},/*}}}*/
	isSlowest: function() {/*{{{*/
		var clean = this.clean(this.current);
		if (typeof this.products[clean] != "undefined") {
			if(this.products[clean]['speed'] <= 1){
				this.products[clean]['speed'] = 1;
				return true;
			} else {
				return false;
			}
		}
		else {
			return false;
		}
	},/*}}}*/
	faster: function() {/*{{{*/
		var clean = this.clean(this.current);
		if( typeof(this.products[clean]) != "undefined" ){
			if (this.products[clean]['speed'] < this.options.speeds.steps){
				this.products[clean]['speed']++;
			}
		}
	},/*}}}*/
	isFastest: function() {/*{{{*/
		var clean = this.clean(this.current);
		if (typeof this.products[clean] != "undefined") {
			return this.products[clean]['speed'] >= this.options.speeds.steps;
		}
		else {
			return false;
		}
	},/*}}}*/
	resetSpeed: function() {/*{{{*/
		var clean = this.clean(this.current);
		if (typeof this.products[clean] != "undefined"){
			this.products[clean]['speed'] = this.options.speeds.start;
		}
	},/*}}}*/
	animate: function() {/*{{{*/
		var clean = this.clean(this.current);
		var period = this.getPeriod();
		/* Fix Cities checkbox being hidden and shown on play
		var el = document.getElementById('overlay_default_cities');
		if (el != null){
			el.style.display = (el.style.display != 'none' ? 'none' : '' );
		}*/
		if (this.products[clean]['timer']) window.clearTimeout(this.products[clean]['timer']);
		this.products[clean]['isPlaying'] = true;
		this.next();
		if (this.isLastFrame()) period = this.getPeriod() * 4;
		this.products[clean]['timer'] = window.setTimeout(this.animate.bind(this),period);
		/*var el = document.getElementById('overlay_default_cities');
		if (el != null){
			el.style.display = (el.style.display != 'none' ? 'none' : '' );
		}*/ //Reid: this just makes the box flicker for no reason.
	},/*}}}*/
	/* getPeriod: Get's the current product's speed {{{*/
	getPeriod: function() {
		return this.getSpeed();;
	},/*}}}*/
	/* checkConnections: Updates the buttons based on actions stored in the options object using the ButtonHelper object {{{*/
	checkConnections: function(type) {
		if (typeof this.options.connections[type] != 'undefined') {
			for (var method in this.options.connections[type]) {
				if (isArray(this.options.connections[type][method]) && isFunction(ButtonHelper[method])) {
					var a = this.options.connections[type][method];
					for (var i = 0; i < a.length; ++i) {
						ButtonHelper[method](a[i]);
					}
				}
			}
		}
	},/*}}}*/
	events: {/*{{{*/
		play: function(type,el) {/*{{{*/
			var play_button = document.getElementById('play-button');
			var pause_button = document.getElementById('pause-button');
			var ff_button = document.getElementById('first-frame-button');
			var pf_button = document.getElementById('previous-frame-button');
			var nf_button = document.getElementById('next-frame-button');
			var lf_button = document.getElementById('last-frame-button');
			
			play_button.removeAttribute('href');
			pause_button.setAttribute('href','#');
			ff_button.removeAttribute('href');
			pf_button.removeAttribute('href');
			nf_button.removeAttribute('href');
			lf_button.removeAttribute('href');
			if (isSettingOn('duration_short')){
				this.options.durations.active = 'short';
			} else {
				this.options.durations.active = 'long';
			}
			var clean = this.clean(this.current);
			/* If detailed, store src to src_standard, then change src to src_detailed */
			if (document.getElementById('intensity-detailed')){
				if (document.getElementById('intensity-detailed').checked) {
					for (var i in this.products[clean]['images']['long']) {
						if (i != "indexOf" ){
							this.products[clean]['images']['long'][i]['src'] = this.products[clean]['images']['long'][i]['src_detailed'];
						}
					}
					for (var i in this.products[clean]['images']['short']) {
						if (i != "indexOf" ){
							this.products[clean]['images']['short'][i]['src'] = this.products[clean]['images']['short'][i]['src_detailed'];
						}
					}
				} else {
					for (var i in this.products[clean]['images']['long']) {
						if (i != "indexOf" ){
							var str_replace = this.products[clean]['images']['long'][i]['src'].replace("detailed/", "");
							this.products[clean]['images']['long'][i]['src'] = str_replace;
						}
					}
					for (var i in this.products[clean]['images']['short']) {
						if (i != "indexOf" ){
							var str_replace = this.products[clean]['images']['short'][i]['src'].replace("detailed/", "");
							this.products[clean]['images']['short'][i]['src'] = str_replace;
							//alert (str_replace);
						}
					}
				}
				document.getElementById('intensity-detailed').disabled = true;
				document.getElementById('intensity-standard').disabled = true;
				document.getElementById('intensity-detailed-mob').disabled = true;
				document.getElementById('intensity-standard-mob').disabled = true;

			}
			document.getElementById('play-button').disabled = true;
			document.getElementById('first-frame-button').disabled = true;
			document.getElementById('previous-frame-button').disabled = true;
			document.getElementById('next-frame-button').disabled = true;
			document.getElementById('last-frame-button').disabled = true;			
			if (this.loadTimer) window.clearTimeout(this.loadTimer);
			if (!this.products[clean]) {
				this.getProduct(clean,null,true);
			} else {
				this.preloadImages();
				this.animateOnce();
				//this.animate();
			}
			this.checkConnections('play'); // Deactivates frame controls
			if (this.longPauseTimer) window.clearTimeout(this.longPauseTimer);
			this.longPlayTimer = window.setTimeout(function() { 
				this.callEvent('pause',null,true);
				this.products = {};//This line clears the array so new images can be loaded by the if statment above
				this.counter = 0; //Reset the image counter back to zero
				this.imageArray = new Array(); //Clear out the store list of loaded images.
	//			this.getProduct(clean);
			}.bind(this),300000);//300000 is the default time for this line
			return false;
		},/*}}}*/
		pause: function(type,el) {/*{{{*/
			var play_button = document.getElementById('play-button');
			var pause_button = document.getElementById('pause-button');
			var ff_button = document.getElementById('first-frame-button');
			var pf_button = document.getElementById('previous-frame-button');

			play_button.setAttribute('href','#');
			pause_button.removeAttribute('href');
			ff_button.setAttribute('href','#');
			pf_button.setAttribute('href','#');
			
			this.stop();
			this.checkConnections('pause'); // Activate frame controls
			this.checkButtons();
			document.getElementById('play-button').disabled = false;
			document.getElementById('first-frame-button').disabled = false;
			document.getElementById('previous-frame-button').disabled = false;
			document.getElementById('next-frame-button').disabled = false;
			document.getElementById('last-frame-button').disabled = false;	
			if (this.longPlayTimer) window.clearTimeout(this.longPlayTimer);
			this.longPauseTimer = window.setTimeout(function() { 
				this.products = {}; // This line seemed to break the animation after the time out period
				this.counter = 0; //Reset the image counter back to zero
				this.imageArray = new Array(); //Clear out the store list of loaded images.
//				this.getProduct(this.clean(this.current));
			}.bind(this),600000);
			return false;
		},/*}}}*/
		first: function(type,el) {/*{{{*/
			this.first();
			this.checkConnections('first');
			this.checkButtons();
			return false;
		},/*}}}*/
		last: function(type,el) {/*{{{*/
			this.last();
			this.checkConnections('last');
/*HERE this line was causing checkboxes to dissappear. commented out next line too, made changes in all_print.css */
			//(document.getElementById("animator-controller")).style.visibility = 'visible';
			//(document.getElementById("animator-controller")).style.display = 'block';
			this.checkButtons();
			return false;
		},/*}}}*/
		faster: function(type,el) {/*{{{*/
			this.faster();
			$('#slowdown-button')[0].disabled=false;
			this.checkConnections('faster');
			if (this.isFastest()){
				ButtonHelper.deactivate(el);
				$('#speedup-button')[0].disabled=true;
			}
			return false;
		},/*}}}*/
		slower: function(type,el) {/*{{{*/
			this.slower();
			$('#speedup-button')[0].disabled=false;
			this.checkConnections('slower');

			if (this.isSlowest()){
				ButtonHelper.deactivate(el);
				$('#slowdown-button')[0].disabled=true;
			}
			return false;
		},/*}}}*/
		speedreset: function(type,el) {/*{{{*/
			this.resetSpeed();
			this.checkConnections('speedreset');
			$('#slowdown-button')[0].disabled=false;
			$('#speedup-button')[0].disabled=false;
			return false;
		},/*}}}*/
		previous: function(type,el) {/*{{{*/
			var nf_button = document.getElementById('next-frame-button');
			var lf_button = document.getElementById('last-frame-button');
			nf_button.setAttribute('href','#');
			lf_button.setAttribute('href','#');
			
			this.previous();
			this.checkConnections('previous');
			this.checkButtons();
			return false;
		},/*}}}*/
		next: function(type,el) {/*{{{*/
			var ff_button = document.getElementById('first-frame-button');
			var pf_button = document.getElementById('previous-frame-button');
			ff_button.setAttribute('href','#');
			pf_button.setAttribute('href','#');
			
			this.next();
			this.checkConnections('next');
			this.checkButtons();
			return false;
		},/*}}}*/
		customize: function(type,el) {/*{{{*/
			var e = $$(this.options.ids.customize);
			if (getStyle(e,'display') == "none")
				e.style.display = "block";
			else {
				e.style.display = "none";
				elements = new Array();
					var cb = document.getElementById('customize-button');
		//			elements = document.getElementsByTagName('a');
		//			var i = 0;
		//			while ((elements[i]!=cb)&&(i<=elements.length))
		//				i++;
		//			elements[i+1].focus();
					cb.focus();
			}
			return false;
		},/*}}}*/
		overlayClick: function(type,el) {/*{{{*/
			$checkVal = 0;
			if(el.checked){ $checkVal = 1; }
			if(el.id == 'overlay_default_cities'){
				cityOverlayCookie($checkVal);
			}else if(el.id == 'overlay_roads'){
				roadCookie($checkVal);
			}else if(el.id == 'overlay_additional_cities'){
				cityOverlay2Cookie($checkVal);
			}else if(el.id == 'overlay_road_labels'){
				roadNumCookie($checkVal);
			}else if(el.id == 'overlay_rivers'){
				riverCookie($checkVal);
			}else if(el.id == 'overlay_radar_circle'){
				radCircCookie($checkVal);
			}
			this.refreshOverlay(el);

			//var ajax = new XHR(this.options.ajaxUrl + Query({/*{{{*/
			//	action: 'save',
			//	target: 'overlays',
			//	lang: EC.lang || 'en-CA',
			//	overlay: el.getAttribute('overlay_id')
			//}),{method:'post'});/*}}}*/
			$('input#wxo-overlay-cities').prop('checked', $("input#overlay_default_cities").prop('checked'));
			$('input#wxo-overlay-more-cities').prop('checked', $('input#overlay_additional_cities').prop('checked'));
			$('input#wxo-overlay-roads').prop('checked', $('input#overlay_roads').prop('checked'));
			$('input#wxo-overlay-road-numbers').prop('checked', $('input#overlay_road_labels').prop('checked'));
			$('input#wxo-overlay-river').prop('checked', $('input#overlay_rivers').prop('checked'));
			$('input#wxo-overlay-radar-circles').prop('checked', $('input#overlay_radar_circle').prop('checked'));
			return false;
		},/*}}}*/
		durationClick: function(type,el) {/*{{{*/
			this.changeDuration(el.getAttribute('value')); 
			durationShortCookie(el.getAttribute('value'));
			this.displayProduct(this.current);
			this.counter = 0;//reset the number of images in the counter
			this.imageArray = new Array();//clean out the array of stored image sources
			
			var clean = this.clean(this.current);
			if (!this.products[clean]) return;
			if(this.isPlaying()){
				this.stop();
				this.animateOnce();
				if(document.getElementById('intensity-detailed') == null) return;
				document.getElementById('intensity-detailed').disabled = true;
				document.getElementById('intensity-standard').disabled = true;
				document.getElementById('intensity-detailed-mob').disabled = true;
				document.getElementById('intensity-standard-mob').disabled = true;
				document.getElementById('play-button').disabled = true;
				document.getElementById('first-frame-button').disabled = true;
				document.getElementById('previous-frame-button').disabled = true;
				document.getElementById('next-frame-button').disabled = true;
				document.getElementById('last-frame-button').disabled = true;
			}

			
	
			//var ajax = new XHR(this.options.ajaxUrl + Query({/*{{{*/
			//	action: 'save',
			//	target: 'duration',
			//	lang: EC.lang || 'en-CA',
			//	duration: el.getAttribute('value')
			//}),{method:'post'});/*}}}*/
		},/*}}}*/
		takeover: function(type,el) {/*{{{*/
			var product = el.href.split(/\?/);
			product.shift();
			product = Query(product.join('?'));
			product = product['product'];
			var parent = findParent(el,'ul');

			for (var i = 0; i < parent.childNodes.length; ++i) 
				removeClassName(parent.childNodes[i],'selected');
			addClassName(el.parentNode,'selected');
			

			
			this.pause(); 
			this.getProduct(product);
			return false;
		},/*}}}*/
		depress: function(type,el) {/*{{{*/
			ButtonHelper.depress(el);
		},/*}}}*/
		uplift: function(type,el) {/*{{{*/
			ButtonHelper.uplift(el);
		}/*}}}*/
	},/*}}}*/
	evalJSON: function(str) {/*{{{*/
		if (str && str.replace) return eval("(" + (str.replace(/^\s|\s$/g,'') || "''") + ")");
		else return "";
	},/*}}}*/
	toString: function() {/*{{{*/
		return "Animator";
	},/*}}}*/
	clean: function(str) {/*{{{*/
		return str.replace(/[^A-Za-z0-9_]+/,'_').replace(/^_+|_+$/g,'').toLowerCase();
	}/*}}}*/
};/*}}}*/
