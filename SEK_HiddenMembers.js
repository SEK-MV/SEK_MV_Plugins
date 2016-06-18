//=============================================================================
// SEK_HiddenMembers.js
//=============================================================================

/*:
* @plugindesc Not fighting members will be behind your fighting members!
* @author SEK
*
*@param Opacity
*@desc Not fighting members opacity (from 0 to 255). Default is 150.
*@default 150
*
*@param Style
*@desc Not fighting members display style (from 1 to 4). Default is 1.
*@default 150
*
*@help
* Plugin Commands:
*
* hm opacity x	- 	changes opacity to x (from 0 to 255)
* 			0 = invisible, 255 = as fighting members
*
* hm style x	- 	changes display style to x (from 1 to 4)
* 			1 = on column from the top
* 			2 = on column centered
* 			3 = as actors centered
* 			4 = as actors (good if using 3 fighters)
*/

var params=PluginManager.parameters('SEK_HiddenMembers');
var opacità = Number(params['Opacity'] || 150);
var display = Number(params['Style'] || 1);
var aliashm = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliashm.call(this, command, args);
		if (command.toLowerCase() === "hm") 
		{switch (args[0].toLowerCase())
			{
                            case 'opacity':
                            {
                                if (args[1]>255) opacità=255;
                                else if (args[1]<0) opacità=0;
                                else opacità=Number(args[1]);
                            } break;
                            case 'style':
                            {
                                if (args[1]>4) display=4;
                                else if (args[1]<1) display=1;
                                else display=Number(args[1]);
                            } break;
                        }
		}
	};
	
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


Window_BattleLog.prototype.displayRemovedStates = function(target) {
    target.result().removedStateObjects().forEach(function(state) {
        if (state.message4) {
            this.push('popBaseLine');
            this.push('pushBaseLine');
            this.push('addText', target.name() + state.message4);
            this._spriteset.updateActors2();
        }
    }, this);
};


Spriteset_Battle.prototype.updateActors2 = function() {
    var members = $gameParty.battleMembers();
    for (var i = 0; i < $gameParty.battleMembers().length; i++) {
        this._actorSprites[i].setBattler(members[i], i, 0);
    }
    
    
    for (var i = $gameParty.battleMembers().length; i < $gameParty.allMembers().length; i++)
    {
        this._actorSprites[i].setBattler2($gameParty.hiddenMembers()[i-$gameParty.battleMembers().length],i, 1);
    }
};


Game_Party.prototype.hiddenMembers = function() {
    return this.allMembers().slice(this.maxBattleMembers())
};


Sprite_Actor.prototype.setActorHome = function(index, add) {
    if (display==1)
        this.setHome(600 +(add?180:index * 32), (add==1?(index-$gameParty.maxBattleMembers()+1)*80: 280 + index*48));
    if (display==2)
        this.setHome(600 +(add?180:index * 32), (add==1?index*80: 280 + index*48));
    if (display==3)
        this.setHome(600 +(add?index*32+(5-$gameParty.maxBattleMembers())*5:index * 32), (add==1?280+(index-$gameParty.maxBattleMembers())*48-(5-$gameParty.maxBattleMembers())/2*48: 280 + index*48));
    if (display==4)
        this.setHome(600 +(add?index*32+(5-$gameParty.maxBattleMembers())*5:index * 32-12), (add==1?280+(index-$gameParty.maxBattleMembers())*48: 280 + index*48));
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
    if (add==1) this.opacity = opacità;
};

Sprite_Actor.prototype.setBattler2 = function(battler, i,add) {
    Sprite_Battler.prototype.setBattler.call(this, battler);
    if (add==1) {
        this._actor = battler;
        if (battler) {
            this.setActorHome(i,add);
        }
        this.startEntryMotion();
        this._stateSprite.setup(battler);
        this.opacity = opacità;
    }
};

//Needed for SEK_AllMembersFight compatibility
Window_BattleLog.prototype.startAction = function(subject, action, targets) {
    var item = action.item();
    this.push('performActionStart', subject, action);
    this.push('waitForMovement');
    this.push('performAction', subject, action);
    this.push('showAnimation', subject, targets, item.animationId);
    this.displayAction(subject, item);
};
