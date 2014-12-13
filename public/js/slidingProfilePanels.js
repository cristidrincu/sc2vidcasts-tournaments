/**
 * Created by cristiandrincu on 10/27/14.
 */
$(document).ready(function(){
	$('.sliding-panel-main-profile, .div-gradient, .div-gradient-red, .div-gradient-green').hide();
	$('.sliding-panel-main-profile').show();
	$('.div-gradient, .div-gradient-red, .div-gradient-green').slideDown(1000);
});
