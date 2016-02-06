function main() {

    function getHilo() {
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
                    getCur(hilo)
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
                getDaily(hilo, cur)
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
                getHourly(lst)
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
                finish(lst, hLst)
            }
        })
    }

    function finish(lst, hLst) {
        return (lst, hLst)
    }

    getHilo()

}