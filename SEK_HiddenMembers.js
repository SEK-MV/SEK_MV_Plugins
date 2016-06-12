//=============================================================================
// SEK_HiddenMembers.js
//=============================================================================

/*:
* @plugindesc Not fighting members will be behind your fighting members!
* @author SEK
*
*@param Opacity
*@desc Not fighting members opacity. Default is 150.
*@default 150
*
*/

var params=PluginManager.parameters('SEK_HiddenMembers');
var opacità = Number(params['Opacity'] || 150);

Spriteset_Battle.prototype.createActors = function() {
    this._actorSprites = [];
    for (var i = 0; i < 8; i++) {
        this._actorSprites[i] = new Sprite_Actor();
        this._battleField.addChild(this._actorSprites[i]);
    }
};


Spriteset_Battle.prototype.updateActors = function() {
    var members = $gameParty.battleMembers();
    for (var i = 0; i < $gameParty.battleMembers().length; i++) {
        this._actorSprites[i].setBattler(members[i], i, 0);
    }
    
    
    for (var i = $gameParty.battleMembers().length; i < $gameParty.allMembers().length; i++)
    {
        this._actorSprites[i].setBattler($gameParty.hiddenMembers()[i-$gameParty.battleMembers().length],i, 1);
    }
};




Game_Party.prototype.hiddenMembers = function() {
    return this.allMembers().slice(this.maxBattleMembers())
};


Game_Party.prototype.hiddenMembers = function() {
    return this.allMembers().slice(this.maxBattleMembers())
};


Sprite_Actor.prototype.setActorHome = function(index, add) {
    this.setHome(600 + index * 32+(add?40:0), 280 + (add==1?(index-$gameParty.maxBattleMembers())*48:index*48));
};

Sprite_Actor.prototype.setBattler = function(battler, i,add) {
    Sprite_Battler.prototype.setBattler.call(this, battler);
    var changed = (battler !== this._actor);
    if (changed) {
        this._actor = battler;
        if (battler) {
            this.setActorHome(i,add);
        }
        this.startEntryMotion();
        this._stateSprite.setup(battler);
    }
    if (add==1) this.opacity =opacità;
};
