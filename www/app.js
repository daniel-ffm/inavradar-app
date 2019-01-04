// ----------------------------------------------------------------------------- Shortcuts
var $ = function(id) { return document.getElementById(id); };
var C = function(tag) { return document.createElement(tag); };
// ----------------------------------------------------------------------------- Settings
var currSet;
var rStatus = {
  "FC":"",
  "Name":"",
  "Arm state":"",
  "GPS":""
}
var rSettings = [{
  "cat": "General",
    "sub": [{
    "name": "Disable Bluetooth on arm",
    "cmd": "config btarm %",
    "clitext": "xxx",
    "value": "",
    "options": [{ "name": "onoff" }]
    },{
    "name": "UAV timeout",
    "cmd": "config uavtimeout %",
    "value": "",
    "options": [{ "name": "number" }]
    }]
  },{
  "cat": "Lora",
  "sub": [{
    "name": "Frequency",
    "cmd": "config loraFreq %",
    "clitext": "xxx",
    "value": "",
    "options": [
      { "name": "433 MHz", "value": 433000000 },
      { "name": "868 MHz", "value": 868000000 },
      { "name": "915 MHz", "value": 915000000 }]
    }, {
    "name": "Bandwidth",
    "cmd": "config loraBandwidth %",
    "clitext": "xxx",
    "value": "",
    "options": [
      { "name": "250 kHz", "value": 250000 },
      { "name": "62.8 kHz", "value": 62800 },
      { "name": "7.8 kHz", "value": 7800 }]
    }, {
    "name": "Spreading factor",
    "cmd": "config loraSpread %",
    "value": "",
    "options": [
      { "name": "7", "value": 7 },
      { "name": "8", "value": 8 },
      { "name": "9", "value": 9 },
      { "name": "10", "value": 10 },
      { "name": "11", "value": 11 },
      { "name": "12", "value": 12 }]
  }]
},{
  "cat": "Debugging",
  "sub": [{
    "name": "Debug output",
    "cmd": "debug",
    "value": "",
    "options": [{ "name": "onoff" }]
  }, {
    "name": "Local fake UAVs",
    "cmd": "localfakeplanes",
    "value": "",
    "options": [{ "name": "onoff" }]
  },{
    "name": "Radio fake UAVs",
    "cmd": "radiofakeplanes",
    "value": "",
    "options": [{ "name": "onoff" }]
  },{
    "name": "Move fake UAVs",
    "cmd": "movefakeplanes",
    "value": "",
    "options": [{ "name": "onoff" }]
  }]
},{
  "cat": "App",
  "sub": [{
    "name": "Select radio module",
    "value": "",
    "options": []
    },{
    "name": "About",
    "value": "Version 0.1",
    "options": [
      { "name": "Developed by" },
      { "name": "Daniel Heymann" },
      { "name": "dh@iumt.de" }]
  }]
}];
// ----------------------------------------------------------------------------- Phonon UI
phonon.options({
  navigator: {
    defaultPage: 'home',
    animatePages: true
  },
  i18n: null
});
var navi = phonon.navigator();
navi.on({
  page: 'home',
  preventClose: false,
  content: null
});
navi.on({
  page: 'suboptions',
  preventClose: false,
  content: null
}, function(activity) {
  activity.onReady(function() {
    $("subtitle").textContent = currSet.name;
    var list = C('ul');
    list.className = 'list';
    currSet.options.forEach(function(option,i) {
      var opli = C("li");
      var a = C("a");
      a.className = "padded-list";
      a.textContent = option.name;
      opli.appendChild(a);
      list.appendChild(opli);
    })
    $('subcontent').innerHTML = ''
    $('subcontent').appendChild(list);
  });
});
navi.on({
  page: 'radiosettings',
  preventClose: false,
  content: null
}, function(activity) {
  activity.onReady(function() {
    $('slist').innerHTML = '';
    rSettings.forEach(function (cat,i) {
      var li = C("li");
      li.className = "divider";
      li.textContent = cat.cat;
      slist.appendChild(li);
      cat.sub.forEach(function (sub,i) {
        var span = C("span");
        span.className = "pull-right";
        span.style.width = "100px";
        span.textContent = sub.value;
        var a = C("a");
        a.className = "padded-list";
        a.textContent = sub.name;
        a.on('click', function (ev)  {
          var cset = sub;
          currSet = cset;
          navi.changePage('suboptions');
        });
        var opli = C("li");
        opli.appendChild(span);
        opli.appendChild(a);
        $('slist').appendChild(opli);
      });
    });
  });
  activity.onClose(function(self) {

  });
});
// ----------------------------------------------------------------------------- Status update
var displayStatus = function(message) {
  var display = $("status"), // the message div
    lineBreak = document.createElement("br"), // a line break
    label = document.createTextNode(message); // create the label

  display.appendChild(lineBreak); // add a line break
  display.appendChild(label); // add the message node
}
var clearStatus = function() {
  var display = $("status");
  display.innerHTML = "";
}
// ----------------------------------------------------------------------------- Bluetooth UI
var macAddress;
var listPorts = function() {
  // list the available BT ports:
  bluetoothSerial.list(
    function(results) {
      //displayStatus(JSON.stringify(results));
      $('dlist').innerHTML = '';
      var li = C("li");
      li.className = "divider";
      li.textContent = "Select a radio module";
      $('dlist').appendChild(li);
      var devices = 0;
      results.forEach(function(result,i) {
        if (result.class == 272) {
          var span = C("span");
          span.className = "pull-right";
          span.style.width = "100px";
          if (result.address.split(':')[0] == 'B4' && result.address.split(':')[1] == 'E6') span.textContent = "ESP32";
          else span.textContent = "?";
          var a = C("a");
          a.className = "padded-list";
          a.textContent = result.name;
          a.on('click', function (ev)  {
            var cres = result;
            macAddress = result.address;
            bluetoothSerial.isConnected(disconnect, connect);
          });
          var opli = C("li");
          opli.appendChild(span);
          opli.appendChild(a);
          $('dlist').appendChild(opli);
          devices++;
        }
      });
      if (devices == 0) {
        displayStatus("No module found. Make sure it's paired!");
        $('btstatus').classList.remove('hidden');
        $('dlist').classList.add('hidden');
      }
      else {
        $('btstatus').classList.add('hidden');
        $('dlist').classList.remove('hidden');
      }
    },
    function(error) {
      displayStatus(JSON.stringify(error));
    }
  );
}
// if isEnabled returns failure, this function is called:
var notEnabled = function() {
  clearStatus();
  displayStatus("Bluetooth is not enabled.");
  $('btstatus').classList.remove('hidden');
  $('dlist').classList.add('hidden');
}

