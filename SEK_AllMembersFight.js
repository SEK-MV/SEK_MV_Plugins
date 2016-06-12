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
*/

/*
This is my first plugin. even if I try my best, I might not be able to help with issues.
You are free to use it. If you do use it, I'd like to have my name and my plugin's name included in credits.
*/

var params=PluginManager.parameters('SEK_AllMembersFight');
var show=(params['Show Animation on battler change'] || "true").toLowerCase()==="true";
var animation = Number(params['Animation Id to show'] || 42);
var numMax=Number(params['Max Actors'] || 1);

Game_Party.prototype.maxBattleMembers = function() {
    return numMax;
};


Window_BattleLog.prototype.performCollapse = function(target) {
    target.performCollapse();
    var alive=0;
    var next;
    if (target.isActor())
    {
        for(var p=0;p<$gameParty.allMembers().length;p++)
            if (!$gameParty.allMembers()[p].hp==0) {if(++alive==numMax) next = p;}
        if (alive>=numMax)
        {
	var safe=target.actorId();
	$gameParty.removeActor(safe);
	$gameParty.addActor(safe);
        if(show)
	$gameParty.allMembers()[numMax-1].startAnimation(animation, false, 0);
	
        }
        
    }
};
