/*
hardware: Object
	cpuLoad: 5
	memCached: "990280"
	memFree: "347036"
	memTotal: "3843356"
mysql: Object
	flushTables: "1"
	openTables: "166"
	opens: "662"
	queryPerSecAvg: "0.010"
	questions: "5177"
	slowQueries: "0"
	threads: "1"
	uptime: "516072"
nginx: Object
	activeConnections: "1"
	activeReadingRequest: "0"
	activeWritingRequest: "1"
	requestAccepts: "1053"
	requestHandled: "1053"
	requestsTotal: "1050"
	waitingRequest: "0"

*/
window.d = {
	byId: function(id) {
		return document.getElementById(id);
	},
	toMb: function(kb) {
		return Math.round(+kb * 0.000976563);
	}
}
window.onload = function() {
 
    var messages = [];
    var socket = io.connect(window.location.origin);
 
    socket.on('update', function (data) {
		console.log(data);
		var classReplace = /(\s*alert)|(\s*warning)|(\s+)/g,
			core = data.hardware.cpuInfo.length,
			l1 = +data.hardware.loadAvg.one,
			l5 = +data.hardware.loadAvg.five,
			l15 = +data.hardware.loadAvg.fifteen,
			inUse =  (100 - (+data.hardware.memFree * 100 / +data.hardware.memTotal));
		d.byId('memoryPercent').style.width = inUse + '%';
		d.byId('memoryPercent').className = d.byId('memoryPercent').className.replace(classReplace, '') + ' ' + (inUse > 80 ? 'warning' : (inUse > 90 ? 'alert' : '') );
		d.byId('memoryFree').innerHTML = d.toMb(data.hardware.memFree);
		d.byId('memoryTotal').innerHTML = d.toMb(data.hardware.memTotal);
		d.byId('memoryCached').innerHTML = d.toMb(data.hardware.memCached);
		d.byId('memorySwap').innerHTML = d.toMb(data.hardware.memSwap);
		
		inUse = +data.hardware.cpuLoad;
		d.byId('cpuPercent').style.width = inUse + '%';
		d.byId('cpuPercent').className = d.byId('cpuPercent').className.replace(classReplace, '') + ' ' + (inUse > 80 ? 'warning' : (inUse > 90 ? 'alert' : '') );
		d.byId('cpuInUse').innerHTML = data.hardware.cpuLoad;
		d.byId('coreCPU').innerHTML = core;
		
		d.byId('loadAvg1').innerHTML = l1;
		d.byId('loadAvg5').innerHTML = l5;
		d.byId('loadAvg15').innerHTML = l15;
		
		inUse = l1 * 100 / core;
		d.byId('loadAvg1').className = d.byId('loadAvg1').className.replace(classReplace, '') + ' ' + (inUse > 70 ? 'warning' : (inUse > 80 ? 'alert' : '') );
		inUse = l5 * 100 / core;
		d.byId('loadAvg5').className = d.byId('loadAvg5').className.replace(classReplace, '') + ' ' + (inUse > 70 ? 'warning' : (inUse > 80 ? 'alert' : '') );
		inUse = l15 * 100 / core;
		d.byId('loadAvg15').className = d.byId('loadAvg15').className.replace(classReplace, '') + ' ' + (inUse > 70 ? 'warning' : (inUse > 80 ? 'alert' : '') );
		
		d.byId('mySqlQueryPerSec').innerHTML = data.mysql.queryPerSecAvg;
		d.byId('mySqlSlowQueries').innerHTML = data.mysql.slowQueries;
		d.byId('mySqlThreads').innerHTML = data.mysql.threads;
		
		d.byId('nginxWaiting').innerHTML = data.nginx.waitingRequest;
		d.byId('nginxActiveWriting').innerHTML = data.nginx.activeWritingRequest;
		d.byId('nginxActiveReading').innerHTML = data.nginx.activeReadingRequest;
		d.byId('nginxActiveConnections').innerHTML = data.nginx.activeConnections;
    });
}
