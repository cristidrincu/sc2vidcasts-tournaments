/**
 * Created by cristiandrincu on 2/21/15.
 */
$(document).ready(function(){
	var defaultActiveImage = $('.active-image');

	$(defaultActiveImage).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'});

	var defaultDescription = $('.active-description');

	var cristianDescription = $('.cristian-description');
	var adilaDescription = $('.adila-description');

	defaultDescription.stop(true, true).fadeIn(2000).show();

	$('#cristian').on({
		click: function(){
			$(defaultActiveImage).removeClass('.active-image').css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			defaultActiveImage = $(this);
			$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'}).addClass('.active-image');

			defaultDescription.stop(true, true).hide().removeClass('.active-description');
			$(cristianDescription).stop(true, true).fadeIn(2000).show().addClass('.active-description');
			defaultDescription = $(cristianDescription);
		},
		mouseenter: function(){
			$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'});
		}
	});

	$('#adila').on({
		click: function(){
			$(defaultActiveImage).removeClass('.active-image').css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
			defaultActiveImage = $(this);
			$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'}).addClass('.active-image');

			defaultDescription.stop(true, true).hide().removeClass('.active-description');
			$(adilaDescription).stop(true, true).fadeIn(2000).show().addClass('.active-description');
			defaultDescription = $(adilaDescription);
		},
		hover: function(){
			$(this).css({'-webkit-filter': 'grayscale(0%)','filter': 'grayscale(0%)'});
			$(this).css({'-webkit-filter': 'grayscale(80%)','filter': 'grayscale(80%)'});
		}
	});
});