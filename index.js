var http = require('http');

var halo = require('./halo-hackathon/lib/api/halo').connect('localhost', 1314);
var loop = require('./halo-hackathon/lib/loop');

var _ = require('underscore');
var moment = require('moment');
var chroma = require('./node_modules/chroma-js/chroma.js');
var RestClient = require('node-rest-client').Client;
var restClient = new RestClient();


// Global vars
var defaultBusStop = '17948'; //'43275'; //17931
var speed = 1000 / 30;
var colorScale = chroma.scale(['#FF0040', '#40FF00']).mode('lab');
var dueScale = chroma.scale(['#0040FF', '#00BFFF']).mode('lab');
var stopColor = '#B3FF99';
var resetColor = { r: 0, g: 0, b: 0 };
var testColor = { r: 255, g: 0, b: 0 };
var blackColor = { r: 0, g: 0, b: 0 };
var busDueIntervals = {};

// Get MSP data on refular interval
mspStopPooler = function() {
  var msp = {};
  
  // Default properties
  msp.pollInterval = 10000;
  msp.busStop = defaultBusStop;
  msp.listenerOn = function() { };
  msp.jsonpTemplate = 'http://svc.metrotransit.org/NexTrip/[[BUSSTOP]]?format=json';
  msp.httpOptions = {
    host: 'svc.metrotransit.org',
    port: 80,
    path: '/NexTrip/[[BUSSTOP]]?format=json'
  };
  
  // Get data from 
  msp.getStopData = function() {
    msp.jsonpTemplate = msp.jsonpTemplate.replace('[[BUSSTOP]]', msp.busStop);
    
    restClient.get(msp.jsonpTemplate, function(data, response) {
      var stop = JSON.parse(data);
      stop = msp.parseStop(stop);
      msp.listenerOn.apply(msp, [stop]);
    });
  };
  
  // Parse stop data
  msp.parseStop = function(stop) {
    stop = _.map(stop, function(s) {
      // /Date(1370124480000-0500)/ (This can't be right)
      s.time = moment(eval(s.DepartureTime.substring(6, s.DepartureTime.length - 2)));
      return s
    });
    stop = _.sortBy(stop, function(s) { return s.time.unix(); });
    
    return stop;
  };
  
  // Set listender
  msp.on = function(listener) {
    msp.listenerOn = listener;
  };
  
  // Start listening
  msp.start = function(busStop) {
    msp.busStop = (busStop) ? busStop : msp.busStop;
    
    // Stop any that may exist
    if (msp.pollID) {
      msp.stop();
    }
    
    // Kick off, then set interval
    msp.getStopData();
    msp.pollID = setInterval(msp.getStopData, msp.pollInterval);
  };
  
  // Stop listening
  msp.stop = function() {
    clearInterval(msp.pollID);
  };
  
  return msp;
};

// Convert chroma object to halo
function chromaToHalo(chromaColor) {
  var rgb = chromaColor.rgb();
  return {
    r: rgb[0] / 255,
    g: rgb[1] / 255, 
    b: rgb[2] / 255
  }
}

// Convert chroma object to halo (weird inputs have different scales)
function chromaToHaloScale(chromaColor) {
  var rgb = chromaColor.rgb();
  return {
    r: rgb[0],
    g: rgb[1], 
    b: rgb[2]
  }
}

// Pool and update halo
function poolMSP() {
  var stopPooler = mspStopPooler();
  var minuteLimit = 20;

  // Pooler listener
  stopPooler.on(function(currentStop) {
    var now = moment();
    var row = 0;
    
    currentStop = _.filter(currentStop, function(b) { return b.Actual; });
    _.each(currentStop, function(bus, b) {
      bus.minutes = moment.duration(bus.time.diff(now)).minutes();
      bus.percentage = 1 - (bus.minutes / minuteLimit);
      
      if (b <= 6) {
        renderBus(bus, b);
      }
    });
  });
  stopPooler.start();
};

// Render bus row
function renderBus(bus, row) {
  var minuteGroups = [22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2];
  console.log(bus.Route + bus.Terminal, bus.minutes, bus.DepartureText);
    
  //bus.DepartureText = 'Due';
    
  // If due
  if (bus.DepartureText.toLowerCase() === 'due') {
    busDue(bus, row);
  }
  else {
    // Clear loop
    if (busDueIntervals[row]) {
      clearInterval(busDueIntervals[row]);
      halo.controlHalo(11, row, blackColor, 0.1);
    }
  
    // Mark stop
    halo.controlHalo(11, row, chromaToHalo(chroma.color(stopColor)), 0.1);
    setTimeout(function() {
      halo.controlHalo(11, row, chromaToHalo(chroma.color(stopColor)), 0.1);
    }, 110);
  }
  
  // Mark bus location    
  _.each(minuteGroups, function(group, i) {
    var next = (minuteGroups[i + 1]) ? minuteGroups[i + 1] : 0;
    
    // Mark
    if (bus.minutes <= group && bus.minutes > next) {
      halo.controlHalo(i, row, chromaToHalo(colorScale(bus.percentage).brighter()), 0.1);
    }
    else {
      // Clear each marker
      halo.controlHalo(i, row, resetColor, 0.1);
    }
  });
}

// Bus is due, so make it cool
function busDue(bus, row) {
  var led = 0;
  halo.controlHalo(11, row, blackColor, 0.1);

  var interval = setInterval(function() {
    //console.log((led % 30), led, chromaToHalo(dueScale((led % 31) / 31).brighter()));
    
    halo.controlLED(11, row, (led % 31) - 1, blackColor, 50);
    halo.controlLED(11, row, (led % 31) - 2, blackColor, 50);
    halo.controlLED(11, row, (led % 31) - 3, blackColor, 50);
    halo.controlLED(11, row, (led % 31), chromaToHaloScale(dueScale((led % 100) / 100).brighter()), 50);
    led++;
  }, 50);
  busDueIntervals[row] = interval;
}

// Start getting data, and reset canvas
halo.controlArea(0.5, 0.0, 1.7, resetColor, 0.0001);
poolMSP()