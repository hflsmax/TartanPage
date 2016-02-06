function getBustime() {

	$.ajax({
		url: 'http://truetime.portauthority.org/bustime/wireless/html/eta.jsp?route=---&direction=---&displaydirection=---&stop=---&id=4407',
		success: function(text) {
			console.log(text)
			var busRegex = /<b>#(.*)&nbsp;/g;
			var busNumers = [];
			var busTimes = [];
			while (busStr = busRegex.exec(text)) {
				busNumers.push(busStr[1]);
			}
			console.log(busNumers);

			
			var busTimeRegex = /<b>(DUE|.*MIN)<\/b>/g;
			while (busStr = busTimeRegex.exec(text)) {
				busTimes.push(busStr[1].replace("&nbsp;", ""))
			}
			console.log(busTimes);

			busInfo = [];
			for (var i = 0; i < busNumers.length; i++) {
				busInfo.push([busNumers[i], busTimes[i]]);
			}
			console.log(busInfo);
			return(busInfo);
		}
	})
}

getBustime();