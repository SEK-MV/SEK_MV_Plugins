//=============================================================================
// SEK_+_SABS_BattleSwitchActor.js
//=============================================================================

/*:
* @plugindesc Add-on for SEK_SingleActorBS (SABS). Adds the possibility to change your active actor with another one.
* @author SEK
*
*
*@param Command Name
*@desc The command name that will be shown in battle. Default is "Change".
*@default Change
*/
//NOTE: It may cause problems if used without SABS!
var params=PluginManager.parameters('SEK_+_SABS_BattleSwitchActor');
var cambio=String(params['Command Name']||"Change");

var alias=Window_ActorCommand.prototype.makeCommandList;
Window_ActorCommand.prototype.makeCommandList = function() {
    alias.call(this);
	if (this._actor) {
        this.addChangeCommand();
    }
};

Window_ActorCommand.prototype.addChangeCommand = function() {
    this.addCommand(cambio, 'change', true);
};

commandalias=Scene_Battle.prototype.createActorCommandWindow;

Scene_Battle.prototype.createActorCommandWindow = function() {
    commandalias.call(this);
    this._actorCommandWindow.setHandler('change', this.commandChange.bind(this));
    this.addWindow(this._actorCommandWindow);
};




Scene_Battle.prototype.onActorOk = function() {
    var action = BattleManager.inputtingAction();
    action.setTarget(this._actorWindow.index());
    this._actorWindow.hide();
    this._skillWindow.hide();
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
        this._changeWindow.show();
        this._changeWindow.activate();
        break;
    }
};

Scene_Battle.prototype.isAnyInputWindowActive = function() {
    return (this._partyCommandWindow.active ||
            this._actorCommandWindow.active ||
            this._skillWindow.active ||
            this._itemWindow.active ||
            this._changeWindow.active ||
            this._actorWindow.active ||
            this._enemyWindow.active);
};


Scene_Battle.prototype.createAllWindows = function() {
    this.createLogWindow();
    this.createStatusWindow();
    this.createPartyCommandWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createChangeWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    this.createMessageWindow();
    this.createScrollTextWindow();
};


Scene_Battle.prototype.createChangeWindow = function() {
    var wy = this._helpWindow.y + this._helpWindow.height;
    var wh = this._statusWindow.y - wy;
    this._changeWindow = new Window_BattleChange(0, wy, Graphics.boxWidth, wh);
    this._changeWindow.setHelpWindow(this._helpWindow);
    this._changeWindow.setHandler('ok',     this.onChangeOk.bind(this));
    this._changeWindow.setHandler('cancel', this.onChangeCancel.bind(this));
    this.addWindow(this._changeWindow);
};

Scene_Battle.prototype.commandChange = function() {
    this._changeWindow.refresh();
    this._changeWindow.show();
    this._changeWindow.activate();
};


Scene_Battle.prototype.onChangeOk = function() {
    var x = this._changeWindow.item();
	x++;
	
	var tot=$gameParty.allMembers().length;
	$gameParty.removeActor(actors[0]);
	for (i=1;i<tot; i++)
	{
	if (i!=x){
	var safe=actors[i];
	$gameParty.removeActor(safe);
	$gameParty.addActor(safe);
	}
	if (i==x)
	$gameParty.addActor(actors[0]);
	} this._changeWindow.hide();
	this.refreshStatus();
	this.selectNextCommand();
};


Scene_Battle.prototype.onChangeCancel = function() {
    this._changeWindow.hide();
    this._actorCommandWindow.activate();
};


function Window_ChangeList() {
    this.initialize.apply(this, arguments);
}

Window_ChangeList.prototype = Object.create(Window_Selectable.prototype);
Window_ChangeList.prototype.constructor = Window_ChangeList;

Window_ChangeList.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._data = [];
	this._index=0;
};

Window_ChangeList.prototype.maxCols = function() {
    return 2;
};

Window_ChangeList.prototype.spacing = function() {
    return 48;
};

Window_ChangeList.prototype.maxItems = function() {
    return this._data ? this._data.length : 1;
};

Window_ChangeList.prototype.item = function() {
    //return this._data && this.index() >= 0 ? this._data[this.index()] : null;
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
    actors = [];
	this._data=[];
var i;
actors.push($gameParty.allMembers()[0].actorId());
for (i=1;i<$gameParty.allMembers().length; i++)
{
this._data.push($gameParty.allMembers()[i].name());
actors.push($gameParty.allMembers()[i].actorId());
}
};

Window_ChangeList.prototype.drawItem = function(index) {
    var skill = this._data[index];
    if (skill) {
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        this.changePaintOpacity(this.isEnabled(skill));
        this.drawItemName(""+skill, rect.x, rect.y, rect.width);
        this.changePaintOpacity(1);
    }
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
}

Window_BattleChange.prototype = Object.create(Window_ChangeList.prototype);
Window_BattleChange.prototype.constructor = Window_BattleChange;

Window_BattleChange.prototype.initialize = function(x, y, width, height) {
    Window_ChangeList.prototype.initialize.call(this, x, y, width, height);
    this.hide();
};

Window_BattleChange.prototype.show = function() {
    Window_ChangeList.prototype.show.call(this);
};

Window_BattleChange.prototype.hide = function() {
    Window_ChangeList.prototype.hide.call(this);
};
