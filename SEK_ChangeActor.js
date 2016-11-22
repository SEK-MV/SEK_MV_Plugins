//=============================================================================
// SEK_ChangeActor.js
//=============================================================================

/*:
* @plugindesc Adds the possibility to change an actor with a not fighting one, jumping your turn.
* @author SEK
*
*
*@param Command Name
*@desc The command name that will be shown in battle. Default is "Change".
*@default Change
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
*@desc Set this true to enable the command. You can change it with plugin commands whenever you want. Default is true.
*@default true
*
*
* @help 
* Plugin Commands:
*
* ac on   Activates the command
* ac off  Deactivates the command
* 
* ac showon   Shows an animation when you change an actor
* ac showoff  Doesn't show an animation when you change an actor
* 
* ac show x	Sets the animation to x
*
*You are free to use this plugin. If you do use it, I'd like to have my name and my plugin's name included in credits.
*/
var params=PluginManager.parameters('SEK_ChangeActor');
var cambio=String(params['Command Name']||"Change");
var enabled=(params['Enabled'] || "true").toLowerCase()==="true";
var show=(params['Show Animation on battler change'] || "true").toLowerCase()==="true";
var animation = Number(params['Animation Id to show'] || 42);

var aliasinterpreter = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliasinterpreter.call(this, command, args);
		if (command.toLowerCase() === "ac") {
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
				case 'lockon':
				{
					$gameActors.actor([args[1]])._lock=true;
				} break;
				case 'lockoff':
				{
					$gameActors.actor([args[1]])._lock=false;
				} break;
			}
		}
	};
	
	var initact = Game_Actor.prototype.initMembers;
	var initactb = Game_Battler.prototype.initMembers;
	Game_Actor.prototype.initMembers = function() {
		initact.call(this);
	    initactb.call(this);
		this._lock=false;
	}

var prpr=Window_PartyCommand.prototype.makeCommandList;
Window_PartyCommand.prototype.makeCommandList = function() {
    prpr.call(this);
	this.addChangeCommand();
};

Window_PartyCommand.prototype.addChangeCommand = function() {

	var changing=false;
	if($gameParty.hiddenAlive().length>0&&!this.allLocked())
            changing=true;
    this.addCommand(cambio, 'change', (changing&&enabled));
};

Window_PartyCommand.prototype.allLocked=function(){
	for (i=0;i<$gameParty.members().length; i++)
	{
		if ($gameParty.members()[i]._lock==false)
			return false;
	}
	return true;
}

var aliasetto=Scene_Battle.prototype.createPartyCommandWindow;
Scene_Battle.prototype.createPartyCommandWindow = function() {
    aliasetto.call(this);
    this._partyCommandWindow.setHandler('change', this.commandChange.bind(this),$gameParty.hiddenAlive().length>0);
    this._partyCommandWindow.deselect();
	
    this.addWindow(this._partyCommandWindow);
};

Scene_Battle.prototype.onActorOk = function() {
    var action = BattleManager.inputtingAction();
    action.setTarget(this._actorWindow.index());
    this._actorWindow.hide();
    this._skillWindow.hide();
    this._changeWindow.refresh();
    this._changeWindow.hide();
    this._itemWindow.hide();
    this.selectNextCommand();
};

Scene_Battle.prototype.onActorCancel = function() {
    this._actorWindow.hide();
    switch (this._actorCommandWindow.currentSymbol()) {
    case 'skill':
        this._skillWindow.show();
        this._skillWindow.activate();
        break;
    case 'item':
        this._itemWindow.show();
        this._itemWindow.activate();
        break;
	case 'change':
        this._changeWindow.refresh();
        this._changeWindow.show();
        this._changeWindow.activate();
        break;
    }
};

var isanyinput = Scene_Battle.prototype.isAnyInputWindowActive;
Scene_Battle.prototype.isAnyInputWindowActive = function() {
    return (isanyinput.call(this)||this._changeWindow.active);
};

var aliascreatewindows =Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
    aliascreatewindows.call(this);
    this.createChangeWindow();
};

Scene_Battle.prototype.createChangeWindow = function() {
    var wh = this._statusWindow.y;
    this._changeWindow = new Window_BattleChange(0, 0, Graphics.boxWidth, wh);
    this._changeWindow.setHelpWindow(this._helpWindow);
    this._changeWindow.setHandler('ok',     this.onChangeOk.bind(this));
    this._changeWindow.setHandler('cancel', this.onChangeCancel.bind(this));
    this.addWindow(this._changeWindow);
    this.refreshStatus();
};

Scene_Battle.prototype.commandChange = function() {
    x=null;
    this._changeWindow.refresh();	
    this._changeWindow.show();
    this._changeWindow.activate();
	
};
var x;
var y;
Scene_Battle.prototype.onChangeOk = function() {
    if (x==null){
    //x = this._changeWindow.item();
	x = $gameParty.allMembers().indexOf(this._changeWindow._inCampo[this._changeWindow.item()]);
    this._changeWindow.refresh();
    this._changeWindow.hide();
    this.c2();}
    else
    {
        y = $gameParty.allMembers().indexOf($gameParty.hiddenAlive()[this._changeWindow.item()]);;
        if (show) 
            $gameParty.allMembers()[x].startAnimation(animation, true, 0);
	$gameParty.swap(x, y);
        this._actorWindow.hide();
        this._skillWindow.hide();
        this._itemWindow.hide();
        this._changeWindow.refresh();
        this._changeWindow.hide();
        this.refreshStatus();
	this.jumpNextCommand();
    }
};

