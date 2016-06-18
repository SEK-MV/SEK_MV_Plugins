//=============================================================================
// SEK_AllMembersFight.js
//=============================================================================

/*:
* @plugindesc With this plugin you can set a limit to the members in battle. When someone dies, the next avaliable one joins.
* @author SEK
*
*@param Max Actors
*@desc Max number of actors in battle. Default is 1.
*@default 1
*
*@param Show Animation on battler change
*@desc Default is "true".
*@default true
*
*@param Animation Id to show
*@desc Default is "42".
*@default 42
*
*@param Enabled
*@desc If true, enables the plugin (the item feature will work even if this is false!). Default true.
*@default true
*
*@param Enabled For Enemies
*@desc If enabled, enemies will fight until you defeat even the hidden ones. Default true.
*@default true
*
*@param Enabled For Actors
*@desc If enabled, you will keep fighting until you have alive members. Default true.
*@default true
*
*@param Enabled For Items
*@desc If enabled, you can use items on not fighting members. Default true.
*@default true
*
*
* @help 
* Plugin Commands:
*
* amf on   Activates the plugin
* amf off  Deactivates the plugin
* 
* amf showon   Shows an animation when a unit appears
* amf showoff  Doesn't show an animation when a unit appears
* 
* amf show x	Sets the animation to x
*
* For enemy troops:
* If you want the enemy to work like actors, you need to hide them
* by making them appear in the middle of the fight.
* To do this, you need to open your database, go to the troop page
* and right click on the enemies you want to hide for every troop.
* 
* This possibility can be turned off because it could cause problems
* in battles with event-appearing enemies.
* 
* Simply use the plugin commands:
* amf eon   to activate this plugin for enemies
* amf eoff  to deactivate this plugin for enemies
* 
* It could also be cool to only have this possibility only on enemies,
* to do that, you can use the plugin commands:
* amf aon   to activate this plugin for actors
* amf aoff  to deactivate this plugin for actors
* 
* amf ion   to use items and skills on not fighting members
* amf ioff  to prevent using items and skills on not fighting members
*/


var params=PluginManager.parameters('SEK_AllMembersFight');
var show=(params['Show Animation on battler change'] || "true").toLowerCase()==="true";
var animation = Number(params['Animation Id to show'] || 42);
var numMax=Number(params['Max Actors'] || 1);
var enabled=(params['Enabled'] || "true").toLowerCase()==="true";
var eenabled=(params['Enabled For Enemies'] || "true").toLowerCase()==="true";
var aenabled=(params['Enabled For Actors'] || "true").toLowerCase()==="true";
var ienabled=(params['Enabled For Items'] || "true").toLowerCase()==="true";
var aliasgamin = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliasgamin.call(this, command, args);
		if (command.toLowerCase() === "amf") {
			switch (args[0].toLowerCase())
			{
				case 'on':
				{
					enabled=true;
				} break;				
				case 'off':
				{
					enabled=false;
				} break;
                                case 'aon':
				{
					aenabled=true;
				} break;				
				case 'aoff':
				{
					aenabled=false;
				} break;
                                case 'eon':
				{
					eenabled=true;
				} break;				
				case 'eoff':
				{
					eenabled=false;
				} break;
                                case 'ion':
				{
					ienabled=true;
				} break;				
				case 'ioff':
				{
					ienabled=false;
				} break;
                                case 'showon':
				{
					show=true;
				} break;				
				case 'showoff':
				{
					show=false;
				} break;
				case 'show':
				{
					animation = Number(args[1] || 42);;
				} break;
			}
		}
	};
        
/*==============================================================================

                           Actors Number Limit

==============================================================================*/

Game_Party.prototype.maxBattleMembers = function() {
    return numMax;
};



/*==============================================================================

                           Dead Actor Animation "Fix"

==============================================================================*/

Window_BattleLog.prototype.startAction = function(subject, action, targets) {
    var bersagli=[];
    for (var i=0;i<targets.length;i++)
        if (targets[i].index()!=-1) 
    {        
        bersagli.push(targets[i]);
    }
    var item = action.item();
    this.push('performActionStart', subject, action);
    this.push('waitForMovement');
    this.push('performAction', subject, action);
    this.push('showAnimation', subject, bersagli, item.animationId);
    this.displayAction(subject, item);
};

/*==============================================================================

                           Actors

==============================================================================*/

Game_Actor.prototype.isFormationChangeOk = function() {
    return !this.isDead();
};

