/**
 * PrimeFaces Extensions ImageRotateAndResize Widget
 */
PrimeFacesExt.widget.ImageRotateAndResize = function(id, cfg) {
	this.id = id;
	this.cfg = cfg;
	this.initialized = false;
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.initializeLazy = function() {
	if (!this.initialized) {
		this.target = document.getElementById(this.cfg.target);
		this.imageSrc = this.target.src;
		this.imageWidth = this.target.width;
		this.imageHeight = this.target.height;
		this.degree = 0;
		this.newImageWidth = this.target.width;
		this.newImageHeight = this.target.height;
		this.initialized = true;
	}
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.refresh = function() {
	this.initialized = false;
	this.initializeLazy();
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.rotateLeft = function(degree) {
	this.initializeLazy();

	if ((this.degree - degree) <= 0) {
		this.degree = 360 - ((this.degree - degree) * -1);
	}
	else {
		this.degree -= degree;
	}

	this.redrawImage();
	this.fireRotateEvent();
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.rotateRight = function(degree) {
	this.initializeLazy();

	if ((this.degree + degree) >= 360) {
		this.degree = (this.degree + degree) - 360;
	}
	else {
		this.degree += degree;
	}

	this.redrawImage();
	this.fireRotateEvent();
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.resize = function(width, height) {
	this.initializeLazy();

	this.newImageWidth = width;
	this.newImageHeight = height;

	this.redrawImage();
	this.fireResizeEvent();
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.scale = function(scaleFactor) {
	this.initializeLazy();

	this.newImageWidth = this.newImageWidth * scaleFactor;
	this.newImageHeight = this.newImageHeight * scaleFactor;

	this.redrawImage();
	this.fireResizeEvent();
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.restoreDefaults = function() {
	this.initializeLazy();

	this.newImageWidth = this.imageWidth;
	this.newImageHeight = this.imageHeight;
	this.degree = 0;

	this.redrawImage();
	this.fireResizeEvent();
	this.fireRotateEvent();
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.redrawImage = function() {
	if (this.degree >= 0) {
		var rotation = Math.PI * this.degree / 180;
	} else {
		var rotation = Math.PI * (360 + this.degree) / 180;
	}

	var cos = Math.cos(rotation);
	var sin = Math.sin(rotation);

	if ($.browser.msie && parseInt($.browser.version) <= 8) {
		var image = document.createElement('img');
		
		image.src = this.imageSrc;
		image.height = this.newImageHeight;
		image.width = this.newImageWidth;
		image.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11=" + cos + ",M12=" + (sin * -1) + ",M21=" + sin + ",M22=" + cos + ",SizingMethod='auto expand')";	
		
		image.id = this.target.id;
		this.target.parentNode.replaceChild(image, this.target);
		this.target = image;
	} else {
		var canvas = document.createElement('canvas');

		var newImage = new Image();
		newImage.src = this.imageSrc;
		newImage.width = this.newImageWidth;
		newImage.height = this.newImageHeight;

		canvas.style.width = canvas.width = Math.abs(cos * newImage.width) + Math.abs(sin * newImage.height);
		canvas.style.height = canvas.height = Math.abs(cos * newImage.height) + Math.abs(sin * newImage.width);

		var context = canvas.getContext('2d');
		context.save();
		
		if (rotation <= Math.PI/2) {
			context.translate(sin * newImage.height, 0);
		} else if (rotation <= Math.PI) {
			context.translate(canvas.width, (cos * -1) * newImage.height);
		} else if (rotation <= 1.5 * Math.PI) {
			context.translate((cos * -1) * newImage.width, canvas.height);
		} else {
			context.translate(0, (sin * -1) * newImage.width);
		}

		context.rotate(rotation);
		context.drawImage(newImage, 0, 0, newImage.width, newImage.height);
		context.restore();	
				
		canvas.id = this.target.id;
		canvas.src = this.target.src;
		this.target.parentNode.replaceChild(canvas, this.target);
		this.target = canvas;
	}
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.fireRotateEvent = function() {
	if (this.cfg.behaviors) {
		var callback = this.cfg.behaviors['rotate'];
	    if (callback) {
	    	var ext = {
	    			params: {}
	    	};
	
	    	ext.params[this.id + '_degree'] = this.degree;
	   
	    	callback.call(this, null, ext);
	    }
	}
}

PrimeFacesExt.widget.ImageRotateAndResize.prototype.fireResizeEvent = function() {
	if (this.cfg.behaviors) {
		var callback = this.cfg.behaviors['resize'];
	    if (callback) {
	    	var ext = {
	    			params: {}
	    	};
	    	
	    	ext.params[this.id + '_width'] = this.newImageWidth;
	    	ext.params[this.id + '_height'] = this.newImageHeight;
	    	
	    	callback.call(this, null, ext);
	    }
	}
}