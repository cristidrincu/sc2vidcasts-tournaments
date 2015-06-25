/**
 * Created by cristiandrincu on 8/29/14.
 */

$(document).ready(function(){
  //default behaviour on each page requested
  $('.tournaments-list').hide();
  $('.tournaments-list').slideDown().show();

  $('.players-list').hide();
  $('.players-list').slideDown().show();

  $('.display-active-tournaments').click(function(){
    $('.tournaments-list').slideToggle().show();
  });

  $('.display-leagues-players').click(function(){
    $('.players-list').slideToggle().show();
  });
});
