function getDay() {
	return 1;
}

function getTime() {
	return {
		hour: 1,
		min: 55
	}
}

function getDining(){
	diningInfo = [];
	$.ajax({
		url: 'http://apis.scottylabs.org/dining/v1/locations',
		success: function(json) {
			day = getDay();
			time = getTime();
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

			for (index in json.locations) {

				place = json.locations[index];
				opTime = place.times[day-1];
				startDiff = timeDiff(time, opTime.start);
				endDiff = timeDiff(time, opTime.end);
				startDiffMin = toMin(startDiff);
				endDiffMin = toMin(endDiff);


				function formatMin(x) {
					if (x == 0) return "00";
						else return ""+x;
				}

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
			console.log(diningInfo);
		}
	})
}


getDining()