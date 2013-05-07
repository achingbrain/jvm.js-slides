var interval = setInterval(function() {
	if(!window.SlideShow) {
		return;
	}

	clearInterval(interval);
	window.slideshow = new SlideShow();

	var snippets = document.querySelectorAll('.snippet');
	for(var i=0; i<snippets.length; i++) {
		new CSSSnippet(snippets[i]);
	}

	var cssControls = document.querySelectorAll('.css-control');
	for(var i=0; i<cssControls.length; i++) {
		new CSSControl(cssControls[i]);
	}

	$$('style[scoped]').forEach(function(style) {
		var rulez = style.sheet.cssRules,
			parentid = style.parentNode.id || self.getSlide(style).id || style.parentNode.parentNode.id;

		for(var j=rulez.length; j--;) {
			var selector = rulez[j].selectorText.replace(/^|,/g, function($0) {
				return '#' + parentid + ' ' + $0
			});

			var cssText = rulez[j].cssText.replace(/^.+?{/, selector + '{');

			style.sheet.deleteRule(j);
			style.sheet.insertRule(cssText, j);
		}
	});

	registerSlideshowListener("batman", {
		onEnter: function() {
			document.getElementById("batman_video").play();
		},
		onLeave: function() {
			document.getElementById("batman_video").pause();
			document.getElementById("batman_video").currentTime = 0;
		}
	});
}, 10);