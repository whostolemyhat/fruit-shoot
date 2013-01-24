$(document).ready(function () {
    var CANVAS_WIDTH = 600;
    var CANVAS_HEIGHT = 480;

    $('<canvas id="canvas" width="' + CANVAS_WIDTH + '" height="' + CANVAS_HEIGHT + '"></canvas>').appendTo('body');

    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');

    // game state - wave of enemies or boss
    var state = 'wave';
    var projectiles = [];
    var enemies = [];
    var powerups = [];

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
                if(collides(projectile, enemy)) {
                    enemy.explode();
                    projectile.active = false;
                    player.score += enemy.points;
                }
            });
        });

        enemies.forEach(function(enemy) {
            if(collides(enemy, player)) {
                enemy.explode();
                player.explode();
            }
        });
        powerups.forEach(function(powerup) {
            if(collides(powerup, player)) {
                powerup.collect();
                player.powerup(powerup.name);
            }
        });
    }

    var player = {
        x: 0,
        y: (canvas.height / 2),
        colour: '#00A',
        width: 32,
        height: 32,
        score: 0,
        powerupActive: false,
        powerupName: '',
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
            $('body').append('Game Over! Score: ' + this.score);
            window.clearTimeout(play);
        },
        powerup: function(powerup) {
            this.powerupName = powerup;
            this.powerupActive = true;
            console.log(powerup);
        }
    };

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
            // circle(P.x, P.y, P.radius, P.colour);
            ctx.fillStyle = P.colour;
            ctx.beginPath();
            ctx.arc(P.x, P.y, P.radius, 0, Math.PI*2, false);
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#2e2';
            ctx.stroke();
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
        E.points = 1;
        E.hp = 1;

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

    function Powerup(U) {
        U = U || {};

        U.name = U.name || 'shield';
        U.colour = '#36d';
        U.x = CANVAS_WIDTH;
        U.y = CANVAS_HEIGHT * Math.random();
        U.xVelocity = 4;
        U.yVelocity = 0;
        U.width = 24;
        U.height = 24;
        U.active = true;

        U.inBounds = function() {
            return U.x >= 0 && U.x <= CANVAS_WIDTH && U.y >= 0 && U.y <= CANVAS_HEIGHT;
        };

        U.draw = function() {
            ctx.fillStyle = U.colour;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#47e';
            ctx.stroke();
        };

        U.update = function() {
            U.x -= U.xVelocity;
            U.y += U.yVelocity;

            U.active = U.active && U.inBounds();
        };

        U.collect = function() {
            this.active = false;
        };

        return U;
    }

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

        powerups.forEach(function(powerup) {
            powerup.update();
        });
        powerups = powerups.filter(function(powerup) {
            return powerup.active;
        });

        if(state == 'wave') {
            if(Math.random() < 0.1) {
                enemies.push(Enemy());
            }
            if(Math.random() < 0.01 && powerups.length === 0) {
                powerups.push(Powerup());
            }
        } else if(state == 'boss') {
            console.log('bossman');
        }

        handleCollisions();
        updateScore();
        if(player.score > 30) {
            state = 'boss';
        }
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

        powerups.forEach(function(powerup) {
            powerup.draw();
        });
        
    }

    function updateScore() {
        $('.score').text(player.score);
    }

    // pattern from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
    var FPS = 30;
    var play = setInterval(function() {
        update();
        draw();
    }, 1000 / FPS);
});