Game_Party.prototype.hiddenMembers = function() {
    return this.allMembers().slice(this.maxBattleMembers())
};

Game_Party.prototype.hiddenAlive = function() {
    return this.hiddenMembers().filter(function(member) {
        return member.hp!=0;
    });
};



Game_Party.prototype.swap = function(x,y) {
    var safe;
    var aggiungi=$gameParty.allMembers().clone();
    var temp=aggiungi[x];
    aggiungi[x]=aggiungi[y];
    aggiungi[y]=temp;
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


Scene_Battle.prototype.c2 = function() {
    this._changeWindow.refresh();	
    this._changeWindow.show();
    this._changeWindow.activate();
}; 


Scene_Battle.prototype.jumpNextCommand = function() {
    for (var i=0;i<$gameParty.members().length;i++)
    BattleManager.selectNextCommand();
    BattleManager.selectNextCommand();
    this.changeInputWindow();
};

Scene_Battle.prototype.onChangeCancel = function() {
    $gameParty.swapOrder(0, 0);
    this._changeWindow.refresh();
    this._changeWindow.hide();
    this.refreshStatus();
    this._partyCommandWindow.activate();
};

function Window_ChangeList() {
    this.initialize.apply(this, arguments);
};

Window_ChangeList.prototype = Object.create(Window_Selectable.prototype);
Window_ChangeList.prototype.constructor = Window_ChangeList;

Window_ChangeList.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._inCampo = [];
    this._inSquadraVivi = [];
	this._index=0;
};

Window_ChangeList.prototype.maxCols = function() {
    return 3;
};

Window_ChangeList.prototype.spacing = function() {
    return 148;
};

Window_ChangeList.prototype.maxItems = function() {
    return x==null?(this._inCampo ? this._inCampo.length : 1):($gameParty.hiddenAlive() ? $gameParty.hiddenAlive().length : 1);
};

Window_ChangeList.prototype.item = function() {
	return this.index();
};

Window_ChangeList.prototype.isCurrentItemEnabled = function() {
    return true;
};

Window_ChangeList.prototype.includes = function(item) {
    return true;
};

Window_ChangeList.prototype.isEnabled = function(item) {
    return true;
};

Window_ChangeList.prototype.makeItemList = function() {
	this._inCampo=[];
        this._inSquadraVivi=[];
var i;
        if (x==null){
for (i=0;i<$gameParty.members().length; i++)
{
	if ($gameParty.members()[i]._lock==false)
this._inCampo.push($gameParty.members()[i]);
}
}
else
{
    for (i=$gameParty.members().length; i<$gameParty.allMembers().length; i++)
        if($gameParty.allMembers()[i].hp!=0)
            this._inSquadraVivi.push($gameParty.allMembers()[i]);    
    }
};

var pre=30;//some space before the first line of faces
Window_ChangeList.prototype.itemRect = function(index) {
    var rect = new Rectangle();
    var maxCols = this.maxCols();
    rect.width = 144;
    rect.height = 174;
    rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
    rect.y =  Math.floor(index / maxCols) * (rect.height+pre) - this._scrollY;
    return rect;
};

Window_ChangeList.prototype.drawItem = function(index) {
    if (x==null)
    var actor = this._inCampo[index];
    else var actor = this._inSquadraVivi[index];
    if (actor) {
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        this.changePaintOpacity(this.isEnabled(actor));
        this.drawActorFace(actor, rect.x, rect.y+pre,144,144);
        this.drawActorName(actor, rect.x, rect.y,144);
        this.drawActorHp(actor, rect.x, rect.y+75+pre, 108);
        this.drawActorMp(actor, rect.x, rect.y+111+pre, 96);
        this.changePaintOpacity(true);
    }
	
	this._index=0;
};

Game_Party.prototype.leader = function() {
	return $gameParty.allMembers()[0];
};

Window_ChangeList.prototype.drawItemName = function(item, x, y, width) {
    width = width || 312;
        this.resetTextColor();
        this.drawText(item, 4+x, y, width);
};

Window_ChangeList.prototype.updateHelp = function() {
    this.setHelpWindowItem(this.item());
};

Window_ChangeList.prototype.refresh = function() {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
};

function Window_BattleChange() {
    this.initialize.apply(this, arguments);
};

Window_BattleChange.prototype = Object.create(Window_ChangeList.prototype);
Window_BattleChange.prototype.constructor = Window_BattleChange;

Window_BattleChange.prototype.initialize = function(x, y, width, height) {
    Window_ChangeList.prototype.initialize.call(this, x, y, width, height);
	this.refresh();
    this.hide();
};

Window_BattleChange.prototype.show = function() {
    Window_ChangeList.prototype.show.call(this);
};

Window_BattleChange.prototype.hide = function() {
    Window_ChangeList.prototype.hide.call(this);
};
