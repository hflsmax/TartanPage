function getBustime() {

	$.ajax({
		url: 'http://truetime.portauthority.org/bustime/wireless/html/eta.jsp?route=---&direction=---&displaydirection=---&stop=---&id=4407',
		success: function(text) {
			var busRegex = /<b>#(.*)&nbsp;/g;
			var busNumers = [];
			var busTimes = [];
			while (busStr = busRegex.exec(text)) {
				busNumers.push(busStr[1]);
			}

			
			var busTimeRegex = /<b>(NOW|.*MIN)<\/b>/g;
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
	var ul = document.createElement('ul');
	ul.setAttribute('id', 'morewood');
	ul.setAttribute('class', 'busStop');

	container.appendChild(ul);
	busInfo.forEach(renderBusList);

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

window.onload = function() {
	getBustime();
}

