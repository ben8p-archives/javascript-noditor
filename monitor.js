var express = require('express'),
	io = require('socket.io'),
	cpuUsage = require('cpu-usage'),
	mysqlInfo = require('mysqlinfo'),
	nginxInfo = require('nginxinfo'),
	cpuinfo = require('cpuinfo'),
	memInfo = require('meminfo'),
	loadavg = require('loadavg'),
	app = exports.app = express(),
	toMb = function(kb) {
		return Math.round(+kb * 0.000976563);
	},
	delay = 1000,
	ioListen = null,
	cpuLoad = 0,
	count = 0,
	mysqlData = {},
	nginxData = {},
	loadavgData = {},
	cpuData = [],
	previous = null,
	sqlUser = 'test';

exports.setServer = function(server) {
	ioListen = io.listen(server);
	
	app.use(express.static(__dirname + '/public'));

	mysqlInfo.on('update', function(d) { mysqlData = d; });
	mysqlInfo.update(sqlUser);
	
	nginxInfo.on('stats', function(d) { nginxData = d; });
	nginxInfo.fetch();
	
	loadavg.on('update', function(d) { loadavgData = d; });
	loadavg.update();
	
	cpuinfo.on('update', function(d) { cpuData = d; });
	cpuinfo.update();

	ioListen.sockets.on('connection', function (socket) {
		var finalFetch = function () {
			memInfo(function (err, data) {
				var o = {
						hardware: {
							memTotal: data.MemTotal || 0, //kb
							memFree: data.MemFree || 0, //kb
							memCached: data.Cached || 0, //kb
							memSwap: data.SwapCache || 0, //kb
							cpuLoad: cpuLoad,
							cpuInfo: cpuData,
							loadAvg: loadavgData
						},
						mysql: mysqlData,
						nginx: nginxData
					},
					send = true;
				if(previous) {
					/*console.log("cpuLoad", Math.abs(+previous.hardware.cpuLoad - +cpuLoad) < 2);
					console.log("loadAvg", Math.abs(+previous.hardware.loadAvg.one - +loadavgData.one));
					console.log("threads", +previous.mysql.threads === +mysqlData.threads);
					console.log("slowQueries", +previous.mysql.slowQueries === +mysqlData.slowQueries);
					console.log("memFree", Math.abs(toMb(+previous.hardware.memFree - +data.MemFree))  < 10);
					console.log("memSwap", toMb(+previous.hardware.memSwap - (+data.SwapCache || 0) ), Math.abs(toMb(+previous.hardware.memSwap - +data.SwapCache))  < 10);
					console.log("memCached", Math.abs(toMb(+previous.hardware.memCached - +data.Cached))  < 10);*/
					if(
						(Math.abs(+previous.hardware.cpuLoad - +cpuLoad) < 2) //diff = less than 2%
						&& (Math.abs(+previous.hardware.loadAvg.one - +loadavgData.one) < 0.1) //diff = less than 0.1
						&& (+previous.mysql.threads === +mysqlData.threads ) //no diff
						&& (+previous.mysql.slowQueries === +mysqlData.slowQueries) //no diff
						&& (Math.abs(toMb(+previous.hardware.memFree - +data.MemFree))  < 10) //diff = less than 10Mb
						&& (Math.abs(toMb(+previous.hardware.memCached - +data.Cached))  < 10) //diff = less than 10Mb
						&& (Math.abs(toMb(+previous.hardware.memSwap - (+data.SwapCache || 0)))  < 10) //diff = less than 10Mb
					) {
						//console.log("do not send");
						send = false;
					}
				}
				count++;
				if(count > 5) {
					count = 0;
					send = true;
				}
				
				if(send) {
					socket.emit('update', o);
					previous = o;
				}
			});
		};

		cpuUsage(delay, function(load) {
			cpuLoad = load;
			mysqlInfo.update(sqlUser);
			nginxInfo.fetch();
			loadavg.update();
			finalFetch();
		});
		//socket.on('disconnect', function () {});
	});
}
