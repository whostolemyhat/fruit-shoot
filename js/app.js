$(document).ready(function() {
    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');

    var cannon = new Image();
    cannon.src = 'img/cannon.png';
    cannon.onload = function() {
        ctx.drawImage(cannon, 0, 0, cannon.width, cannon.height);
    }

    var score = 0;
    var raspberries = 0;

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        }
    }

    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        console.log("Mouse: " + mousePos.x + ', ' + mousePos.y);
    });

    // falling fruit
    var Fruit = function() {
        this.x = 10;
        this.y = 0;
        
        this.init = function() {

        }
    }

    // fire on mouse click
    // function getPointerPos(canvas, evt) {
    //     var rect = canvas.getBoundingClientRect();
    //     return {
    //         x: evt.clientX - rect.left,
    //         y: evt.clientY - rect.top
    //     }
    // }

    // $(canvas).bind('click tap', function(evt) {
    //     var pointerPos = getPointerPos(canvas, evt);
    //     player.shoot();
    //     evt.preventDefault();
    // });
    
});
