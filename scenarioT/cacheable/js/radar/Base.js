/*{{{ Object Detection Functions */
/*{{{ isBoolean: checks to see if the object is a boolean */
function isBoolean(obj) {
	return typeof obj == 'boolean';
}/*}}}*/
/*{{{ isArray: checks to see if object is an array */
function isArray(obj) {
	return obj && obj.constructor == Array;
}/*}}}*/
/*{{{ isRegExp: checks to see if object is a RegExp object */
function isRegExp(obj) {
	return obj && obj.constructor == RegExp;
}/*}}}*/
/*{{{ isFunction: Checks to see if argument is a function */
function isFunction(obj) {
	return obj && obj.constructor == Function;
}/*}}}*/
/*{{{ isString: Checks to see if argument is a string */
function isString(obj) {
	return (obj === "") || (obj && obj.constructor == String); 
}/*}}}*/
/*}}}*/
/*{{{ $$: shortcut function to document.getElementsById */
function $$() {
	var a = [], e, l = arguments.length;
	for (var i = 0; i < l; ++i) {
		e = arguments[i];
		if (isString(e))
			e = document.getElementById(e);
		a.push(e);
	}
	return a.length < 2 ? a[0] : a;
}/*}}}*/
/*{{{ Class: used to create classes which when initialized run their constructor' method */
Class = function() {
	return function() {
		this.constructor.apply(this,arguments);
	}
};/*}}}*/
/*{{{ Function.prototype.bind: adds a closure creating function to the Function Object */
Function.prototype.bind = function(obj) {
	var args = [];
	for (var i = 0; i < arguments.length; ++i)
		if (arguments[i] != obj) args.push(arguments[i]);
	
	if (!window.__objs) {
		window.__objs = [];
		window.__funs = [];
	}

	var fun = this;

	var objId = obj.__objId;
	if (!objId)
		__objs[objId = obj.__objId = __objs.length] = obj;

	var funId = fun.__funId;
	if (!funId)
		__funs[funId = fun.__funId = __funs.length] = fun;

	if (!obj.__closures)
		obj.__closures = [];
	
	var closure = obj.__closures[funId];
	if (closure)
		return closure;

	obj = null;
	fun = null;

	return __objs[objId].__closures[funId] = function() {
		return __funs[funId].apply(__objs[objId],args.concat(arguments));
	}
}/*}}}*/
/*{{{ Array.prototype.indexOf: adds an indexOf searching method to the Array Object */
Array.prototype.indexOf = function(search,from) {
	var i = (from < 0) ? this.length+from : from || 0;
	for (; i < this.length; ++i) 
		if (search == this[i]) return i;
	return -1;
}/*}}}*/
/*{{{ XHR: Cross-browser XMLHttpRequest Object */
var XHR = new Class();
XHR.prototype = {
	setHeaders: function() {/*{{{*/
		var headers = 
			['X-Requested-With', 'XMLHttpRequest',
			'Accept', 'text/javascript, text/html, application/xml, text/xml, */*'];
		if (this.options.method == 'post') {
			headers.push('Content-type', 'application/x-www-form-urlencoded');
			if (this.xhr.overrideMimeType)
				headers.push('Connection', 'close');
		}
		if (this.options.headers)
			headers.push.apply(headers,this.options.headers);
		for (var i = 0; i < headers.length; i+=2)
			this.xhr.setRequestHeader(headers[i], headers[i+1]);
	},/*}}}*/
	getXhr: function() {/*{{{*/
		try {
			return new XMLHttpRequest();
		} catch(e) {
			try {
				return new ActiveXObject('Microsoft.XMLHTTP');
			} catch(e) {
				try {
					var xmlObj = new XMLHttpRequestifr();
					this.isIframeXhr = true;
					return xmlObj;
				}catch(e){
					/*This message should never been seen but in extreme cases it's there just in case */
					document.getElementById('noActiveXwarn').innerHTML = _("Your security settings do not allow web sites to use ActiveX controls installed on your computer.  This page may not display correctly.");
				}
				return false;
			}
		}
	},/*}}}*/
	encode: function(obj) {/*{{{*/
		var str = "";
		for (var prop in obj) {
			str += '&' + encodeURIComponent(prop) + "=" + encodeURIComponent(obj[prop]);
		}
		return str.substr(1);
	},/*}}}*/
	decode: function(str) {/*{{{*/
		var obj = {}, pairs = str.match(/^\??(.*)$/)[1].split('&'), length = pairs.length;
		for (var i = 0; i < length; ++i) {
			var pair = pairs[i].split('=');
			//alert("Pair : " + pair[0] + " Pair 1 " + pair[1] );
			obj[pair[0]] = decodeURIComponent(pair[1]);
		}
		return obj;
	},/*}}}*/
	setOptions: function(obj) {/*{{{*/
		this.options = {
			method: 'get',
			async: true
		}
		for (var prop in obj)
			this.options[prop] = obj[prop];
	},/*}}}*/
	constructor: function(url,options,responder) {/*{{{*/
		var args, override, scope;
		if (typeof options == 'function') {/*{{{*/
			args = [];
			for (var i = 0; i < arguments.length; ++i)
				if (arguments[i] != url && arguments[i] != options){
					args.push(arguments[i]);
				}
			responder = options;
		} else {
			args = [];
			for (var i = 0; i < arguments.length; ++i)
				if (arguments[i] != url && arguments[i] != options && arguments[i] != responder)
					args.push(arguments[i]);
		}/*}}}*/
		
		var override = isBoolean(args[args.length-1]) ? args.pop() : false;
		var scope = override ? args[0] : this;
	
		this.url = url;
		this.setOptions(options);
		this.isIframeXhr = false;
		this.xhr = this.getXhr();
		if (this.xhr) {
			this.parameters = isString(options.parameters) ? this.decode(options.parameters) : options.parameters || {};
			if(this.isIframeXhr){	
				/*********************************************************************/
				/*NEED TO IMPLEMENT THIS AREA ONLY WITH NO NATIVE XMLHTTP OR ACTIVEX*/
				var tempObj = decodeURIComponent(this.url);
				var tempString = tempObj.split('?');
				var tempSecond = tempString[1].split('&');
				var outputHeader = "";
				for (var i = 0 ; i < tempSecond.length; i++){
					outputHeader = tempSecond[i].split('=');
					this.xhr.setRequestHeader(outputHeader[0],outputHeader[1]);
					
				}
				this.xhr.setRequestHeader('isIframeXhr','true');
				/****************************************************************/
			}
			this.xhr.open(this.options.method, this.url, this.options.async);
			this.responder = [scope,args];
			if(!this.isIframeXhr){
				this.setHeaders();
			}
			if (this.options.async && responder) {
				this.xhr.onreadystatechange = function() {
					if (this.xhr.readyState == 4) {
						this.xhr.onreadystatechange = function() {};
						responder.apply(this.responder.shift(),[this.xhr].concat(this.responder.shift()));
					}
				}.bind(this);
			}
			this.xhr.send(this.options.method == 'post' ? this.options.postBody || this.encode(this.parameters) : null);
			if (!this.options.async && responder) {
				while (this.xhr.readyState != 4) {}
				responder.apply(this.responder.shift(),[this.xhr].concat(this.responder.shift()));
			}
		} 
	}/*}}}*/
};/*}}}*/
/*{{{ Event module */
Event = {
	loaded: false, listeners: [],
	obj: 0, type: 1, listener: 2, wrapper: 3, args: 4, override: 5,
	isBoolean: function(obj) { return obj && obj.constructor == Boolean; },
	isArray: function(obj) { return obj && obj.constructor == Array; },
	isString: function(obj) { return obj && obj.constructor == String; },
	isCollection: function(obj) { return this.isArray(obj) || (obj && obj.length && !obj.tagName && !this.isString(obj)); },
	startUp: function() {/*{{{*/
		if (document && document.body) this._load();
		else this.addListener(window, "load", this._load, this, true);
		this.addListener(window, "unload", this._unload, this, true);
	},/*}}}*/
	_unload: function() {/*{{{*/
		this.listeners = this.listeners || [];
		for (var i = 0; i < this.listeners.length; ++i) {
			var listener = this.listeners[i];
			if (listener) 
				this.removeListener(listener[this.obj], listener[this.type], listener[this.listener]);
		}
	},/*}}}*/
	_load: function() {/*{{{*/
		this.loaded = true;
	},	/*}}}*/
	preventDefault: function(e) { /*{{{*/
		if (e.preventDefault)
			e.preventDefault();
		else
			e.returnValue = false; 
	},/*}}}*/
	stopPropagation: function(e) { /*{{{*/
		if (e.stopPropagation)
			e.stopPropagation();
		else
			e.cancelBubble = true; 
	},/*}}}*/
	stop: function(e) {/*{{{*/
		Event.preventDefault(e);
		Event.stopPropagation(e);
	},/*}}}*/
	extendEvent: function(e) {/*{{{ This used to do something but it doesn't anymore... */
		if (typeof e.stopPropagation == 'undefined')
			e.stopPropagation = function() { this.cancelBubble = true; };
		if (typeof e.preventDefault == 'undefined')
			e.preventDefault = function() { this.returnValue = false; };
		e.stop = function() { this.stopPropagation(); this.preventDefault(); }
		e.time = new Date().getTime();
		if (typeof e.target == 'undefined')
			e.target = e.srcElement;
		if (typeof e.relatedTarget == 'undefined')
			e.relatedTarget = (e.type == 'mouseout' ? e.toElement : (e.type == 'mouseover' ? e.fromElement : null));
		if (typeof e.pageX == 'undefined')
			e.pageX = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
		if (typeof e.pageY == 'undefined')
			e.pageY = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
		
		return e;
		/*
		return Object.underlay(e,{
			stopPropagation: function() { this.cancelBubble = true; },
			preventDefault: function() { this.returnValue = false; },
			stop: function() { this.stopPropagation(); this.preventDefault(); },
			time: new Date().getTime(),
			target: e.srcElement,
			relatedTarget: (e.type == 'mouseout' ? e.toElement : (e.type == 'mouseover' ? e.fromElement : null)),
			pageX: (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)),
			pageY: (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop)),
			pointerX: function() { return e.pageX || (e.clientX + (document.documentElement.scrollTop || document.body.scrollTop)); },
			pointerY: function() { return e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop)); }
		});
		 */
	},/*}}}*/
	addListeners: function(elements,listeners) {/*{{{*/
		var args = [], ok = true;
		for (var i = 0; i < arguments.length; ++i)
			if (arguments[i] != elements && arguments[i] != listeners)
				args.push(arguments[i]);
		for (var listener in listeners)
			ok = ok && this.addListener.apply(this,[elements,listener,listeners[listener]].concat(args));
		return ok
	},/*}}}*/
	addListener: function(obj, type, listener) {/*{{{*/
		var args = [];
		for (var i = 0; i < arguments.length; ++i)
			if (arguments[i] != obj && arguments[i] != type && arguments[i] != listener)
				args.push(arguments[i]);
		if (this.isCollection(obj)) {
			var ok = true;
			for (var i = 0; i < obj.length; ++i)
				ok = ok && this.addListener.apply(this,[obj[i],type,listener].concat(args));
			return ok;
		}
		
		if (type == 'keypress' && (navigator.appVersion.match(/Konqueror|Safari|KHTML/) || obj.attachEvent)) 
			type = 'keydown';
		
		obj = $$(obj);

		if (!obj) return false;
		
		var override = this.isBoolean(args[args.length-1]) ? args.pop() : false;
		var scope = override ? args[0] : obj;
		var wrapper = function(e) {
			return listener.apply(scope, [this.extendEvent(e || window.event)].concat(args));
		}.bind(this);
		
		this.listeners.push([obj,type,listener,wrapper,args,override]);
		
		if (obj.addEventListener)
			return obj.addEventListener(type,wrapper,false) || true;
		else if (obj.attachEvent)
			return obj.attachEvent('on'+type,wrapper);
		
		return false;
	},/*}}}*/
	removeListeners: function(elements,listeners) {/*{{{*/
		var ok = true;
		for (var listener in listeners)
			ok = ok && this.removeListener.call(this,elements,listener,listeners[listener]);
		return ok
	},/*}}}*/
	removeListener: function(obj, type, listener) {/*{{{*/
		if (this.isCollection(obj)) {
			var ok = true;
			for (var i = 0; i < obj.length; ++i)
				ok = ok && this.removeListener.call(this,obj[i],type,listener);
			return ok;
		}
			
		if (type == 'keypress' && (navigator.appVersion.match(/Konqueror|Safari|KHTML/) || obj.attachEvent)) 
			type = 'keydown';
		
		obj = $$(obj);
		
		var l = this.getListenerIndex(obj, type, listener);
		if (this.listeners[l]) {
			l = this.listeners[l];
			
			if (l[this.obj].removeEventListener)
				l[this.obj].removeEventListener(l[this.type],l[this.wrapper],false);
			else if (l[this.obj].detachEvent)
				l[this.obj].detachEvent('on'+l[this.type],l[this.wrapper]);
			
			this.listeners[l][this.obj] = null;
			this.listeners[l] = null;

			return true;
		}
		return false;
	},/*}}}*/
	getListenerIndex: function(obj, type, listener) {/*{{{*/
		var l = this.listeners.length;
		for (var i = 0; i < l; ++i) {
			var li = l[i];
			if (li && li[this.obj] == obj && li[this.type] == type && li[this.listener] == listener) {
				return i;
			}
		}
	}/*}}}*/
}
Event.startUp();/*}}}*/
/*{{{ Cookie Functions */
/*{{{ getCookie: gets cookies by name */
function getCookie( name ) {
	var start = document.cookie.indexOf( name + "=" );
	var len = start + name.length + 1;
	if ((!start) && (name != document.cookie.substring(0, name.length))) return null;
	if (start == -1) return null;
	var end = document.cookie.indexOf( ';', len );
	if ( end == -1 ) end = document.cookie.length;
	
//	alert('Calling get cookie: ' + name + 'Start: ' + start);
	
	return unescape( document.cookie.substring( len, end ) );
}/*}}}*/
/*{{{ setCookie: sets cookies by name */
function setCookie( name, value, expires, path, domain, secure ) {
	var today = new Date();
	today.setTime( today.getTime() );
	if ( expires ) { expires = expires * 1000 * 60 * 60 * 24; }
	var expires_date = new Date( today.getTime() + (expires) );
	/*document.cookie = name + '=' + escape(value) 
	                + ((expires) ? ';expires=' + expires_date.toGMTString() : '') 
	                + ((path) ? ';path=' + path : '') 
	                + ((domain) ? ';domain=' + domain : '') 
	                + ((secure) ? ';secure' : '');*/
}/*}}}*/
/*{{{ deleteCookie: deletes cookies by name */
function deleteCookie( name, path, domain ) {
	/*if (getCookie(name)) 
		document.cookie = name + '=' + ((path) ? ';path=' + path : '') + ((domain) ? ';domain=' + domain : '' ) + ';expires=Thu, 01-Jan-1970 00:00:01 GMT';*/
}/*}}}*/
/*}}}*/
/*{{{ Element helper functions*/
/*{{{ hasClassName: check if the element has the specified class */
hasClassName = function(e,c) {
	return e.className && e.className.match(new RegExp("(^|\\s)"+c+"(\\s|$)"));
}/*}}}*/
/*{{{ addClassName: add the specified class to the element */
addClassName = function(e,c) {
	if (hasClassName(e,c)) return e.className;
	var classNames = e.className.replace(/^\s+|\s+$/g,'').split(/\s+/);
	classNames.push(c);
	return e.className = classNames.join(' ');
}/*}}}*/
/*{{{ removeClassName: removes the specified class from the element*/
removeClassName = function(e,c) {
	if (hasClassName(e,c)) {
		var result = [], classNames = e.className.replace(/^\s+|\s+$/g,'').split(/\s+/);
		for (var i = 0; i < classNames.length; ++i)
			if (classNames[i] != c)
				result.push(classNames[i]);
		e.className = result.join(' ');
	} 
	return !e.className ? false : e.className;
}/*}}}*/
/*{{{ getStyle: gets the style of the element using direct attributes and computed styles */
getStyle = function(el,style) {
	el = $$(el);
	var CSStoJS = function(str) {
		if (str == 'float')
			return 'cssFloat';
		var splits = str.split('-');
		var start = splits.length > 1 ? 1 : 0;
		for (var i = start; i < splits.len; ++i) 
			splits[i] = splits[i].charAt(0).toUpperCase + splits[i].substr(1);
		return splits.join('');
	};
	
	var value = el.style[CSStoJS(style)];
	if (!value) {
		if (document.defaultView && document.defaultView.getComputedStyle) {
			var css = document.defaultView.getComputedStyle(el, null);
			value = css ? css.getPropertyValue(style) : null;
		} else if (el.currentStyle) {
			value = el.currentStyle[CSStoJS(style)];
		}
	}

	//Removed the check of window.opera because it gives an undefined property warning,
	//even if you do a (typeof window.opera == "undefined") check.
	if (style.match(/^(top|left|bottom|right)$/) && (arguments.callee(el,'position') == 'static')){
		value = 'auto';
	}

	return value == 'auto' ? null : value;
}/*}}}*/
/*{{{ findParent: returns the first parent or the first parent with the specified element name */
findParent = function(el,type) {
	var test = !type ? true : new RegExp("^"+type+"$","i");
	do { el = el.parentNode; } while (test !== true && !el.tagName.match(test))
	return el;
}/*}}}*/
/*{{{ findSibling: finds the first (real) sibling or (if specified) the first sibiling of element name */
findSibling = function(el,type) {
	var test = new RegExp("^"+type+"$","i");
	while (!el.tagName.match(test))
		el = nextSibling(el);
	return el;
}/*}}}*/
/*{{{ nextSibling: gets next (real) sibling avoiding text nodes and comments */
nextSibling = function(el) {
	while (el.nextSibling && el.nextSibling.nodeType != 1) el = el.nextSibling;
	return el.nextSibling;
}/*}}}*/
/*{{{ firstChild: gets the first (real) child of the element ignoring text nodes and comments */
firstChild = function(el) {
	var child = el.firstChild;
	while (child && child.nodeType != 1) child = child.nextSibling;
	return child;
}/*}}}*/
/*{{{ childNodes: returns an array of (real) children. */
childNodes = function(el) {
	var children = [];
	for (var i = 0; i < el.childNodes.length; ++i)
		if (el.childNodes[i].nodeType == 1)
			children.push(el.childNodes[i]);
	return children;
}/*}}}*/
/*{{{ getXY: returns the current x,y co-ordinates of the element */
getXY = function(el) {
	var x = 0, y = 0;
	do {
		y += el.offsetTop  || 0;
		x += el.offsetLeft || 0;
		el = el.offsetParent;
	} while (el);
	return [x,y];
}/*}}}*/
/* getText: Return the inner text of an element {{{*/
getText = function(el) {
	var text = "";
	el = $$(el);
	if (el.childNodes && el.childNodes.length != 0) 
		for (var i = 0; i < el.childNodes.length; ++i)
			text += arguments.callee(el.childNodes[i]);
	else
		text = el.nodeValue;
	return text;
}/*}}}*/
/*}}}*/
/* Query: A function which converts query strings to objects and vice versa {{{*/
Query = function(o,q) {
	q = (typeof q == 'undefined' ? true : !!q);
	if (isString(o)) {
		if (o.replace(/^\s*|\s*$/g,'') == "") return {};
		var obj = {}, pairs = o.match(/^\??(.*)$/)[1].split('&'), length = pairs.length;
		for (var i = 0; i < length; ++i) {
			var pair = pairs[i].split('=');
			obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
		}
		return obj;
	} else {
		var str = "";
		for (var prop in o) str += '&' + encodeURIComponent(prop) + "=" + encodeURIComponent(o[prop]);
		if (str != "") return (q ? '?' : '') + str.substr(1);
		else return "";
	}
}/*}}}*/
/* Merge: A function to recursively merge two objects {{{*/
Merge = function(dest,src) {
	for (var prop in src) {
		if (!dest[prop]) dest[prop] = {};
		if (isArray(src[prop]) || (!isString(src[prop]) && !isFunction(src[prop]) && !isBoolean(src[prop]) && !isRegExp(src[prop])))
			dest[prop] = arguments.callee(dest[prop],src[prop]);
		else dest[prop] = src[prop];
	}
	return dest;
}/*}}}*/
/* ButtonHelper Object: Designed to aide in menial tasks regarding button capabilities. {{{*/
ButtonHelper = {
	fileMatch: /(.*)\.(gif|png|jpg)$/i,
	tests: {/*{{{*/
		contains: function(el,str) {/*{{{*/
			el = $$(el);
			return el.firstChild.src.match(new RegExp(str,"i"));
		},/*}}}*/
		isActive: function(el) {/*{{{*/
			el = $$(el);
			return  1;//!el.firstChild.src.match(/greyed/i);
		}/*}}}*/
	},/*}}}*/
	imageSwap: function(el,oldName,newName) {/*{{{*/
		el = $$(el);
		el.firstChild.src = el.firstChild.src.replace(oldName,newName);
	},/*}}}*/
	depress: function(el) {/*{{{*/
		for (var i = 0; i < arguments.length; ++i) {
			el = $$(arguments[i]);
			/*if (!el.firstChild.src.match(/_greyed/i) && !el.firstChild.src.match(/_over/i))
				el.firstChild.src = el.firstChild.src.replace(this.fileMatch,"$1_over.$2");*/
		}
	},/*}}}*/
	uplift: function() {/*{{{*/
		for (var i = 0; i < arguments.length; ++i) {
			el = $$(arguments[i]);
			//el.firstChild.src = el.firstChild.src.replace(/_over\./i,'.');
		}
	},/*}}}*/
	activate: function() {/*{{{*/
		for (var i = 0; i < arguments.length; ++i) {
			el = $$(arguments[i]);
			//el.firstChild.src = el.firstChild.src.replace(/_greyed\./i,'.');
		}
	},/*}}}*/
	deactivate: function() {/*{{{*/
		for (var i = 0; i < arguments.length; ++i) {
			el = $$(arguments[i]);
			ButtonHelper.uplift(el);
			/*if (!el.firstChild.src.match(/_greyed/i))
				el.firstChild.src = el.firstChild.src.replace(this.fileMatch,"$1_greyed.$2");*/
		}
	}/*}}}*/
};/*}}}*/
/* toJSONString: Object to JSON String convertor. By Douglas Crockford. Modified by Blair Mitchelmore {{{*/
var toJSONString = function(o) {
	var m = {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"' : '\\"',
		'\\': '\\\\'
	};
	var s = {
		array: function (x) {
			var a = ['['], b, f, i, l = x.length, v;
			for (i = 0; i < l; i += 1) {
				v = x[i];
				f = s[typeof v];
				if (f) {
					v = f(v);
					if (typeof v == 'string') {
						if (b) {
							a[a.length] = ',';
						}
						a[a.length] = v;
						b = true;
					}
				}
			}
			a[a.length] = ']';
			return a.join('');
		},
		'boolean': function (x) {
			return String(x);
		},
		'null': function (x) {
			return "null";
		},
		number: function (x) {
			return isFinite(x) ? String(x) : 'null';
		},
		object: function (x) {
			if (x) {
				if (x instanceof Array) {
					return s.array(x);
				}
				var a = ['{'], b, f, i, v;
				for (i in x) {
					v = x[i];
					f = s[typeof v];
					if (f) {
						v = f(v);
						if (typeof v == 'string') {
							if (b) {
								a[a.length] = ',';
							}
							a.push(s.string(i), ':', v);
							b = true;
						}
					}
				}
				a[a.length] = '}';
				return a.join('');
			}
			return 'null';
		},
		string: function (x) {
			if (/["\\\x00-\x1f]/.test(x)) {
				x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
					var c = m[b];
					if (c) {
						return c;
					}
					c = b.charCodeAt();
					return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
				});
			}
			return '"' + x + '"';
		}
	};
	return s[typeof o](o);
};/*}}}*/
/*{{{ _: translation function 
 	Checks the EC.text[lang] array for a string key and returns 
	it's corresponding string value                             */
_ = function(str,lang) { 
	var lang = document.documentElement.lang;
	if(lang == null){
		lang = 'en-CA';
	} else {
		lang = lang + '-CA';
	}
	if (!lang) lang = EC.lang;
	if (EC.text[lang] && EC.text[lang][str])
		return EC.text[lang][str];
	else 
		return str; 
};/*}}}*/
// Set some base values
var EC = EC || {};
EC.lang = 'en-CA';
EC.text = {};
