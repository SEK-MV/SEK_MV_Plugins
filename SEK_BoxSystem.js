//=============================================================================
// SEK_BoxSystem.js
//=============================================================================

/*:
* @plugindesc Adds a box system where you can deposit or withdraw your characters.
* @author SEK
*
* @param Menu Box
* @desc Set this True to see the box command in your menu. Default is False.
* @default False
*
* @param Command Name
* @desc The name of the command. Default is Box.
* @default Box
*
* @param Team Text
* @desc The text that will be shown over your current party. Default is Team.
* @default Team
*
* @param Box Text
* @desc The text that will be shown over your characters in the box. Default is Box
* @default Box
*
* @param Max Members
* @desc Max members in Team. Default is 6
* @default 6
* 
* @param Heal On Deposit
* @desc When an actor is deposited, he will recover all his HPs&MPs. Default is true
* @default true
* 
* @help 
* 
* Plugin Commands:
*
* Box Open - Opens the box.
* Box Add x - Add member x to your box.
* Box Remove x - Remove member x from your box.
* Box On - Enables the box command in your menu.
* Box Off - Disables the box command in your menu.
* Box MenuOn - Box command will show up in your menu.
* Box MenuOff - Box command will not show up in your menu.
*
* Examples:
*
* Box Open
* Box Add 7
* Box Remove 8
* Box On
* Box Off
* Box MenuOn
* Box MenuOff
*/

