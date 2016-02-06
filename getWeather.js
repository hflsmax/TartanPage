

function putOnWeather() {
    $(document).ready(function() {
        $.simpleWeather({
            location: 'Pittsburgh, PA',
            woeid: '',
            unit: 'f',
            success: function(weather) {
                html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
                html += '<ul><li>'+weather.city+', '+weather.region+'</li>';
                html += '<li class="currently">'+weather.currently+'</li>';
                html += '<li>'+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+'</li></ul>';
                $("#weather").html(html);
                var hilo = [weather.high, weather.low]
                return getCur(hilo)
            },
            error: function(error) {
                $("#weather").html('<p>'+error+'</p>');
            }
        })
    })
}

function getCur(hilo) {
    $.ajax({
        url: "http://api.wunderground.com/api/1205bbca123028ac/conditions/q/PA/Pittsburgh.json",
        success: function(data) {
            var cur = [data.current_observation.weather, data.current_observation.temp_f]
            return getDaily(hilo, cur)
        }
    })
}

function getDaily(hilo, cur) {
    $.ajax({
        url: "http://api.wunderground.com/api/1205bbca123028ac/forecast/q/PA/Pittsburgh.json",
        success: function(data) {
            //Each list represents a day. Each sublist represents weather code, hi, lo, and cur temp(for today).
            var lst = [[cur[0], hilo[0], hilo[1], cur[1]]]
            for (var i = 1; i < 4; i++) {
                var x = data.forecast.simpleforecast.forecastday[i]
                lst.push([x.conditions, x.high.fahrenheit, x.low.fahrenheit])
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
            for (var i = data.hourly_forecast[0].FCTTIME.hour; i < 24; i++) {
                hLst.push([data.hourly_forecast[i].condition])
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
    console.log([lst, hLst])
    var dailyContainer = document.getElementById('dailyContainer');
    var ulDaily = document.createElement('ul');

    dailyContainer.appendChild(ulDaily);
    lst.forEach(renderDailyList);

    function renderDailyList(ele, ind, arr) {
        if (ind == 0) {
            var dayName = "Today";
        } else {
            var dayName = days[(getDay()+ind) % 7];
        }
        var li = document.createElement('li');
        var day = document.createElement('div');
        day.innerHTML = dayName;

        var weather = document.createElement('div');
        weather.innerHTML = ele[0];
        console.log(ele[0]);

        var lo = document.createElement('div');
        lo.innerHTML = ele[1];

        var hi = document.createElement('div');
        hi.innerHTML = ele[2];

        li.appendChild(day);
        li.appendChild(weather);
        li.appendChild(lo);
        li.appendChild(hi);
        ulDaily.appendChild(li);
    }

    var hourlyContainer = document.getElementById('hourlyContainer');
    var ulHourly = document.createElement('ul');
    hourlyContainer.appendChild(ulHourly);
    hLst.forEach(renderHourlyList);

    function renderHourlyList(ele, ind, arr) {
        var li = document.createElement('li');
        var weather = document.createElement('div');
        weather.innerHTML = ele[0];

        li.appendChild(weather);
        ulHourly.appendChild(li);
    }
}

window.onload = function() {
    putOnWeather();
}
