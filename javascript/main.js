/*jslint browser: true*/
/*global $, jQuery, alert*/

function main() {
    'use strict';
    
    var newDate, min, hour, month, day, year;
    var months = ["January", "February", "March", "April", "May",
                  "June", "July", "August", "September", "October",
                  "November", "December"]
    var iths = ["st", "nd", "rd", "th"]
    
    
    function ithsX(i) {
        if (i == 1 || i == 21 || i == 31) { 
            return iths[0];
        }else if (i == 2 || i == 22) {
            return iths[1];
        }else if (i == 3 || i == 23) {
            return iths[2];
        }else {
            return iths[3];   
        }
    }
    
    function doubleDigit(i) {
        if (i < 10) {
            return "0" + i;
        } else {
            return i;
        }
    }
    
    
    function createClock() {
        newDate = new Date();
        min = newDate.getMinutes();
        hour = newDate.getHours();
        month = newDate.getMonth();
        day = newDate.getDay();
        year = newDate.getFullYear();
        
        
        $('#time').text(doubleDigit(hour) + ":" + doubleDigit(min));
        $('#date').text(months[month-1] + " " + day + ithsX(day) + ", " + year);
        timer = setTimeout(function () {
            createClock()
        }, 500); 
    } 
    
    
    var userName = localStorage.getItem("userName")
    if (userName != null) {
        $('#startPage').hide();
        $('#userName').text(userName+"!");
    }
    
    $('textarea').bind("enterKey",function(e){
        userName = $('textarea').val();
        $('#startPage').fadeOut(350);
        $('body').fadeIn(350);
        
        if(typeof(Storage) !== "undefined") {
            localStorage.setItem("userName", userName);
        }
        
        $('#userName').text(userName);
        
        
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
    
    createClock();
}

$(document).ready(main);