Scene_Item.prototype.onItemCancel = function() {
    this._itemWindow.deselect();
    $gameParty.ordina();
    this._categoryWindow.activate();
};

Game_Battler.prototype.addState = function(stateId) {
    if (this.isStateAddable(stateId)) 
    {
        if (!this.isStateAffected(stateId)) {
            this.addNewState(stateId);
            this.refresh();
        }
        this.resetStateCounts(stateId);
        this._result.pushAddedState(stateId);
        if (this.isActor()&&stateId==this.deathStateId()&&aenabled)
            {
                if ($gameParty.inBattle())
                { 
                    if ($gameParty.hiddenAlive().length>0&&$gameParty.aliveMembers().length<numMax)
                    {
//------------------------------------------------------------------------------
                        var pos=[];
                        var lista=$gameParty.allMembers().clone();
                        if (show) 
                                this.startAnimation(animation, true, 0);
                        $gameParty.riordina();
                        
//--------------------------------Updating-targets------------------------------
                        for (var i=0;i<lista.length;i++)
                            pos[i]=$gameParty.allMembers().indexOf(lista[i]);
                        for (var i=0;i<BattleManager._actionBattlers.length;i++)
                            if(BattleManager._actionBattlers[i].currentAction())
                                BattleManager._actionBattlers[i].currentAction()._targetIndex=pos.indexOf(BattleManager._actionBattlers[i].currentAction()._targetIndex);
                        
                        
//------------------------------------------------------------------------------
                        
                            
                    }
                }
                else
                    $gameParty.ordina();
            }
   } 
};

//AGGIUNTA TEST

Scene_Battle.prototype.onActorOk = function() {
    var action = BattleManager.inputtingAction();
    action.setTarget(this._actorWindow.index());
    this._actorWindow.hide();
    this._skillWindow.hide();
    this._itemWindow.hide();
    this.selectNextCommand();
};

//FINE AGGIUNTA
Game_Battler.prototype.removeState = function(stateId) {
    if (this.isStateAffected(stateId)) {
        if (stateId === this.deathStateId()) {
            this.revive();
           if ($gameParty.inBattle())
            {
                if(this.index()==-1)
                    $gameParty.riordina();
            }
            
            
        }
        this.eraseState(stateId);
        this.refresh();
        this._result.pushRemovedState(stateId);
    }
};

/*==============================================================================

                           Monsters

==============================================================================*/

Window_BattleLog.prototype.performCollapse = function(target) {
    target.performCollapse();
    if(enabled)        
    if (!target.isActor()&&eenabled)
    {
        if ($gameTroop.hiddenMembers().length!=0) 
        {
            var e=$gameTroop.hiddenMembers()[0];
            e.appear();
            if (show) 
                e.startAnimation(animation, true, 0);
        }
    
    }
};

/*==============================================================================

                           Utility

==============================================================================*/

Game_Party.prototype.hiddenMembers = function() {
    return this.allMembers().slice(this.maxBattleMembers())
};

Game_Troop.prototype.hiddenMembers = function() {
    return this.members().filter(function(member) {
        return member.isHidden();
    });
};

Game_Party.prototype.hiddenAlive = function() {
    return this.hiddenMembers().filter(function(member) {
        return member.hp!=0;
    });
};


/*==============================================================================

                           Making order

==============================================================================*/



Game_Party.prototype.ordina = function() {
    var safe;
    var aggiungi=$gameParty.allMembers().clone();
    var morti=[];
    var vivi=[];
    var tot=aggiungi.length;
    for (var p=0;p<tot;p++)
        if (aggiungi[p].hp==0)
        {
            morti.push(aggiungi[p]);
        }
        else
        {
            vivi.push(aggiungi[p]);
        }
    for (var p=0;p<vivi.length;p++)
        aggiungi[p]=vivi[p];
    for (var p=vivi.length;p<tot;p++)
        aggiungi[p]=morti[p-vivi.length];
    for (var k=0;k<aggiungi.length;k++)
    {
        safe=aggiungi[k].actorId();
        $gameParty.removeActor(safe);
    }
    for (var k=0;k<aggiungi.length;k++)
    {
        safe=aggiungi[k].actorId();
        $gameParty.addActor(safe);
    }
};


