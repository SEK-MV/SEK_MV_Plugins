//=============================================================================
// SEK_BattleTime&Rank-temp-.js
//=============================================================================

/*:
* @plugindesc Get a fast victory and gain different amounts of exp and gold!
* @author SEK
*
*
* @param End Battle Message
* @desc The Message that will be shown after a battle. write %r for rank, %s for secs and %m for minutes.
* @default Battle won in %s secs! - Rank %r
*
* @help 
*
* Get a fast victory and gain different amounts of exp and gold!
*
* Note: plugin commands are not case sensitive!
*
* Plugin Commands:
* 
*Rank rank
* Write a list of rank names separated by spaces
*
*Rank secs
* Write a list of secs in a crescent order separated by spaces
*
* Rank exp
* Write a list of exp multiplier values separated by spaces
*
*Rank gold
* Write a list of gold multiplier values separated by spaces
*
*The lenght of every list must be the same!
*You must start from the better result to the worst!
*Example:
*	Rank ranks S A B C D
*	Rank secs 7 10 12 16 20
*	Rank exp 5 4 3 2 1
*	Rank gold 5 4 3 2 1
*
* if you complete the battle in 7 secs, you'll get S rank, exp*5 and gold*5!
* if secs are over the last value of secs list, that value will be taken
* anyhow: in this case, if you go over 16 seconds, even if time is 25 seconds, you
* will get Rank D
* By default, every multiplier is 1 and rank is "none"
*/
var params=PluginManager.parameters('SEK_BattleTime&Rank-temp-');
	var Frase = String(params['End Battle Message'] || "Battle won in %s secs! - Rank %r");

var aliasgamin = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliasgamin.call(this, command, args);
		if (command.toLowerCase() === "rank") {
			switch (args[0].toLowerCase())
			{		
				case 'exp':
				{
					ExpM=[];
					var i=1;
					for (i;i<args.length; i++)
					{ExpM[i-1]=args[i];}
				} break;			
				case 'gold':
				{
					GoldM=[];
					var i=1;
					for (i;i<args.length; i++)
					{GoldM[i-1]=args[i];}
				} break;
				case 'secs':
				{
					SecsM=[];
					var i=1;
					for (i;i<args.length; i++)
					{SecsM[i-1]=args[i];}
				} break;
				case 'ranks':
				{
					Ranks=[];
					var i=1;
					for (i;i<args.length; i++)
					{Ranks[i-1]=args[i];}
				} break;
			}
		}
	};

var d;
var tempo;
var x,y;
var ExpM=[1];
var GoldM=[1];
var SecsM=[1];
var Ranks=["None"];
var rank;
var secs;
var started;
Scene_Battle.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
	if (!started) 
{d= new Date();
	tempo = d.getTime();
 started=true;
}
};

Scene_Battle.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    $gameParty.onBattleEnd();
    $gameTroop.onBattleEnd();
    AudioManager.stopMe();
	started=false;
};
BattleManager.makeRewards = function() {
	d = new Date();
	secs=(d.getTime()-tempo)/1000;
	{x=ExpM[SecsM.length-1]; y=GoldM[SecsM.length-1]; rank=Ranks[SecsM.length-1];}
	for (var i=SecsM.length-1;i>=0;i--)
	if (secs<SecsM[i]) {x=ExpM[i]; y=GoldM[i]; rank=Ranks[i];}
    this._rewards = {};
	if ($gameTroop.goldTotal())
    this._rewards.gold = $gameTroop.goldTotal()*y;
	else
	this._rewards.gold = $gameTroop.goldTotal();
	if ($gameTroop.expTotal())
    this._rewards.exp = $gameTroop.expTotal()*x;
	else
    this._rewards.exp = $gameTroop.expTotal();
    this._rewards.items = $gameTroop.makeDropItems();
	$gameMessage.add((Frase).replace(new RegExp("%r","g"), (rank)).replace(new RegExp("%s","g"), 	(secs)).replace(new RegExp("%m","g"), (secs/60)));
	$gameMessage.newPage();
};
