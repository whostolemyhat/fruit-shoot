$(document).ready(function () {
    var CANVAS_WIDTH = 600;
    var CANVAS_HEIGHT = 480;

    $('<canvas id="canvas" width="' + CANVAS_WIDTH + '" height="' + CANVAS_HEIGHT + '"></canvas>').appendTo('body');

    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');

    // game state - wave of enemies or boss
    var state = 'wave';
    var projectiles = [];
    var enemyProjectiles = [];
    var enemies = [];
    var powerups = [];
    var count = 0;

    // TODO
    function circle(x, y, radius, colour) {
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI*2, false);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#2e2';
        ctx.stroke();
        ctx.closePath();
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

            if(boss.active) {
                if(collides(projectile, boss)) {
                    boss.hit();
                    projectile.active = false;
                }
            }
        });

        enemyProjectiles.forEach(function(projectile) {
            if(shield.active) {
                if(collides(projectile, shield)) {
                    projectile.active = false;
                    shield.decrease();
                }
            }

            if(collides(projectile, player)) {
                player.hit();
                projectile.active = false;
            }
        });

        enemies.forEach(function(enemy) {
            if(collides(enemy, player)) {
                enemy.explode();
                player.explode();
            }

            // TODO
            if(shield.active) {
                if(collides(enemy, shield)) {
                    enemy.explode();
                    shield.decrease();
                }
            }
            
        });

        // TODO
        powerups.forEach(function(powerup) {
            if(collides(powerup, player)) {
                powerup.collect();
                shield.activate();
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
        hp: 3,
        // powerupActive: false,
        // powerupName: '',
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
        recharging: function() {
            console.log('recharging!');
        },
        midpoint: function() {
            return {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2
            };
        },
        explode: function() {
            $('body').append('Game Over! Score: ' + this.score);
            end();
        },
        powerup: function(powerup) {
            this.powerupName = powerup;
            this.powerupActive = true;
        },
        hit: function() {
            console.log('ow!');
            this.hp--;
            if(this.hp <= 0) {
                $('body').append('You lose!');
                end();
            }
        }
    };

    var shield = {
        active: false,
        x: player.x,
        y: player.y,
        width: player.width + 10,
        height: player.height * 2,
        radius: player.width,
        colour: '#47e',
        hp: 0,

        draw : function() {
            ctx.beginPath();
            ctx.arc(player.midpoint().x, player.midpoint().y, this.radius, 0, Math.PI*2, false);
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.colour;
            ctx.stroke();
            ctx.closePath();
        },

        update: function() {
            this.x = player.x;
            this.y = player.y - (player.height / 2);
        },
        decrease: function() {
            $('.shield .' + this.hp).remove();
            this.hp--;
            player.score--;
            if(this.hp <= 0) {
                this.explode();
            }
        },
        explode: function() {
            this.active = false;
            this.hp = 2;
        },
        activate: function() {
            this.hp += 2;
            this.active = true;
            $('.hp').remove();
            for(var i = 0; i < this.hp; i++) {
                $('.shield').append('<span class="hp ' + (i + 1) + '"></span>');
            }
        }
    };

    function Projectile(P) {
        P.active = true;
        P.xVelocity = P.speed;
        P.yVelocity = 0;
        P.radius = P.radius || 5;
        P.colour = P.colour || '#afa';
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
        E.width = 20;
        E.height = 20;
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

    var boss = {
        colour: '#e33',
        height: CANVAS_HEIGHT * 0.8,
        width: 100,
        x: CANVAS_WIDTH,
        y: 40,
        active: false,
        hp: 20,
        xVelocity: 2,

        draw: function() {
            ctx.fillStyle = this.colour;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },

        update: function() {
            if(this.x > 500) {
                this.x -= this.xVelocity;
            }
            if(Math.random() < 0.3) {
                this.shoot();
            }
        },
        hit: function() {
            this.hp--;
            console.log(this.hp);
            if(this.hp <= 0) {
                this.explode();
            }
        },
        explode: function() {
            this.active = false;
            $('body').append('You win!');
        },
        shoot: function() {
            var projectilePosition = this.enemyProjectilePosition();

            enemyProjectiles.push(Projectile({
                speed: -12,
                radius: 4,
                x: projectilePosition.x,
                y: projectilePosition.y,
                colour: '#d90a1a'
            }));
        },
        enemyProjectilePosition: function() {
            return {
                x: this.x + this.width / 2,
                y: (Math.random() * this.height) + this.y
            };
        }
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
            if(projectiles.length < 7) {
                player.shoot();
            } else {
                player.recharging();
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

        shield.update();

        projectiles.forEach(function(projectile) {
            projectile.update();
        });
        projectiles = projectiles.filter(function(projectile) {
            return projectile.active;
        });

        enemyProjectiles.forEach(function(projectile) {
            projectile.update();
        });
        enemyProjectiles = enemyProjectiles.filter(function(projectile) {
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
                count++;
            }
            if(Math.random() < 0.01 && powerups.length === 0) {
                powerups.push(Powerup());
            }
        } else if(state == 'boss') {
            boss.update();
        }

        handleCollisions();
        updateScore();
        if(count > 10) {
            state = 'boss';
            boss.active = true;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        player.draw();

        if(shield.active) {
            shield.draw();
        }
        
        projectiles.forEach(function(projectile) {
            projectile.draw();
        });

        enemies.forEach(function(enemy) {
            enemy.draw();
        });

        powerups.forEach(function(powerup) {
            powerup.draw();
        });

        boss.draw();

        enemyProjectiles.forEach(function(projectile) {
            projectile.draw();
        });
        
    }

    function updateScore() {
        $('.score').text(player.score);
    }

    function end() {
        window.clearTimeout(play);
    }

    // pattern from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
    var FPS = 30;
    var play = setInterval(function() {
        update();
        draw();
    }, 1000 / FPS);
});
