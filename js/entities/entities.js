game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this.setSuper(x, y);
        this.setPlayerTimers();
        this.setAttributes();

        this.type = "PlayerEntity";
        this.setFlags();

        this.dead = false;

        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH),
                this.addAnimation();
        this.renderable.setCurrentAnimation("idle");
    },
    
    setSuper: function(x, y) {
        this._super(me.Entity, 'init', [x, y, {
                image: "player",
                width: 64,
                height: 64,
                spritewidth: "64",
                spriteheight: "64",
                getShape: function() {
                    return(new me.Rect(0, 0, 64, 64)).toPolygon();
                }
            }]);

    },
    
    setPlayerTimers: function() {
        this.now = new Date().getTime();
        this.lastHit = this.now;
        this.lastAttack = new Date().getTime();//havent used this
    },
    
    setAttributes: function() {
        this.health = game.data.playerHealth;
        this.body.setVelocity(game.data.playerMoveSpeed, 20);
    },
    
    setFlags: function() {
        //keeps track of which direction your character is going
        this.facing = "right";
        this.dead = false;
        this.attacking = false;
    },
    
    addAnimation: function() {
        this.renderable.addAnimation("idle", [78]);
        this.renderable.addAnimation("walk", [117, 118, 119, 120, 121, 122, 123, 124, 125], 80);
        this.renderable.addAnimation("attack", [65, 66, 67, 68, 69, 70, 71, 72], 80);
    },
    
    update: function(delta) {
        this.now = new Date().getTime();
        this.dead = this.checkIfDead();
        this.checkKeyPressedAndMove();
        this.setAnimation();
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        this.body.update(delta);
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    checkIfDead: function() {
        if (this.health <= 0) {
            return true;
        }
        return false;
    },
    
    checkKeyPressedAndMove: function() {
        if (me.input.isKeyPressed("right")) {
            this.moveRight();
        } else if (me.input.isKeyPressed("left")) {
            this.moveLeft();
        } else {
            this.body.vel.x = 0;
        }
        if (me.input.isKeyPressed("jump")) {
            this.jump();
        }
        this.attacking = me.input.isKeyPressed("attack");

    },
    
    moveRight: function() {
        //sets the position of mario on the x axis by adding the x value from the setVelocity times the timer tick
        //me.timer.tick uses the time since last animation 
        //this.renderable.setCurrentAnimation("smallWalk");
        this.body.vel.x += this.body.accel.x * me.timer.tick;
        this.facing = "right";
        this.flipX(true);
    },
    
    moveLeft: function() {
        this.body.vel.x -= this.body.accel.x * me.timer.tick;
        this.facing = "left";
        this.flipX(false);
    },
    
    jump: function() {
        this.body.jumping = true;
        this.body.vel.y -= this.body.accel.y * me.timer.tick;
    },
    
    setAnimation: function(){
         if (this.attacking) { 
            if (!this.renderable.isCurrentAnimation("attack")) {
                console.log("attack");
                //Sets the current animation to attack and once that is over
                //goes back to the idle animation
                this.renderable.setCurrentAnimation("attack", "idle");
                //Makes it so the next time we start this sequence we begin
                //from the first animation, not whenever we left off when we
                //switched to another animation
                this.renderable.setAnimationFrame();
            }
        }
        else if (this.body.vel.x !== 0 && !this.renderable.isCurrentAnimation("attack")) {
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
        } else if (!this.renderable.isCurrentAnimation("attack")) {
            this.renderable.setCurrentAnimation("idle");
        }
    },
    
    loseHealth: function(damage) {
        this.health = this.health - damage;
        console.log(this.health);
    },
    
    collideHandler: function(response) {    
        if (response.b.type === 'EnemyBaseEntity') {
            this.collideWithEnemyBase(response);
        } else if (response.b.type === 'EnemyCreep') {
            this.collideWithEnemyCreep(response);
        }
    },
    
    collideWithEnemyTrex: function(response){
            var xdif = this.pos.x - response.b.pos.x;
            var ydif = this.pos.y - response.b.pos.y;

            this.stopMovement(response);
            
            if(this.checkAttack(xdif, ydif)){
              this.hitCreep(response);
            }; 
    },
    
    stopMovement: function(xdif){
        if (xdif > 0) {
                this.pos.x = this.pos.x + 1;
                if (this.facing === "left") {
                    this.body.vel.x = 0;
                }
            } else {
                this.pos.x = this.pos.x + 1;
                if (this.facing === "right") {
                    this.body.vel.x = 0;
                }
            }
    },
    
    checkAttack: function(xdif, ydif){
        if (this.renderable.isCurrentAnimation("attack") && this.now - this.lastHit >= game.data.playerAttackTimer
                    && (Math.abs(ydif) <= 40) &&
                    (((xdif > 0) && this.facing === "left") || ((xdif < 0) && this.facing === "right"))
                    ){
                this.lastHit = this.now;
                
                return true;
            }
            return false;
    },
    
    hitTrex: function(response){
        if(response.b.health <= game.data.playerAttack){
                  //adds one gold for a creep kill
                  game.data.gold +=1;
                  console.log("Current gold: " + game.data.gold);
              }
              
              response.b.loseHealth(game.data.playerAttack);
    }
}); 