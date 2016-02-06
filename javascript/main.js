/*jslint browser: true*/
/*global $, jQuery, alert*/
var newDate, curMin, curHour, month, curDay, year;
var bgIndex = -1;
var bgMax = 4;

function main() {
    'use strict';

    var userName = localStorage.getItem("userName");
    
    if (userName !== null) {
        $('#startPage').hide();
        $('#userName').text(userName + "!");
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

    updateClock()
}






    /********************************************/
    /**********    Digital Clock      ***********/
    /*******************************************/



function updateClock() {
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
        $('#date').text(months[month] + " " + curDay + ithsX(curDay) + ", " + year);

    }
    var timer = setTimeout(function () {
        createClock();
    }, 1000);

    var diningTimer = setTimeout(function () {
        updateDiningOptions();
    }, 60000);

    updateDiningOptions();

    
    var busTimer = setTimeout(function () {
        getBustime();
    }, 60000); 
    
    var bgTimer = setInterval(updateBg, 8000);

    updateDiningOptions();
    createClock();
    getBustime();
    putOnWeather();
    updateBg();
}




    /********************************************/
    /**********    Dining Services   ***********/
    /*******************************************/



function getDay() {
return curDay;
}

function getTime() {
    return {
        hour: curHour,
        min: curMin
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
                var opTime = null;
                for (var index in place.times) {
                    if (place.times[index].start.day == day) {
                        opTime = place.times[index];
                    }
                }
                if (opTime === null) {
                    message = "Closed Today";
                    rank = 5;
                } else {
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
                            message = "Opening in" + Math.abs(startDiffMin) + "min"
                            rank = 1;
                        } else if (-60 <= endDiffMin && endDiffMin < 0) {
                            message = "Closing in" + Math.abs(endDiffMin) + "min";
                            rank = 2;
                        } else if (startDiffMin < -60) {
                            message = "Opening at " + opTime.start.hour + ":" + formatMin(opTime.start.min);
                            rank = 3;
                        } else if (endDiffMin >= 0 || startDiffMin < 0) {
                            message = "Closed"
                            rank = 4;
                        } else {
                            message = "Open";
                            rank = 0;
                        }
                    } else {
                        if (-60 <= startDiffMin && startDiffMin < 0) {
                            message = "Opening in" + Math.abs(startDiffMin) + "min"
                            rank = 1;
                        } else if (-60 <= endDiffMin && endDiffMin < 0) {
                            message = "Closing in" + Math.abs(endDiffMin) + "min";
                            rank = 2;
                        } else if (endDiffMin > 0 && startDiffMin < -60) {
                            message = "Opening at" + opTime.start.hour + ":" + formatMin(opTime.start.min);
                            rank = 3;
                        } else if (endDiffMin > 0 && startDiffMin < 0) {
                            message = "Closed"
                            rank = 4;
                        } else {
                            message = "Open";
                            rank = 0;
                        }
                    }
                }
                diningInfo.push({
                    name: place.name,
                    message: message,
                    rank: rank
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
    diningInfo.sort(function(x, y) {
        return x.rank - y.rank;
    })
    diningInfo.forEach(renderDiningList);

    function renderDiningList(ele, ind, arr) {
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


    /********************************************/
    /**********      Bus Services    ***********/
    /*******************************************/

function getBustime() {

	$.ajax({
		url: 'http://cors-anywhere.herokuapp.com/truetime.portauthority.org/bustime/wireless/html/eta.jsp?route=---&direction=---&displaydirection=---&stop=---&id=4407',
        type: 'GET',
		success: function(text) {
			var busRegex = /<b>#(.*)&nbsp;/g;
			var busNumers = [];
			var busTimes = [];
			while (busStr = busRegex.exec(text)) {
				busNumers.push(busStr[1]);
			}


			var busTimeRegex = /<b>(DUE|.*MIN)<\/b>/g;
			while (busStr = busTimeRegex.exec(text)) {
				busTimes.push(busStr[1].replace("&nbsp;", ""))
			}

			busInfo = [];
			for (var i = 0; i < busNumers.length; i++) {
				busInfo.push({
					name: busNumers[i],
					time: busTimes[i]
				})
			}
			putOnBustime(busInfo);
		}
	})
}

function putOnBustime(busInfo) {

	var container = document.getElementById('busContainer');


    // Remove old dom elements
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
	var ul = document.createElement('ul');
	ul.setAttribute('id', 'morewood');
	ul.setAttribute('class', 'busStop');

	container.appendChild(ul);
	busInfo.forEach(renderBusList);

    if (busInfo.length === 0) {
        var li = document.createElement('li');
        li.innerHTML = "No Available Buses";
        ul.appendChild(li);
    }

	function renderBusList(ele, ind, arr) {
		var li = document.createElement('li');
		var name = document.createElement('div');
		name.setAttribute('class', 'bus');
		name.innerHTML = ele.name;
		var time = document.createElement('div');
		time.setAttribute('class', 'time');
		time.innerHTML = ele.time;
		li.appendChild(name);
		li.appendChild(time);

		ul.appendChild(li);
	}

}


   /********************************************/
    /*******        Background       ***********/
    /*******************************************/

function updateBg() {
    if (bgIndex < 0) {
        bgIndex = bgIndex + 1;
    } else {
        bgIndex = bgIndex + 1;
        if (bgIndex > bgMax || bgIndex == bgMax) {
            bgIndex = 0;
        }
        $('.background').fadeOut(600, function() {
            $('.background').attr('src', 'images/background/'+ bgIndex +'.gif');
            $('.background').fadeIn(600);
        });
    }
    
} 


   /********************************************/
    /**********        Weather       ***********/
    /*******************************************/






function putOnWeather() {
    $.ajax({
        url: "http://api.wunderground.com/api/1205bbca123028ac/forecast/q/PA/Pittsburgh.json",
        success: function(data) {
            //Each list represents a day. Each sublist represents weather code, hi, lo, and cur temp(for today).
            var lst = []
            for (var i = 1; i < 4; i++) {
                var x = data.forecast.simpleforecast.forecastday[i]
                lst.push({
                    weekday: x.date.weekday_short,
                    weather: x.conditions, 
                    hi: x.high.fahrenheit, 
                    lo: x.low.fahrenheit, 
                    iconURL: x.icon_url
                })
            }
            return getHourly(lst)
        }
    })
}

function getHourly(lst) {
    $.ajax({
        url: "http://api.wunderground.com/api/1205bbca123028ac/hourly/q/PA/Pittsburgh.json",
        success: function(data) {
            //Each list represents an hour. Each sublist represents weather code, temp.
            var hLst = []
            for (var i = 0; i < 24; i++) {
                var x = data.hourly_forecast[i];
                hLst.push({
                    weather: x.condition,
                    temp: x.temp.english,
                    hour: x.FCTTIME.hour,
                    iconURL: x.icon_url
                })
                
           }
           return updatingWeather(lst, hLst)
        }
    })
}

days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"]

function getDay() {
    return 6;
}

function updatingWeather(lst, hLst) {
    var dailyContainer = document.getElementById('dailyContainer');
    var ulDaily = document.createElement('ul');

    dailyContainer.appendChild(ulDaily);
    lst.forEach(renderDailyList);

    function renderDailyList(ele, ind, arr) {

        var li = document.createElement('li');
        var weekday = document.createElement('div');
        weekday.innerHTML = ele.weekday;

        // var weather = document.createElement('div');
        // weather.innerHTML = ele.weather;

        var lo = document.createElement('div');
        lo.innerHTML = ele.lo;

        var hi = document.createElement('div');
        hi.innerHTML = ele.hi;

        var icon = document.createElement( 'img' );
        icon.setAttribute('src', ele.iconURL);

        li.appendChild(weekday);
        // li.appendChild(weather);
        li.appendChild(lo);
        li.appendChild(hi);
        li.appendChild(icon);
        ulDaily.appendChild(li);
    }

    var hourlyContainer = document.getElementById('hourlyContainer');
    var ulHourly = document.createElement('ul');
    hourlyContainer.appendChild(ulHourly);
    hLst.forEach(renderHourlyList);

    function renderHourlyList(ele, ind, arr) {
        var li = document.createElement('li');

        var hour = document.createElement('div');
        hour.innerHTML = ele.hour + ":00";

        // var weather = document.createElement('div');
        // weather.innerHTML = ele.weather;

        var temp = document.createElement('div');
        temp.innerHTML = ele.temp;

        var icon = document.createElement('img');
        icon.setAttribute('src', ele.iconURL);

        li.appendChild(hour);
        // li.appendChild(weather);
        li.appendChild(temp);
        li.appendChild(icon);

        ulHourly.appendChild(li);
    }
}





$(document).ready(main);
