//=============================================================================
// SEK_SimpleHearts.js
//=============================================================================

/*:
* @plugindesc Draws Hearts on the screen based on your main actor's Hp using pictures.
* @author SEK
*
*
*@param Full Heart Image
*@desc The name of the full heart image (without ".png"). Default is fh.
*@default fh
*
*@param Half Heart Image
*@desc The name of the half heart image (without ".png"). Default is hh.
*@default hh
*
*@param Half Heart Unit
*@desc The unit of Hps that makes an half heart. Default is 1.
*@default 1
*
*@param Enabled
*@desc Set this true to enable the plugin. You can change it with plugin commands whenever you want. Default is true.
*@default true
*
*@param Show in Battle
*@desc Set this true to enable the plugin in battle. You can change it with plugin commands whenever you want. Default is true.
*@default true
*
* @help 
* Plugin Commands:
*
* sekhearts on		Activates the command
*
* sekhearts off		Deactivates the command
*
* sekhearts bon		Activates the command
*
* sekhearts boff	Deactivates the command
*
* sekhearts unit x	Change Half Heart Unit to x
*
* sekhearts fh x	Change Full Heart's picture name to x
*
* sekhearts hh x	Change Half Heart's picture name to x
* 
*You are free to use this plugin. If you do use it, I'd like to have my name and my plugin's name included in credits.
*/



var params=PluginManager.parameters('SEK_SimpleHearts');
var fh=String(params['Full Heart Image']||fh);
var hh=String(params['Half Heart Image']||hh);
var unit=Number(params['Half Heart Unit']||1);
var enabled=(params['Enabled'] || "true").toLowerCase()==="true";
var inBattle=(params['Show in Battle'] || "true").toLowerCase()==="true";
var aliasinterpreter = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliasinterpreter.call(this, command, args);
		if (command.toLowerCase() === "sekhearts") {
			switch (args[0].toLowerCase())
			{
				case 'on':
				{
					enabled=true;
					$gameParty.draw();
				} break;				
				case 'off':
				{
					enabled=false;
					for (var i=51;i<100;i++)
						$gameScreen.erasePicture(i);
				} break;	
				case 'bon':
				{
					inBattle=true;
					$gameParty.redraw();
				} break;				
				case 'boff':
				{
					inBattle=false;
					$gameParty.redraw();
				} break;				
				case 'unit':
				{
					unit=args[1];
					$gameParty.redraw();
				} break;				
				case 'fh':
				{
					fh=args[1];
					$gameParty.redraw();
				} break;				
				case 'hh':
				{
					hh=args[1];
					$gameParty.redraw();
				} break;
			}
		}
	};
	
	
	var a=SceneManager.push;

SceneManager.push = function(sceneClass) {
	for (var i=51;i<100;i++)
		$gameScreen.erasePicture(i);
	a.call(this, sceneClass);
};
	
var wselalias=Window_Selectable.prototype.update;

Window_Selectable.prototype.update =function(){
	wselalias.call(this);
	$gameParty.redraw();
}

var soalias=Game_Party.prototype.swapOrder;
Game_Party.prototype.swapOrder = function(index1, index2) {
    soalias.call(this, index1, index2);
	this.redraw;
};

Game_Party.prototype.redraw = function(){
	if(enabled){
	for (var i=51;i<100;i++)
		$gameScreen.erasePicture(i);
	$gameParty.draw();
	}
}

var alhp=Game_Interpreter.prototype.changeHp;
Game_Interpreter.prototype.changeHp = function(target, value, allowDeath){
	alhp.call(this,target, value, allowDeath);
	if(enabled)
		$gameParty.draw();
};

Game_Party.prototype.draw=function(){
	if (!$gameParty.inBattle()||inBattle){
	var im,x,y;
for (var i=1;i<$gameParty.members()[0].hp/unit+1;i++)
{
	im=i+50;
	if(im<99){
	x=i;
	y=0;
	while(x>34)
	{
		x-=34;
		y+=48;
	}
	x=((x-1)/2-(x-1)/2%1)*48;
	if (im%2==1)
		$gameScreen.showPicture(im, hh, 0, x, y, 100, 100, 255, 0);
	else
		$gameScreen.showPicture(im, fh, 0, x, y, 100, 100, 255, 0);
}}
for (var i=$gameParty.members()[0].hp/unit; i<$gameParty.members()[0].mhp/unit;i++)
	$gameScreen.erasePicture(i+51);
	}
};

var adal=Game_BattlerBase.prototype.addParam;
Game_BattlerBase.prototype.addParam = function(paramId, value) {
    adal.call(this, paramId, value);
	$gameParty.redraw();
};