(function() {
	var params=PluginManager.parameters('SEK_BoxSystem');
	var MenuBoxBool = (params['Menu Box'] || "False").toLowerCase() === "true";
	var BoxName = String(params['Command Name'] || "Box");
	var TeamText = String(params['Team Text'] || "Team");
	var BoxText = String(params['Box Text'] || "Box");
	var MaxMembers = Number (params['Max Members']||6);
	var cura = (params['Heal On Deposit'] || "True").toLowerCase() === "true";
	var aliasgamin = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliasgamin.call(this, command, args);
		if (command.toLowerCase() === "box") {
			switch (args[0].toLowerCase())
			{
				case 'open':
				{
					SceneManager.push(Scene_Box);
				} break;				
				case 'add':
				{
					$gameParty.BoxAddMember(Number(args[1]));
				} break;
				case 'remove':
				{
					$gameParty.BoxRemoveMember(Number(args[1]));
				} break;
				case 'on':
				{
					$gameSystem.BoxOnOff(true);
				} break;
				case 'off':
				{
					$gameSystem.BoxOnOff(false);
				} break;
				case 'menuon':
				{
					$gameSystem.menuOnOff(true);
				} break;
				case 'menuoff':
				{
					$gameSystem.menuOnOff(false);
				} break;
			}
		}
	};

	Game_System.prototype.BoxOnOff = function(bool) {
		this.OnOff = bool;
	};

	Game_System.prototype.isBoxOn = function() {
		return this.OnOff;
	};

	Game_System.prototype.menuOnOff = function(bool) {
		MenuBoxBool = bool;
	};
	
	var aliascomm = Window_MenuCommand.prototype.addOriginalCommands;
	
	Window_MenuCommand.prototype.addOriginalCommands = function() {
		aliascomm.call(this);
		if (MenuBoxBool)
			this.addCommand(BoxName, 'Box', $gameSystem.isBoxOn());
	};

	var aliasmenu = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		aliasmenu.call(this);
		this._commandWindow.setHandler('Box', this.commandBox.bind(this));
	};

	Scene_Menu.prototype.commandBox = function() {
		SceneManager.push(Scene_Box);
	};

	var aliasparty = Game_Party.prototype.initialize;
	Game_Party.prototype.initialize = function() {
		aliasparty.call(this);
		this._TeamCharacters = [];
		this._BoxCharacters = [];
	};

	Game_Party.prototype.createBoxCharacter = function() {
		return {ID: 0};
	};

	Game_Party.prototype.getTeamCharacters = function() {
		return this._TeamCharacters;
	};

	Game_Party.prototype.haveCharacter = function(id) {
		for (var i = 0; i < this._TeamCharacters.length; i++) {
			if (this._TeamCharacters[i].ID === id) return true;
		}
		for (var i = 0; i < this._BoxCharacters.length; i++) {
			if (this._BoxCharacters[i].ID === id) return true;
		}
		return false;
	};

	Game_Party.prototype.MembroNelTeam = function(id) {
		for (var i = 0; i < this.allMembers().length; i++) {
			if (this.allMembers()[i].actorId() === id) return true;
		}
		return false;
	};

	Game_Party.prototype.BoxAddMember = function(id) {
		if (!this.haveCharacter(id)) {
			var tempChar = this.createBoxCharacter();
			tempChar.ID = id;
			if (this.MembroNelTeam(id))
				{
				this._BoxCharacters.push(tempChar);}
			else
				this._TeamCharacters.push(tempChar);
				ImageManager.loadFace($gameActors.actor(id).faceName());
		} else {
			for (var i = 0; i < this._BoxCharacters.length; i++) {
				var member = this._BoxCharacters[i];
				if (member.ID === id) {
					this._TeamCharacters.push(member);
					this._BoxCharacters.splice(i, 1);
					break;
				}
			}
		}
	};

	Game_Party.prototype.BoxRemoveMember = function(id) {
		if (!this.haveCharacter(id)) {
			var tempChar = this.createBoxCharacter();
			tempChar.ID = id;
			ImageManager.loadFace($gameActors.actor(id).faceName());
			this._BoxCharacters.push(tempChar);
		} else {
			for (var i = 0; i < this._TeamCharacters.length; i++) {
				if (this._TeamCharacters[i].ID === id) {
					var member = this._TeamCharacters[i];
					this._BoxCharacters.push(member);
					this._TeamCharacters.splice(i, 1);
					break;
				}
			}
		}
	};
	
	Game_Party.prototype.initActors = function (){
	var membri=$gameParty.allMembers();
	for (var i=0;i<$gameParty.allMembers().length;i++)
	{
	var tempor=membri[i].actorId();
	this.removeActor(tempor);
	this.addActor(tempor);
	}
	};
	
	var aliasadd = Game_Party.prototype.addActor;
	Game_Party.prototype.addActor = function(actorId) {
		if (!this._actors.contains(actorId)) this.BoxRemoveMember(actorId);
		aliasadd.call(this, actorId);
	};

	var aliasremove = Game_Party.prototype.removeActor;
	Game_Party.prototype.removeActor = function(actorId) {
		if (this._actors.contains(actorId)) this.BoxAddMember(actorId);
		aliasremove.call(this, actorId);
	};

	function Scene_Box() {
		this.initialize.apply(this, arguments);	
	};
	
	Scene_Box.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_Box.prototype.constructor = Scene_Box;
	
	Scene_Box.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
		$gameParty.initActors();
		this.loadImages();
	};
	
	
	Scene_Box.prototype.loadImages = function() {
		$gameParty.members().forEach(function(actor) {
			ImageManager.loadFace(actor.faceName());
		});
		$gameParty.getTeamCharacters().forEach(function(actor) {
			if (actor)
			ImageManager.loadFace($gameActors.actor(actor.ID).faceName());
		});
	};
	
	Scene_Box.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createTeamWindowName();
		this.createTeamWindow();
		this.createBoxWindowName();
		this.createBoxWindow();
		this._windowMembriDelTeam.refresh();
		this._windowNomeTeam.refresh();
		this._windowMembriNelBox.refresh();
		this._TeamTextWindow.refresh();
	};

	Scene_Box.prototype.createTeamWindowName = function() {
		var ww = 816;
		var wx = Graphics.boxWidth/2 - 816/2;
		var wy = Graphics.boxHeight/2 - 624/2;
		this._TeamTextWindow = new BoxWindow_TeamText(wx, wy, ww);
		this._TeamTextWindow.refresh();
		this.addWindow(this._TeamTextWindow);
	};

	Scene_Box.prototype.createTeamWindow = function() {
		var ww = 816;
		var wx = this._TeamTextWindow.x;
		var wy = this._TeamTextWindow.y + this._TeamTextWindow.height;
		this._windowMembriNelBox = new BoxWindow_MembriNelBox(wx, wy, ww);
		this._windowMembriNelBox.setHandler('ok', this.TeamOk.bind(this));
		this._windowMembriNelBox.setHandler('cancel', this.TeamCancel.bind(this));
		this._windowMembriNelBox.refresh();
		this.addWindow(this._windowMembriNelBox);
		this._windowMembriNelBox.select(0);
		this._windowMembriNelBox.activate();
	};

	Scene_Box.prototype.createBoxWindowName = function() {
		var ww = 816;
		var wx = this._windowMembriNelBox.x;
		var wy = this._windowMembriNelBox.y + this._windowMembriNelBox.height;
		this._windowNomeTeam = new BoxWindow_NomeDelBox(wx, wy, ww);
		this._windowNomeTeam.refresh();
		this.addWindow(this._windowNomeTeam);
	};

	Scene_Box.prototype.createBoxWindow = function() {
		var ww = 816;
		var wx = this._windowNomeTeam.x;
		var wy = this._windowNomeTeam.y + this._windowNomeTeam.height;
		var wh = 624 - this._TeamTextWindow.height - this._windowMembriNelBox.height - this._windowNomeTeam.height;
		this._windowMembriDelTeam = new BoxWindow_MembriTotali(wx, wy, ww, wh);
		this._windowMembriDelTeam.setHandler('ok', this.PersOk.bind(this));
		this._windowMembriDelTeam.setHandler('cancel', this.PersCancel.bind(this));
		this.addWindow(this._windowMembriDelTeam);
		this._windowMembriDelTeam.refresh();
		this._windowNomeTeam.refresh();
		this._windowMembriNelBox.refresh();
		this._TeamTextWindow.refresh();
	};

	Scene_Box.prototype.TeamOk = function() {
		this._windowMembriDelTeam.refresh();
		this._windowNomeTeam.refresh();
		this._windowMembriNelBox.refresh();
		this._TeamTextWindow.refresh();
		this._windowMembriNelBox.deactivate();
		this._windowMembriNelBox.refresh();
		this._windowMembriDelTeam.select(0);
		this._windowMembriDelTeam.activate();
	};

	Scene_Box.prototype.TeamCancel = function() {
		if ($gameParty.members().length === 0)
		{
			this._windowMembriNelBox.playBuzzerSound();
			return;
		}
        SoundManager.playCancel();
		this.popScene();
	};

	Scene_Box.prototype.PersOk = function() {
		var actor = this._windowMembriDelTeam.item(this._windowMembriDelTeam.index());
		var Personaggio = this._windowMembriNelBox.item(this._windowMembriNelBox.index());
		if (actor)
			{
				$gameParty.addActor(actor.actorId());
			}
		if (Personaggio)
		{
			if(!actor)
			for (var k=this._windowMembriNelBox.index();k<$gameParty.members().length-1;k++)
				$gameParty.swapOrder(k, k+1);
			else
			$gameParty.swapOrder(this._windowMembriNelBox.index(), $gameParty.members().length-1);
			if (cura){
			var recupera=$gameActors.actor(Personaggio.actorId());
			recupera.setHp(1);
			recupera._hp=recupera.mhp;
			recupera._mp = recupera.mmp;
			}
			$gameParty.removeActor(Personaggio.actorId());
		}
		this._windowMembriDelTeam.refresh();
		this._windowNomeTeam.refresh();
		this._windowMembriNelBox.refresh();
		this._TeamTextWindow.refresh();
		this._windowMembriDelTeam.deselect();
		this._windowMembriDelTeam.deactivate();
		this._windowMembriNelBox.activate();
	};

	Scene_Box.prototype.PersCancel = function() {
		this._windowMembriDelTeam.refresh();
		this._windowNomeTeam.refresh();
		this._windowMembriNelBox.refresh();
		this._TeamTextWindow.refresh();
		this._windowMembriDelTeam.deselect();
		this._windowMembriDelTeam.deactivate();
		this._windowMembriNelBox.activate();
	};

	function BoxWindow_TeamText() {
		this.initialize.apply(this, arguments);	
	};
	
	BoxWindow_TeamText.prototype = Object.create(Window_Base.prototype);
	BoxWindow_TeamText.prototype.constructor = BoxWindow_TeamText;
	
	BoxWindow_TeamText.prototype.initialize = function(x, y, w) {
		Window_Base.prototype.initialize.call(this, x, y, w, this.fittingHeight(1));
		this.refresh();
	};
	
	BoxWindow_TeamText.prototype.refresh = function() {
		this.contents.clear();
		var testo = TeamText;
		this.drawText(testo, 0, 0, this.contentsWidth(), 'center');
	};

	function BoxWindow_MembriNelBox() {
		this.initialize.apply(this, arguments);	
	};
	
	BoxWindow_MembriNelBox.prototype = Object.create(Window_Selectable.prototype);
	BoxWindow_MembriNelBox.prototype.constructor = BoxWindow_MembriNelBox;
	
	BoxWindow_MembriNelBox.prototype.initialize = function(x, y, w) {
		Window_Selectable.prototype.initialize.call(this, x, y, w, this.fittingHeight());
		this.refresh();
	};

	BoxWindow_MembriNelBox.prototype.maxItems = function() {
		var _maxLen = $gameParty.members().length;
			return _maxLen < MaxMembers ? _maxLen + 1 : MaxMembers;
	};

	BoxWindow_MembriNelBox.prototype.maxCols = function() {
	    return 6;
	};

	BoxWindow_MembriNelBox.prototype.itemWidth = function() {
	    return 112;
	};

	BoxWindow_MembriNelBox.prototype.itemHeight = function() {
	    return 112;
	};

	BoxWindow_MembriNelBox.prototype.fittingHeight = function() {
		return this.standardPadding()*2 + this.itemHeight();
	};

	BoxWindow_MembriNelBox.prototype.item = function(index) {
		return $gameParty.members()[index];
	};
		

	BoxWindow_MembriNelBox.prototype.drawItem = function(index) {
		var actor = this.item(index);
		if (actor) 
		{	
			ImageManager.loadFace(actor.faceName());
			var rect = this.itemRect(index);
			this.changePaintOpacity(true);
			this.drawActorFace(actor, rect.x, rect.y,110,110);
			this.drawActorName(actor, rect.x, rect.y+80,110);
			this.changePaintOpacity(true);
		}
	};
	
	BoxWindow_MembriNelBox.prototype.itemRect = function(index) {
	    var rect = new Rectangle();
	    var maxCols = this.maxCols();
	    rect.width = this.itemWidth();
	    rect.height = this.itemHeight();
	    rect.x = index % maxCols * 136;
	    rect.y = Math.floor(index / maxCols) * 112 - this._scrollY;
	    return rect;
	};
	
	
	BoxWindow_MembriNelBox.prototype.refresh = function(){
		this.createContents();
		this.drawAllItems();
	};
	

	BoxWindow_MembriNelBox.prototype.processCancel = function() {
	    this.updateInputData();
	    this.callCancelHandler();
	};

	function BoxWindow_NomeDelBox() {
		this.initialize.apply(this, arguments);	
	};
	
	BoxWindow_NomeDelBox.prototype = Object.create(Window_Base.prototype);
	BoxWindow_NomeDelBox.prototype.constructor = BoxWindow_NomeDelBox;
	
	BoxWindow_NomeDelBox.prototype.initialize = function(x, y, w) {
		Window_Base.prototype.initialize.call(this, x, y, w, this.fittingHeight());
		this.refresh();
	};
	
	BoxWindow_NomeDelBox.prototype.refresh = function() {
		this.contents.clear();
			this.drawText(BoxText, 0, this.contentsHeight()/2-this.lineHeight()/2, this.contentsWidth(), 'center');
	};

	BoxWindow_NomeDelBox.prototype.fittingHeight = function() {
		return this.standardPadding()*2 + 48;
	};
	
	function BoxWindow_MembriTotali() {
		this.initialize.apply(this, arguments);	
	};
	
	BoxWindow_MembriTotali.prototype = Object.create(Window_Selectable.prototype);
	BoxWindow_MembriTotali.prototype.constructor = BoxWindow_MembriTotali;
	
	BoxWindow_MembriTotali.prototype.initialize = function(x, y, w, h) {
		Window_Selectable.prototype.initialize.call(this, x, y, w, h);
		this.refresh();
	};

	BoxWindow_MembriTotali.prototype.maxItems = function() {
		if ($gameParty.getTeamCharacters().length > 0)
			return $gameParty.getTeamCharacters().length + 1; //edita qui con MaxMembers
		else
			return 0;
	};

	BoxWindow_MembriTotali.prototype.maxCols = function() {
	    return 6;
	};

	BoxWindow_MembriTotali.prototype.itemWidth = function() {
	    return 112;
	};

	BoxWindow_MembriTotali.prototype.itemHeight = function() {
	    return 112;
	};

	BoxWindow_MembriTotali.prototype.fittingHeight = function() {
		return this.standardPadding()*2 + this.itemHeight();
	};

	BoxWindow_MembriTotali.prototype.item = function(index) {
		if ($gameParty.getTeamCharacters()[index])
			{
			return $gameActors.actor($gameParty.getTeamCharacters()[index].ID)
			}
		return null;
	};
	
	BoxWindow_MembriTotali.prototype.drawItem = function(index) {
		var actor = this.item(index);
		if (actor)
		{	
			var rect = this.itemRect(index);
   			this.changePaintOpacity(true);
			this.drawActorFace(actor, rect.x, rect.y,110,110);
			this.drawActorName(actor, rect.x, rect.y+80,110);
			this.changePaintOpacity(true);
		}
	};

	BoxWindow_MembriTotali.prototype.itemRect = function(index) {
	    var rect = new Rectangle();
	    var maxCols = this.maxCols();
	    rect.width = this.itemWidth();
	    rect.height = this.itemHeight();
	    rect.x = (index%maxCols *136);
	    rect.y = Math.floor(index / maxCols) * 112 - this._scrollY;
	    return rect;
	};

	})();
