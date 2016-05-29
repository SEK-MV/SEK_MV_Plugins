//=============================================================================
// SEK_SingleActorBS.js
//=============================================================================

/*:
* @plugindesc A pokémon-like single actor battle system.
* @author SEK
*
*
*@param Show Animation on battler change
*@desc Default is "true".
*@default true
*
*@param Animation Id to show
*@desc Default is "42".
*@default 42
*
*/

/*
This is my first plugin. even if I try my best, I might not be able to help with issues.
You are free to use it. If you do use it, I'd like to have my name and my plugin's name included in credits.
*/

var params=PluginManager.parameters('SEK_SingleActorBS');
var show=(params['Show Animation on battler change'] || "true").toLowerCase()==="true";
var animation = Number(params['Animation Id to show'] || 42);

Game_Party.prototype.maxBattleMembers = function() {
    return 1;
};

var dead=0;
Game_Party.prototype.isAllDead = function() {
    var tot=$gameParty.allMembers().length;
	var p;
	dead=0;
	for (p=0; p<tot; p++)
	if ($gameParty.allMembers()[p].hp==0) dead++;
	if (dead>tot-1) 
	{
	dead=0;
	return this.inBattle() || !this.isEmpty();
	}
	if ($gameParty.allMembers()[0].isDead())
	{
	dead++;
	var safe=$gameParty.allMembers()[0].actorId();
	$gameParty.removeActor(safe);
	$gameParty.addActor(safe);
	if(show)
	$gameParty.allMembers()[0].startAnimation(animation, false, 0);
	}
	return false;
};
