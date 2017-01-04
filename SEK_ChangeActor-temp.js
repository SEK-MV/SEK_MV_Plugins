//=============================================================================
// SEK_ChangeActor-temp.js
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
*@param Change from actor command window
*@desc Default is false.
*@default false
*
*@param Only Actor skips
*@desc If true, only the actor using the change command will skip the turn.(only with change from actor window)
*@default false
*
*@param Using DoubleX RMMV Popularized ATB Core
*@desc Set this true if you're using DoubleX RMMV Popularized ATB Core. Default is false.
*@default false
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
* ac lockon x	Lock actor x in battle, you won't be able to change it
* ac lockoff x	Removes the lock on actor x
*
*You are free to use this plugin. If you do use it, I'd like to have my name and my plugin's name included in credits.
*/
var params=PluginManager.parameters('SEK_ChangeActor-temp');
var cambio=String(params['Command Name']||"Change");
var enabled=(params['Enabled'] || "true").toLowerCase()==="true";
var usingpatb=(params['Using DoubleX RMMV Popularized ATB Core'] || "true").toLowerCase()==="true";
var fromactor=(params['Change from actor command window'] || "false").toLowerCase()==="true";
var show=(params['Show Animation on battler change'] || "false").toLowerCase()==="true";
var onlyactorskips=(params['Only Actor skips'] || "false").toLowerCase()==="true";
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
        this._changedwith=null;
	}

Game_Party.prototype.allLocked=function(){
    for (i=0;i<$gameParty.members().length; i++)
    {
        if ($gameParty.members()[i]._lock==false)
            return false;
    }
    return true;
}
//====================================Party Command Window========================================================================================
var _makeCommandListP = Window_PartyCommand.prototype.makeCommandList;
Window_PartyCommand.prototype.makeCommandList = function() {
    _makeCommandListP.call(this);
	if(!fromactor) this.addChangeCommand();
};

Window_PartyCommand.prototype.addChangeCommand = function() {
	var changing=false;
	if($gameParty.hiddenAlive().length>0&&!$gameParty.allLocked())
            changing=true;
    this.addCommand(cambio, 'change', (changing&&enabled));
};


var _createPartyCommandWindow=Scene_Battle.prototype.createPartyCommandWindow;
Scene_Battle.prototype.createPartyCommandWindow = function() {
    _createPartyCommandWindow.call(this);
    if(!fromactor){this._partyCommandWindow.setHandler('change', this.commandChange.bind(this),$gameParty.hiddenAlive().length>0);
    this._partyCommandWindow.deselect();
    this.addWindow(this._partyCommandWindow);}
};
//================================================================================================================================================


//====================================Actor Command Window========================================================================================


var _makeCommandListA = Window_ActorCommand.prototype.makeCommandList;
Window_ActorCommand.prototype.makeCommandList = function() {
    _makeCommandListA.call(this);
    if (this._actor&&fromactor) {
        this.addChangeCommand();
    }
};

Window_ActorCommand.prototype.addChangeCommand = function() {
    var changing=false;
    if($gameParty.hiddenAlive().length>0&&!$gameParty.allLocked())
            changing=true;
    this.addCommand(cambio, 'change', (changing&&enabled));
};

var _createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
Scene_Battle.prototype.createActorCommandWindow = function() {
    _createActorCommandWindow.call(this);
    if(fromactor){this._actorCommandWindow.setHandler('change', this.commandChange.bind(this),$gameParty.hiddenAlive().length>0);
    this.addWindow(this._actorCommandWindow);}
};
//================================================================================================================================================

Scene_Battle.prototype.onActorOk = function() {
    var action = BattleManager.inputtingAction();
    action.setTarget(this._actorWindow.index());
    this._actorWindow.hide();
    this._skillWindow.hide();
    if(!fromactor){
    this._changeWindow.refresh();
    this._changeWindow.hide();
    }
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
    windowChangeActive=true;
    x=null;
    if(fromactor)
    {
        x=$gameParty.allMembers().indexOf(this._actorCommandWindow._actor);
        this._changeWindow.refresh();
        this._changeWindow.hide();
        this.c2();
    }
    this._changeWindow.refresh();	
    this._changeWindow.show();
    this._changeWindow.activate();
};

