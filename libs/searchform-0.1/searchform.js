( function ( $, undefined ) {

 $.fn.searchform = function( change_handler ) {
   __init_searchform( this, change_handler );
 };

 function __init_searchform( container, change_handler ) {
  container.append( '\
        <form class="sf-search">\
            <input type="text" value="" class="sf-search_text"></input>\
            <input type="button" value="" class="sf-search_clear"></input>\
        </form>\
  ' );

  textfield = container.find( "form input[type='text']" );
  clearfield = container.find( "form input[type='button']" );

  textfield.on( "focus", function( event ) {
    event.preventDefault();
    this.select();
  } );
  textfield.on( 'keyup', function( event ) {
    event.preventDefault();
    change_handler( this.value );
  } );
  clearfield.on( 'click', function( event ) {
    event.preventDefault();
    textfield.val( "" );
    textfield.focus();
  } );
 }

}( jQuery ));
