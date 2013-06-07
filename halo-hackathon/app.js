
var halo = require('./lib/api/halo').connect('localhost', 1314);
var loop = require('./lib/loop');

// Framerate:
var speed = 1000 / 30;

//
var timer = 0;
var animationTimer = 0;
var coeffTimer = 0;
var animation_duration = 6000 // 6 seconds
var animation_index    = 0;
var y, x = 0;
var lastTime = 0.;

loop( function (time) {

  time = Math.floor(time*0.1)*10;
  var timeElapsed = time - lastTime;
  lastTime = time;
  animationTimer += timeElapsed;

  if (animationTimer > animation_duration) {
    console.log("animation change", time);
    animationTimer = 0;
    animation_index++;
    animation_index %= 8;
  }

  coeffTimer = animationTimer / animation_duration;

  switch (animation_index) {
    case 0:
      for (y = 0; y < 6; y++) {
        halo.controlHalo(parseInt(12 * ((y % 2) > 0 ? coeffTimer : 1 - coeffTimer)), y, {r:1.0, g:0.0, b:0.0}, 0.4);
        halo.controlHalo(parseInt(12 * ((y % 2) > 0 ? coeffTimer - 0.2 : 1 - coeffTimer + 0.2)), y, {r:0.0, g:0.0, b:0.0}, 0.4);
      }
      break;
    case 2:
      for(y = 0; y < 6; y++) {
        for(x = 0; x < 12; x++) {
          halo.controlLED(x, y, parseInt(coeffTimer * (x + 1) * (y + 1) * 2.) % 31, {r:1.0, g:0.0, b:1.0}, 0.2);
          halo.controlLED(x, y, parseInt((coeffTimer - 0.1) * (x + 1) * (y + 1) * 2.) % 31, {r: 0.0, g:0.0, b:0.0}, 0.2);
        }
      }
      break;
    case 3:
      halo.controlColumn(parseInt(Math.sin(coeffTimer * Math.PI) * 12.0), {r:0.0, g:1.0, b:0.0}, 1.0);
      coeffTimer -= 0.2;
      halo.controlColumn(parseInt(Math.sin(coeffTimer * Math.PI) * 12.0), {r:0.0, g:0.0, b:0.0}, 1.0);
      break;
    case 4:
      halo.controlRow(parseInt(Math.sin(coeffTimer * Math.PI) * 6.0), {r:0.0, g:0.0, b:1.0}, 1.0);
      coeffTimer -= 0.2;
      halo.controlRow(parseInt(Math.sin(coeffTimer * Math.PI) * 6.0), {r:0.0, g:0.0, b:0.0}, 1.0);
      break;
    case 6:
      halo.controlArea(0.5, 0.0, 1.7 * coeffTimer, {r:0.0, g:1.0, b:1.0}, 0.0);
      break;
    case 1:
    case 5:
    case 7:
      for(var i = 0; i < 6; i++) {
        halo.controlRow(i, {r:0.0, g:0.0, b:0.0}, 1.0);
      }
      animationTimer = animationTimer < 1. ? animation_duration - 1.0 : animationTimer;
      break;
  }
}, speed);