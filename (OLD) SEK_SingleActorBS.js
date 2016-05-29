//=============================================================================
// SEK_SingleActorBS.js
//=============================================================================

/*:
* @plugindesc A pokémon-like single actor battle system.
* @author SEK
*/

/*
This is my first plugin. even if I try my best, I might not be able to help with issues.
You are free to use it. If you do use it, I'd like to have my name and my plugin's name included in credits.
*/
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
	}
	return false;
};
