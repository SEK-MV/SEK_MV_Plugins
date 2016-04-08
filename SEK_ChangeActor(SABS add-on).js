//=============================================================================
// SEK_ChangeActor(SABS add-on).js
//=============================================================================

/*:
* @plugindesc Add-on for SEK_SingleActorBS (SABS). Adds the possibility to change your active actor with another one.
* @author SEK
*
*
*@param Command Name
*@desc The command name that will be shown in battle. Default is "Change".
*@default Change
*
*/
//NOTE: It may cause problems if used without SABS!
var params=PluginManager.parameters('SEK_ChangeActor(SABS add-on)');
var cambio=String(params['Command Name']||"Change");

var prpr=Window_PartyCommand.prototype.makeCommandList;
Window_PartyCommand.prototype.makeCommandList = function() {
    prpr.call(this);
	this.addChangeCommand();
    //this.addCommand(cambio, 'change', true);
};

var membri = [];

Window_PartyCommand.prototype.addChangeCommand = function() {

	var changing=false;
	var i;
	for (i=1;i<$gameParty.allMembers().length; i++)
	{
	if($gameParty.allMembers()[i]!=null)
	if($gameParty.allMembers()[i].hp!=0){
	changing=true;
	}
	}
    this.addCommand(cambio, 'change', changing);
};

var aliasetto=Scene_Battle.prototype.createPartyCommandWindow;
Scene_Battle.prototype.createPartyCommandWindow = function() {
    aliasetto.call(this);
    this._partyCommandWindow.setHandler('change', this.commandChange.bind(this));
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
    var wh = this._statusWindow.y;
    this._changeWindow = new Window_BattleChange(0, 0, Graphics.boxWidth, wh);
    this._changeWindow.setHelpWindow(this._helpWindow);
    this._changeWindow.setHandler('ok',     this.onChangeOk.bind(this));
    this._changeWindow.setHandler('cancel', this.onChangeCancel.bind(this));
    this.addWindow(this._changeWindow);
    this.refreshStatus();
};

Scene_Battle.prototype.commandChange = function() {
    this._changeWindow.refresh();	
    this._changeWindow.show();
    this._changeWindow.activate();
	
};

var attuali=[];
Scene_Battle.prototype.onChangeOk = function() {
	
    var x = this._changeWindow.item();
	x++;
	$gameParty.swapOrder(0, x);
    this._actorWindow.hide();
    this._skillWindow.hide();
    this._itemWindow.hide();
    this._changeWindow.refresh();
    this._changeWindow.hide();
    this.refreshStatus();
	this.jumpNextCommand();
};

Scene_Battle.prototype.jumpNextCommand = function() {
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
}

Window_ChangeList.prototype = Object.create(Window_Selectable.prototype);
Window_ChangeList.prototype.constructor = Window_ChangeList;

Window_ChangeList.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._data = [];
	this._index=0;
};

Window_ChangeList.prototype.maxCols = function() {
    return 3;
};

Window_ChangeList.prototype.spacing = function() {
    return 148;
};

Window_ChangeList.prototype.maxItems = function() {
    return this._data ? this._data.length : 1;
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

var totale;
Window_ChangeList.prototype.makeItemList = function() {
    actors = [];
	this._data=[];
var i;
actors.push($gameParty.allMembers()[0].actorId());
for (i=1;i<$gameParty.allMembers().length; i++)
{
if($gameParty.allMembers()[i]!=null)
if($gameParty.allMembers()[i].hp!=0){
this._data.push($gameParty.allMembers()[i]);
actors.push($gameParty.allMembers()[i].actorId());}
}
};

var pre=30;//some space before the first line of faces
Window_ChangeList.prototype.itemRect = function(index) {
    var rect = new Rectangle();
    var maxCols = this.maxCols();
    rect.width = 144;
    rect.height = 144;
	var add=70; //more space between two faces.
    rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
    rect.y = pre + Math.floor(index / maxCols) * (rect.height+add) - this._scrollY;
    return rect;
};

Window_ChangeList.prototype.drawItem = function(index) {
    var actor = this._data[index];
    if (actor) {
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        this.changePaintOpacity(this.isEnabled(actor));
		this.drawActorFace(actor, rect.x, rect.y,144,144);
		this.drawActorName(actor, rect.x, rect.y-pre,144);
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
}

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
