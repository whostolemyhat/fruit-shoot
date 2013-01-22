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

    function collides(a, b) {
      return a.x < b.x + b.width &&
             a.x + a.width > b.x &&
             a.y < b.y + b.height &&
             a.y + a.height > b.y;
    }

    function handleCollisions() {
        projectiles.forEach(function(projectile) {
            enemies.forEach(function(enemy) {
                console.log(projectile.x, projectile.width);
                if(collides(projectile, enemy)) {
                    console.log('collision');
                    enemy.explode();
                    projectile.active = false;
                }
            });
        });

        enemies.forEach(function(enemy) {
            if(collides(enemy, player)) {
                enemy.explode();
                player.explode();
            }
        });
    }

    var player = {
        x: 0,
        y: (canvas.height / 2),
        colour: '#00A',
        width: 32,
        height: 32,
        draw: function() {
            ctx.fillStyle = this.colour;
            ctx.fillRect(this.x, this.y, this.width, this.height);
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
                x: this.x + this.width / 2,
                y: this.y + this.height / 2
            };
        },
        explode: function() {
            $('body').append('Game Over!');
            window.clearTimeout(play);
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
        // need for collision detection
        P.width = P.radius;
        P.height = P.radius;
        

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

        E.colour = '#a2b';

        E.x = CANVAS_WIDTH;
        E.y = CANVAS_HEIGHT / 4 + Math.random() * CANVAS_HEIGHT / 2;
        E.xVelocity = 2;
        E.yVelocity = 0;
        E.width = 32;
        E.height = 32;

        E.inBounds = function() {
            return E.x >= 0 && E.x <= CANVAS_WIDTH && E.y >= 0 && E.y <= CANVAS_HEIGHT;
        };

        E.draw = function() {
            ctx.fillStyle = E.colour;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        };

        E.update = function() {
            E.x -= E.xVelocity;
            E.y += E.yVelocity;

            E.yVelocity = 3 * Math.sin(E.age * Math.PI / 64);

            E.age++;

            E.active = E.active && E.inBounds();
        };

        E.explode = function() {
            this.active = false;
        }

        return E;
    }

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

    
    function update() {
        if(keydown.space) {
            // prevent spamming
            if(projectiles.length < 6) {
                player.shoot();
            }
            // ignore if key held down
            keydown.space = false;
        }

        if(keydown.up) {
            player.y -= 5;
        }
        if(keydown.down) {
            player.y += 5;
        }

        if(player.y <= 0) {
            player.y = 0;
        }
        if(player.y >= CANVAS_HEIGHT - player.height) {
            player.y = CANVAS_HEIGHT - player.height;
        }

        projectiles.forEach(function(projectile) {
            projectile.update();
        });
        projectiles = projectiles.filter(function(projectile) {
            return projectile.active;
        });

        enemies.forEach(function(enemy) {
            enemy.update();
        });
        enemies = enemies.filter(function(enemy) {
            return enemy.active;
        });
        if(Math.random() < 0.1) {
            enemies.push(Enemy());
        }

        handleCollisions();
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        player.draw();
        
        projectiles.forEach(function(projectile) {
            projectile.draw();
        });

        enemies.forEach(function(enemy) {
            enemy.draw();
        });
    }


    // pattern from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
    var FPS = 30;
    var play = setInterval(function() {
        update();
        draw();
    }, 1000 / FPS);
});
