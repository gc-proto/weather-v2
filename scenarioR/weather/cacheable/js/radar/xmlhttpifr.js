var XMLHttpRequestifr = function()
{
	this.method = "POST";
	this.url = null;
	this.async = true;
	this.iframe = null;
	this.responseText = null;
	this.header = new Object();
	this.id = "_xmlhttp_" + new Date().getTime();
	this.container = document.body;
}

XMLHttpRequestifr.prototype.open = function(method, url, async)
{
	this.method = method;
	this.url = url;
	this.async = async;
	this.readyState = 0;
	
	this.iframe = document.createElement("IFRAME");
	this.iframe.style.visibility = "hidden";
	this.iframe.id = this.id;
	
	if(document.getElementById(this.id) == null)
		this.container.appendChild(this.iframe);
		
//	this.setRequestHeader('HTTP-X-Requested','XMLHttpRequest');
}

XMLHttpRequestifr.prototype.setRequestHeader = function(name, value)
{
	// if(typeof(this.header[name]) == "undefined")
		this.header[name] = value;
	 
}

XMLHttpRequestifr.prototype.send = function(data)
{
	var html = [];
	
	html[html.length] = '<html><body><form method="' + this.method + '" action="' + this.url + '">';
	
	for(name in this.header)
		html[html.length] = '<textarea name="' + name + '">' + this.header[name] + '</textarea>';
	
	if(data != null && data.length > 0)
		html[html.length] = '<textarea name="_data">' + data + '</textarea>';

	html[html.length] = '<s'+'cript>document.forms[0].submit();</s'+'cript>';
	// html[html.length] = '<input type="submit">';
	
	html[html.length] = '</form></body></html>';

	this.iframe._xmlhttp = this;
	this.iframe._xmlhttp._fix = -1;
	this.iframe._xmlhttp.responseText = null;
	this.iframe.onreadystatechange = this._onreadystatechange;
	this.iframe.src = "javascript:document.write('" + html.join('').replace(/\'/g,"\\'").replace(/\r\n/g, "\\r\\n") + "');void(0);";
}

XMLHttpRequestifr.prototype._onreadystatechange = function()
{
	this._xmlhttp._fix++;
	
	if(this._xmlhttp._fix < 1)
		return;
	
	if(this._xmlhttp._fix == 1)
	{
		this._xmlhttp.readyState = 1;
	}
	else if(this._xmlhttp._fix > 1)
	{
		switch(this.readyState.toString())
		{
			case "loading":
				this._xmlhttp.readyState = 2;
				break;

			case "interactive":
				this._xmlhttp.readyState = 3;
				break;

			case "complete":
				this._xmlhttp.responseText = window.frames[this.id].document.childNodes[0].childNodes[1].innerHTML;
				this.onreadystatechange = function(){}
				this._xmlhttp.readyState = 4;
				break;
		}	
	}
	
	if(typeof(this._xmlhttp.onreadystatechange) == "function")
			this._xmlhttp.onreadystatechange();
}




