;(function($) {

	//
	// lazy load images
	//

	// $.fn.lazyLoad = function(threshold, callback) {
	$.lazyLoad = function(threshold, callback) {

		var $window   = $(window),
			threshold = threshold ? threshold : 0,
			attrib    = 'data-src',
			// images    = this,
			images    = $('.lazy-image'),
			loaded;

		images.one('lazyLoad', function() {
		// this.one('lazyLoad', function() {
			var source = this.getAttribute(attrib);
			source = source ? source : this.getAttribute('data-src');
			if ( source ) {
				this.setAttribute('src', source);
				this.classList.add('loaded');
				if ( typeof callback === 'function' ) {
					callback.call(this);
				}
			}
		});

		function lazyLoad(){

			var inView = images.filter(function() {
				var $elem = $(this);
				if ( $elem.is(':hidden') ) return;

				var windowTop     = $window.scrollTop(),
					windowBottom  = windowTop + $window.height(),
					elemTop       = $elem.offset().top,
					elemBottom    = elemTop + $elem.height();

				return ( elemBottom >= windowTop - threshold ) && ( elemTop <= windowBottom + threshold );
			});

			loaded = inView.trigger('lazyLoad');
			images = images.not(loaded);
		};

		$(window).on('scroll',function(){
			lazyLoad();
		});

		lazyLoad();

		return this;

	};

	//
	// video provider src parsing
	//
	function parseVideoURL(url) {

		function getParm(url, base) {
			var re = new RegExp("(\\?|&)" + base + "\\=([^&]*)(&|$)");
			var matches = url.match(re);
			if (matches) {
				return(matches[2]);
			} else {
				return("");
			}
		}

		var retVal = {};
		var matches;

		if ( url.indexOf("youtube.com/watch") != -1 ) {
			retVal.provider = "youtube";
			retVal.id = getParm(url, "v");
		} else if (matches = url.match(/vimeo.com\/(\d+)/)) {
			retVal.provider = "vimeo";
			retVal.id = matches[1];
		}
		return(retVal);
	}

	//
	// iterate over each video
	//
	$('.lazy-video').each(function() {

		var $this     = $(this);

		var videoSrc  = parseVideoURL( $(this).find('a').attr('href') );
		var id        = videoSrc.id;
		var provider  = videoSrc.provider;
		var src       = '';
		var thumb_url = '';
		var img       = $this.find('img');

		switch(provider) {

			case 'youtube':

		    	src = '//www.youtube.com/embed/'+ id +'?autoplay=1&autohide=2&border=0&wmode=opaque&enablejsapi=1&controls=0&showinfo=0';
				thumb_url = '//i.ytimg.com/vi/' + id + '/hqdefault.jpg';

				img.attr('src', thumb_url).addClass('loaded');

				break;

			case 'vimeo':

		    	src = '//player.vimeo.com/video/' + id + '?portrait=0&title=0&color=bf1f48&badge=0&byline=0&autoplay=1';

				var url = 'http://www.vimeo.com/api/v2/video/' + id + '.json?callback=?';

				var foo = $.getJSON( url, {
					format: 'json'
				})
					.done(function( data ) {
						thumb_url = data[0].thumbnail_large;

						img.attr('src', thumb_url).addClass('loaded');

					});
				break;

			default:
				break;
		}

		// on click load iframe
		$(this).on('click', function(e) {
			e.preventDefault();
		    $(this).append('<iframe src="'+ src +'" frameborder="0" allowfullscreen></iframe>').css('background', 'none');
		});

	});


})(window.jQuery);