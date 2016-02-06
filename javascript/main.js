/*jslint browser: true*/
/*global $, jQuery, alert*/

function main() {
    'use strict';
    
    var newDate, curMin, curHour, month, curDay, year;
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
        curMin = newDate.getMinutes();
        curHour = newDate.getHours();
        month = newDate.getMonth();
        curDay = newDate.getDay();
        year = newDate.getFullYear();
        
        
        $('#time').text(doubleDigit(curHour) + ":" + doubleDigit(curMin));
        $('#date').text(months[month-1] + " " + curDay + ithsX(curDay) + ", " + year);
        
        updateDiningOptions();
        
        var timer = setTimeout(function () {
            createClock();
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
    
    
    
    /**************************************/
    /********** Dining Services ***********/
    /**************************************/

    
    
    function getDay() {
	return 1;
    }

    function getTime() {
        return {
            hour: 1,
            min: 55
        }
    }

    function updateDiningOptions(){
        var diningInfo = [];
        $.ajax({
            url: 'http://apis.scottylabs.org/dining/v1/locations',
            success: function(json) {
                var day = getDay();
                var time = getTime();
                function timeDiff(t1, t2) {
                    var time = {
                        hour: t1.hour - t2.hour,
                        min: t1.min - t2.min
                    };
                    if (time.min < 0) {
                        time.hour--;
                        time.min += 60;
                    }
                    return time;
                }
                function toMin(t) {
                    return t.hour*60 + t.min;
                }

                for (var index in json.locations) {

                    var place = json.locations[index];
                    var opTime = place.times[day-1];
                    var startDiff = timeDiff(time, opTime.start);
                    var endDiff = timeDiff(time, opTime.end);
                    var startDiffMin = toMin(startDiff);
                    var endDiffMin = toMin(endDiff);

                    function formatMin(x) {
                        if (x == 0) return "00";
                            else return ""+x;
                    }

                    var message, rank;

                    if (opTime.start.hour < opTime.end.hour) {
                        if (-60 <= startDiffMin && startDiffMin < 0) {
                            message = "Opening in" + startDiffMin + "min"
                            rank = 1;
                        } else if (-60 <= endDiffMin && endDiffMin < 0) {
                            message = "Closing in" + endDiffMin + "min";
                            rank = 2;
                        } else if (startDiffMin < -60) {
                            message = "Opening at " + opTime.start.hour + ":" + formatMin(opTime.start.min);
                            rank = 3;
                        } else if (endDiffMin >= 0 || startDiffMin < 0) {
                            message = "Closed"
                            rank = 4;
                        } else {
                            message = "Opening";
                            rank = 0;
                        }
                    } else {
                        if (-60 <= startDiffMin && startDiffMin < 0) {
                            message = "Opening in" + startDiffMin + "min"
                            rank = 1;
                        } else if (-60 <= endDiffMin && endDiffMin < 0) {
                            message = "Closing in" + endDiffMin + "min";
                            rank = 2;
                        } else if (endDiffMin > 0 && startDiffMin < -60) {
                            message = "Opening at" + opTime.start.hour + ":" + formatMin(place.strat.min);
                            rank = 3;
                        } else if (endDiffMin > 0 && startDiffMin < 0) {
                            message = "Closed"
                            rank = 4;
                        } else {
                            message = "Opening";
                            rank = 0;
                        }
                    }
                    diningInfo.push({
                        name: place.name,
                        message: message,
                        rank: rank,
                        open: opTime.start,
                        close: opTime.end
                    })

                }
                putOnDiningOption(diningInfo);
            }
        })
    }

    function putOnDiningOption(diningInfo) {
        var container = document.getElementById('diningContainer');
        // Remove old dom elements
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        var ul = document.createElement('ul');
        ul.setAttribute('class', 'diningOptions');

        container.appendChild(ul);
        diningInfo.forEach(renderBusList);

        function renderBusList(ele, ind, arr) {
            var li = document.createElement('li');
            li.setAttribute('class', 'rank'+ele.rank);

            var name = document.createElement('div');
            name.setAttribute('class', 'place');
            name.innerHTML = ele.name;
            var time = document.createElement('div');
            time.setAttribute('class', 'message');
            time.innerHTML = ele.message;
            li.appendChild(name);
            li.appendChild(time);

            ul.appendChild(li);
        }
        
    }
    
    createClock();
}

$(document).ready(main);