Game_Party.prototype.riordina = function() {
    var safe;
    var aggiungi=$gameParty.allMembers().clone();
    for (var p=0;p<numMax;p++)
        if (aggiungi[p].hp==0)
        {
            for (k=numMax;k<aggiungi.length;k++)
                if (aggiungi[k].hp!=0)
                {
                    var temp=aggiungi[p];
                    aggiungi[p]=aggiungi[k];
                    aggiungi[k]=temp;
                    break;
                }
        }
    for (var k=0;k<aggiungi.length;k++)
    {
        safe=aggiungi[k].actorId();
        $gameParty.removeActor(safe);
    }
    for (var k=0;k<aggiungi.length;k++)
    {
        safe=aggiungi[k].actorId();
        $gameParty.addActor(safe);
    }
};

/*==============================================================================

                           Battle ends

==============================================================================*/

Scene_Battle.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    $gameParty.onBattleEnd();
    $gameTroop.onBattleEnd();
    AudioManager.stopMe();
    $gameParty.ordina();
};

/*==============================================================================

                            ITEMs

==============================================================================*/


Window_BattleStatus.prototype.maxItems = function() {
    if (go==0) return $gameParty.members().length;
    else return $gameParty.allMembers().length;
};

Scene_Battle.prototype.onSelectAction = function() {
    var action = BattleManager.inputtingAction();
    this._skillWindow.hide();
    this._itemWindow.hide();
    if (!action.needsSelection()) {
        this.selectNextCommand();
    } else if (action.isForOpponent()) {
        this.selectEnemySelection();
    } else {
        if (ienabled) go=1;
        this.selectActorSelection();
    }
};



var go=0;

Window_BattleStatus.prototype.drawItem = function(index) {
    var actor = $gameParty.allMembers()[index];
    this.drawBasicArea(this.basicAreaRect(index), actor);
    this.drawGaugeArea(this.gaugeAreaRect(index), actor);
};

Window_BattleActor.prototype.actor = function() {
    return $gameParty.allMembers()[this.index()];
};

Window_BattleActor.prototype.hide = function() {
    Window_BattleStatus.prototype.hide.call(this);
    $gameParty.select(null);
    go=0;
};

Game_Action.prototype.targetsForFriends = function() {
    var targets = [];
    var unit = this.friendsUnit();
    if (ienabled) 
    {
    if (this.isForUser()) {
        return [this.subject()];
    } else if (this.isForDeadFriend()) {
        if (this.isForOne()) {            
            targets.push(unit.allSmoothDeadTarget(this._targetIndex));
        } else {
            targets = unit.allDeadMembers();
        }
    } else if (this.isForOne()) {
        if (this._targetIndex < 0) {
            targets.push(unit.allRandomTarget());
        } else {targets.push(unit.allSmoothTarget(this._targetIndex));
        }
    } else {
        targets = unit.allAliveMembers();
    }
    return targets;
}
else
{
    if (this.isForUser()) {
        return [this.subject()];
    } else if (this.isForDeadFriend()) {
        if (this.isForOne()) {
            targets.push(unit.smoothDeadTarget(this._targetIndex));
        } else {
            targets = unit.deadMembers();
        }
    } else if (this.isForOne()) {
        if (this._targetIndex < 0) {
            targets.push(unit.randomTarget());
        } else {
            targets.push(unit.smoothTarget(this._targetIndex));
        }
    } else {
        targets = unit.aliveMembers();
    }
    return targets;
}
};

Game_Unit.prototype.allRandomTarget = function() {
    var tgrRand = Math.random() * this.tgrSum();
    var target = null;
    this.allAliveMembers().forEach(function(member) {
        tgrRand -= member.tgr;
        if (tgrRand <= 0 && !target) {
            target = member;
        }
    });
    return target;
};


Game_Unit.prototype.allSmoothTarget = function(index) {
    if (index < 0) {
        index = 0;
    }
    var member = this.allMembers()[index];
    return (member && member.isAlive()) ? member : this.aliveMembers()[0];
};

Game_Unit.prototype.allAliveMembers = function() {
    return this.allMembers().filter(function(member) {
        return member.isAlive();
    });
};


Game_Unit.prototype.allSmoothDeadTarget = function(index) {
    if (this.allDeadMembers().length==0) return;
    if (index < 0) {
        index = 0;
    }
    var member = this.allMembers()[index];
    return (member && member.isDead()) ? member : this.allDeadMembers()[0];
};


Game_Unit.prototype.allDeadMembers = function() {
    return this.allMembers().filter(function(member) {
        return member.isDead();
    });
};

Game_Unit.prototype.allDeadMembers = function() {
    return this.allMembers().filter(function(member) {
        return member.hp==0;
    });
};
