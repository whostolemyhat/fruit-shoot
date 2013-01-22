$(document).ready(function () {
    var CANVAS_WIDTH = 600;
    var CANVAS_HEIGHT = 480;

    $('<canvas id="canvas" width="' + CANVAS_WIDTH + '" height="' + CANVAS_HEIGHT + '"></canvas>').appendTo('body');

    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');

    function circle(x, y, radius, colour) {
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI*2, false);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#2e2';
        ctx.stroke();
    }

    var player = {
        x: 0,
        y: (canvas.height / 2),
        colour: '#00A',
        width: 32,
        height: 32,
        draw: function() {
            ctx.fillStyle = this.colour;
            ctx.fillRect(this.x, this.y - (this.height / 2), this.width, this.height);
        },
        shoot: function() {
            var projectilePosition = this.midpoint();

            projectiles.push(Projectile({
                speed: 8,
                x: projectilePosition.x,
                y: projectilePosition.y
            }));
        },
        midpoint: function() {
            return {
                x: this.x + this.width/2,
                y: this.y
            };
        }
    };

    var projectiles = [];
    var enemies = [];

    function Projectile(P) {
        P.active = true;
        P.xVelocity = P.speed;
        P.yVelocity = 0;
        P.radius = 5;
        P.colour = '#afa';

        P.inBounds = function() {
            return P.x >= 0 && P.x <= CANVAS_WIDTH && P.y >= 0 && P.y <= CANVAS_HEIGHT;
        };

        P.draw = function() {
            circle(P.x, P.y, P.radius, P.colour);
        };

        P.update = function() {
            P.x += P.xVelocity;
            P.y += P.yVelocity;

            P.active = P.active && P.inBounds();
        }

        return P;
    }

    function Enemy(E) {
        E = E || {};

        E.active = true;
        E.age = Math.floor(Math.random() * 128);
    }

    function getPointerPos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        }
    }

    $(canvas).bind('click tap', function(evt) {
        var pointerPos = getPointerPos(canvas, evt);
        player.shoot();
        evt.preventDefault();
    });

    
    function update() {
        projectiles.forEach(function(projectile) {
            projectile.update();
        });
        projectiles = projectiles.filter(function(projectile) {
            return projectile.active;
        });
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        player.draw();
        projectiles.forEach(function(projectile) {
            projectile.draw();
        });
    }


    // pattern from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
    var FPS = 30;
    setInterval(function() {
        update();
        draw();
    }, 1000 / FPS);
});

// var Player = function(canvas, context) {
//     var player = new Image();
//     player.src = '/images/cannon.png';

//     player.onload = function() {
//         context.drawImage(player, 0, (canvas.height / 2) - (player.height / 2), player.width, player.height);
//     }
// }

// var Enemy = function(canvas, context) {
//     var enemy = new Image();
//     enemy.src = '/images/bat.png';

//     var enemyY = Math.floor(Math.random() * canvas.height) - enemy.height;
//     console.log(enemyY);

//     enemy.onload = function() {
//         context.drawImage(enemy, canvas.width - 50, enemyY, enemy.width, enemy.height);
//     }
// }