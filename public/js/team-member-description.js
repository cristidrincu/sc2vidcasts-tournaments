/**
 * Created by cristiandrincu on 2/21/15.
 */
$(document).ready(function(){
	var defaultActiveImage = $('.active-image');

	$(defaultActiveImage).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'});

	var defaultDescription = $('.active-description');

	var cristianDescription = $('.cristian-description');
	var adilaDescription = $('.adila-description');
	var hundreiDescription = $('.hundrei-description');
	var bouaruDescription = $('.bouaru-description');
	var digitalDescription = $('.digital-description');

	defaultDescription.stop(true, true).fadeIn(1000).show();

	$("#cristian").on({
		click: function(){
			$(this).attr('status', 'clicked');
			$(defaultActiveImage).removeClass('.active-image').attr('status', 'unclicked').css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			defaultActiveImage = $(this);
			$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'}).addClass('.active-image');

			defaultDescription.stop(true, true).hide().removeClass('.active-description');
			$(cristianDescription).stop(true, true).fadeIn(1000).show().addClass('.active-description');
			defaultDescription = $(cristianDescription);
		},
		mouseenter: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'});
			}
		},
		mouseleave: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			}
		}
	});

	$('#adila').on({
		click: function(){
			$(this).attr('status', 'clicked');
			$(defaultActiveImage).removeClass('.active-image').attr('status','unclicked').css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			defaultActiveImage = $(this);
			$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'}).addClass('.active-image');

			defaultDescription.stop(true, true).hide().removeClass('.active-description');
			$(adilaDescription).stop(true, true).fadeIn(1000).show().addClass('.active-description');
			defaultDescription = $(adilaDescription);
		},
		mouseenter: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'});
			}
		},
		mouseleave: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			}
		}
	});

	$('#hundrei').on({
		click: function(){
			$(this).attr('status', 'clicked');
			$(defaultActiveImage).removeClass('.active-image').attr('status','unclicked').css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			defaultActiveImage = $(this);
			$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'}).addClass('.active-image');

			defaultDescription.stop(true, true).hide().removeClass('.active-description');
			$(hundreiDescription).stop(true, true).fadeIn(1000).show().addClass('.active-description');
			defaultDescription = $(hundreiDescription);
		},
		mouseenter: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'});
			}
		},
		mouseleave: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			}
		}
	});

	$('#bouaru').on({
		click: function(){
			$(this).attr('status', 'clicked');
			$(defaultActiveImage).removeClass('.active-image').attr('status','unclicked').css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			defaultActiveImage = $(this);
			$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'}).addClass('.active-image');

			defaultDescription.stop(true, true).hide().removeClass('.active-description');
			$(bouaruDescription).stop(true, true).fadeIn(1000).show().addClass('.active-description');
			defaultDescription = $(bouaruDescription);
		},
		mouseenter: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'});
			}
		},
		mouseleave: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			}
		}
	});

	$('#digital-waves').on({
		click: function(){
			$(this).attr('status', 'clicked');
			$(defaultActiveImage).removeClass('.active-image').attr('status','unclicked').css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			defaultActiveImage = $(this);
			$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'}).addClass('.active-image');

			defaultDescription.stop(true, true).hide().removeClass('.active-description');
			$(digitalDescription).stop(true, true).fadeIn(1000).show().addClass('.active-description');
			defaultDescription = $(digitalDescription);
		},
		mouseenter: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'});
			}
		},
		mouseleave: function(){
			if($(this).attr('status') != 'clicked'){
				$(this).css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			}
		}
	});
});