var x;
var y;
Scene_Battle.prototype.onChangeOk = function() {
    if (usingpatb){
        if(onlyactorskips) 
            {
                if (this._actorCommandWindow._actor) 
                    this._actorCommandWindow._actor.clear_patb();
            }
        else $gameParty.clearActions();
        BattleManager.need_patb_refresh = true;
    }
    if (x==null){
	x = $gameParty.allMembers().indexOf(this._changeWindow._inCampo[this._changeWindow.item()]);
    this._changeWindow.refresh();
    this._changeWindow.hide();
    this.c2();}
    else
    {
        y = $gameParty.allMembers().indexOf($gameParty.hiddenAlive()[this._changeWindow.item()]);;
        $gameParty.allMembers()[y]._changedwith=y;
        if (show) 
            $gameParty.allMembers()[x].startAnimation(animation, true, 0);
        $gameParty.swap(x, y);
        this._actorWindow.hide();
        this._skillWindow.hide();
        this._itemWindow.hide();
        this._changeWindow.refresh();
        this._changeWindow.hide();
        this.refreshStatus();
    if (usingpatb){
        windowChangeActive=false;
        this.select_next_patb_command();
    }
    else
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
    windowChangeActive=true
}; 


var _selectPreviousCommand = Scene_Battle.prototype.selectPreviousCommand;
Scene_Battle.prototype.selectPreviousCommand = function() {
    if(!usingpatb&&this._actorCommandWindow._actor)
        if($gameParty.allMembers().indexOf(this._actorCommandWindow._actor)>0){
            newActor=$gameParty.allMembers()[$gameParty.allMembers().indexOf(this._actorCommandWindow._actor)-1];
            if (newActor._changedwith!=null)
            {
                console.log(newActor._changedwith);
                $gameParty.swap($gameParty.allMembers().indexOf(newActor),newActor._changedwith);
            }
        }
    _selectPreviousCommand.call(this);
};


var _changeInputWindow = Scene_Battle.prototype.changeInputWindow; 
Scene_Battle.prototype.changeInputWindow = function() {
    if (BattleManager.isInputting())
        if (!BattleManager.actor()) 
            $gameParty.clearChangedWith();
    _changeInputWindow.call(this);
};

Game_Party.prototype.clearChangedWith = function(){
    for (var i=0;i<$gameParty.allMembers().length;i++)
        $gameParty.allMembers()[i]._changedwith=null;
};

Scene_Battle.prototype.jumpNextCommand = function() {

    if (!fromactor) 
        {
            BattleManager.selectNextCommand();
            for (var i=0;i<$gameParty.members().length;i++)
                BattleManager.selectNextCommand();
        }
    else
    {
        if(this._actorCommandWindow._actor)
        { 
            if (onlyactorskips)
                BattleManager.selectNextCommand();
            else
                for (var i=x;i<$gameParty.members().length;i++)
                    BattleManager.selectNextCommand();
        }
        else
            for (var i=0;i<$gameParty.members().length;i++)
                BattleManager.selectNextCommand();
    }
    this.changeInputWindow();
    BattleManager.need_patb_refresh = true 
};

Scene_Battle.prototype.onChangeCancel = function() {
    $gameParty.swapOrder(0, 0);
    this._changeWindow.refresh();
    this._changeWindow.hide();
    windowChangeActive=false;
    this.refreshStatus();
    if (fromactor)
        if(usingpatb)
            {
                if(this._actorCommandWindow._actor) this._actorCommandWindow.actor.patb_val.atb = this._actorCommandWindow.actor.max_patb_val;
                    BattleManager.need_patb_refresh = true;
            }
        else
            this._actorCommandWindow.activate();
    else
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


// Compatibility with DoubleX RMMV Popularized ATB Core

var windowChangeActive=false;
var _can_update_patb_process= BattleManager.can_update_patb_process;
BattleManager.can_update_patb_process = function() { 
    return _can_update_patb_process.call(this)&&!windowChangeActive;
};
var _can_input_patb = Game_Actor.prototype.can_input_patb;
Game_Actor.prototype.can_input_patb = function(){
    return _can_input_patb.call(this)&&!windowChangeActive;
}; 
