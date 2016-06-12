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
*@desc If true, enables the plugin. Default true.
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
*/


var params=PluginManager.parameters('SEK_AllMembersFight');
var show=(params['Show Animation on battler change'] || "true").toLowerCase()==="true";
var animation = Number(params['Animation Id to show'] || 42);
var numMax=Number(params['Max Actors'] || 1);
var enabled=(params['Enabled'] || "true").toLowerCase()==="true";
var eenabled=(params['Enabled For Enemies'] || "true").toLowerCase()==="true";
var aenabled=(params['Enabled For Actors'] || "true").toLowerCase()==="true";
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
                                case 'showon':
				{
					show=true;
				} break;				
				case 'showoff':
				{
					show=false;
				} break;
			}
		}
	};

Game_Party.prototype.maxBattleMembers = function() {
    return numMax;
};


Window_BattleLog.prototype.performCollapse = function(target) {
    target.performCollapse();
    if(enabled){
        
    if (target.isActor()&&aenabled)
    {
        var alive=0;
        var next;
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
    else if (eenabled)
    {
        if ($gameTroop.hiddenMembers().length!=0) 
        {
            var e=$gameTroop.hiddenMembers()[0];
            e.appear();
            if (show) 
                e.startAnimation(animation, true, 0);
        }
    }
    }
};


Game_Troop.prototype.hiddenMembers = function() {
    return this.members().filter(function(member) {
        return member.isHidden();
    });
};
