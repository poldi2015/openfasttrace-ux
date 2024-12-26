/*
  OpenFastTrace UX

 Copyright (C) 2024-2025 itsallcode.org, Bernd Haberstumpf

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public
 License along with this program.  If not, see
 <http://www.gnu.org/licenses/gpl-3.0.html>.
*/
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
