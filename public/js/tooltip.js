/**
 * Created by cristiandrincu on 10/27/14.
 */
$(document).ready(function(){
	$('.tooltipSender').hover(function(){
		$(this).tooltip({
			placement: 'right',
			container: 'div'
		});
	});
});
