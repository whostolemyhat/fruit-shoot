var Cannon = function(canvas) {
    var cannon = new Image();
    cannon.src = '/images/cannon.png';
    cannon.onload = function(canvas) {
        canvas.drawImage(cannon, 0, 0, cannon.width, cannon.height);
    }
}