// connect() will get called only if isConnected() (below)
// returns failure. In other words, if not connected, then connect:
var connect = function() {
  // if not connected, do this:
  // clear the screen and display an attempt to connect
  clearStatus();
  $('btstatus').classList.remove('hidden');
  $('dlist').classList.add('hidden');
  displayStatus("Attempting to connect. " +
    "Make sure the module is powered on.");
  // attempt to connect:
  bluetoothSerial.connect(
    macAddress, // device to connect to
    openPort, // start listening if you succeed
    showError // show the error if you fail
  );
};

// disconnect() will get called only if isConnected() (below)
// returns success  In other words, if  connected, then disconnect:
var disconnect = function() {
  $('btstatus').classList.remove('hidden');
  $('dlist').classList.add('hidden');
  displayStatus("attempting to disconnect");
  // if connected, do this:
  bluetoothSerial.disconnect(
    closePort, // stop listening to the port
    showError // show the error if you fail
  );
};

/*
subscribes to a Bluetooth serial listener for newline
and changes the button:
*/
var timer;
var openPort = function() {
  // if you get a good Bluetooth serial connection:
  displayStatus("Connected to: " + macAddress);
  // change the button's name:
  $('connectButton').classList.add("icon-sync");
  $('connectButton').classList.remove("icon-sync-problem");
  bluetoothSerial.subscribe('> ', function(data) {
    var lines = data.split('\n');
    lines.forEach(function (line, i) {
      if (line.split(':').length > 1 && lines[0] == 'status') rStatus[line.split(':')[0].trim()] = line.split(':')[1].trim() ;
    })
    $('rstatus').classList.remove('hidden');
    $('btstatus').classList.add('hidden');

  });
  bluetoothSerial.write("status\n",function (result) {},function (error) {displayStatus(error);});
  window.clearInterval(timer);
  timer = window.setInterval(function () {
    clearStatus();
    bluetoothSerial.write("status\n",function (result) {},function (error) {displayStatus(error);});
  }, 5000);
}

  /*
  unsubscribes from any Bluetooth serial listener and changes the button:
  */
var closePort = function() {
  // if you get a good Bluetooth serial connection:
  displayStatus("Disconnected from: " + macAddress);
  // change the button's name:
  $('connectButton').classList.add("icon-sync-problem");
  $('connectButton').classList.remove("icon-sync");
  // unsubscribe from listening:
  bluetoothSerial.unsubscribe(
    function(data) {
      displayStatus(data);
    },
    showError
  );
}
  /*
   appends @error to the message div:
  */
var showError = function(error) {
  displayStatus(error);
}
// ----------------------------------------------------------------------------- Cordova, init BT
var app = {
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    document.addEventListener('resume', this.resume.bind(this), false);
  },
  onDeviceReady: function() {
    navi.start()
    document.querySelector('#connectButton').addEventListener('click', function (ev) {
      bluetoothSerial.isEnabled(listPorts, notEnabled);
    });
    bluetoothSerial.isEnabled(listPorts, notEnabled);
  },
  resume: function () {
    bluetoothSerial.isEnabled(listPorts, notEnabled);
  }
};
app.initialize();
//var radioDialog = phonon.dialog('#radio-dialog');
