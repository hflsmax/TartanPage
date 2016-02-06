/*jslint browser: true*/
/*global $, jQuery, alert*/

function main() {
    'use strict';
    var userName;
    
    
    $('textarea').bind("enterKey",function(e){
        e.preventDefault();
        userName = $('textarea').text;
        $('#startPage').fadeOut(350);
        $('body').fadeIn(350);
    });
    
    $('textarea').keydown(function(e){
        if(e.keyCode === 13)
        {
            e.preventDefault();
            return false;
        }
    });
    
    $('textarea').keyup(function(e){
        if(e.keyCode === 13)
        {
            e.preventDefault();
            $(this).trigger("enterKey");
            
        }   
    });
    
}

$(document).ready(main);