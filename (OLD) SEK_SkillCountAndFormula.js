//=============================================================================
// SEK_SkillCountAndFormula.js
//=============================================================================

/*:
* @plugindesc Counts uses of skills and adds a bonus damage formula.
* @author SEK
* 
* @param General Formula
* @desc General formula for new skill's bonus damage. If 0, no bonus will be added. Default is "sc*lv".
* @default sc*lv
*
* @help 
*
* You can also manage the number of uses.
*
* Note: plugin commands are not case sensitive!
*
* Plugin Commands:
* 
* SkillCount set x y z
* Sets the counter of a skill from an actor to a specific number.
* x = actorId
* y = skillId
* z = number of uses
*
* SkillCount get x y z
* Puts the counter of a skill from an actor into a Variable.
* x = actorId
* y = skillId
* z = variableId
*
* SkillCount add x y z
* Adds a specific number of uses to the counter of a skill from an actor.
* x = actorId
* y = skillId
* z = number of uses to add
*
* SkillCount GFset x
* Changes the base damage bonus formula used for all new skills.
* x = formula, written with no spaces, 
*	  where 
*			-sc = y's skill counter; 
*			-lv = x's level
*	  		-gf = General Formula
*
* SkillCount bonus x y z
* Adds a bonus damage/heal to the basic damage/heal
* based on a formula that must be written with no spaces.
* x = actorId
* y = skill to apply the formula to
* z = formula, written with no spaces, 
*	  where 
*			-sc = y's skill counter; 
*			-lv = x's level
*	  		-gf = General Formula
*
* Example: SkillCount bonus 1 10 25*sc+2*lv
* if actor one is level 10 and has used skill 10 five times,
* bonus damage will be 25*5+2*10 = 145.
*
* SkillCount limit x y z
* Adds a limit to an actor's skill's counter.
* Note: Skill Counter will still increase, but if it goes over
*       this limit, it will be considered lowered to the limit
*       during bonus damage calculation. 
*		Set it to -1 to remove the limit!
* x = actorId
* y = skillId
* z = Skill Counter Limit
*
*/

(function() {
	var params=PluginManager.parameters('SEK_BoxSystem');
	var Formula = String(params['General Formula'] || "sc*lv");
	
	var aliasgamin = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliasgamin.call(this, command, args);
		if (command.toLowerCase() === "skillcount") {
			switch (args[0].toLowerCase())
			{			
				case 'set':
				{
					var num=0;
					if (Number(args[3])!=null)
					num=Number(args[3]);
					this.setUses(Number(args[1]), Number(args[2]), num);
				} break;
				case 'get':
				{
					this.getUses(Number(args[1]),Number(args[2]),Number(args[3]));
				} break;
				case 'add':
				{
					this.addUses(Number(args[1]),Number(args[2]),Number(args[3]));
				} break;
				case 'bonus':
				{
					this.setFormula(Number(args[1]), Number(args[2]), String(args[3]));
				} break;
				case 'limit':
				{
					this.setLimit(Number(args[1]), Number(args[2]), Number(args[3]));
				} break;
				case 'gfset':
				{
					Formula = String(args[1]);
				} break;
			}
		}
	};
	
		
	Game_Action.prototype.evalDamageFormula = function(target) {
		try {
			var item = this.item();
			var type = this.isSkill();
			var a = this.subject();
			var b = target;
			var v = $gameVariables._data;
			var sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
			if (((type)&&(a.isActor()))&&(a._SkillDmgBonus[this._item._itemId]!=null))
			{var bonus=((a._SkillDmgBonus[this._item._itemId]).toLowerCase()).replace(new RegExp("gf", 'g') , (""+Formula)).replace(new RegExp("lv", 'g') , (""+a._level));
			if ((Number(a._SCLimit[this._item._itemId])<0)||(Number(a._SkillCounter[this._item._itemId])<=Number(a._SCLimit[this._item._itemId])))
			{
				return (Math.max(eval(item.damage.formula), 0)+eval((bonus).replace(new RegExp("sc", 'g') , (""+a._SkillCounter[this._item._itemId])))) * sign;
			}
				return (Math.max(eval(item.damage.formula), 0)+eval((bonus).replace(new RegExp("sc", 'g') , (""+a._SCLimit[this._item._itemId])))) * sign;
			
			}
			return Math.max(eval(item.damage.formula), 0) * sign;
		} catch (e) {
			return 0;
		}
	};
	
	Game_Interpreter.prototype.setLimit = function(actorId, skillId, limit){
	$gameActors.actor(actorId)._SCLimit[skillId]=limit;
	}
	
	Game_Interpreter.prototype.setFormula = function(actorId, skillId, bonus){
		$gameActors.actor(actorId)._SkillDmgBonus[skillId]=bonus;
	}
	
	Game_Interpreter.prototype.setUses = function(actorId, skillId, count){
		$gameActors.actor(actorId)._SkillCounter[skillId] = count;
	};
	
	Game_Interpreter.prototype.addUses = function(actorId, skillId, add){
		if ($gameActors.actor(actorId)._SkillCounter[skillId]) add+=$gameActors.actor(actorId)._SkillCounter[skillId];
		$gameActors.actor(actorId)._SkillCounter[skillId] = add;
	};
	
	Game_Interpreter.prototype.getUses = function(actorId, skillId, variableId){
		var ret=0;
		if ($gameActors.actor(actorId)._SkillCounter[skillId]) ret=$gameActors.actor(actorId)._SkillCounter[skillId];
		$gameVariables.setValue(variableId, ret);
	};

	var initact = Game_Actor.prototype.initMembers;
	var initactb = Game_Battler.prototype.initMembers;
	Game_Actor.prototype.initMembers = function() {
		initact.call(this);
	    initactb.call(this);
	    this._SkillCounter = {};
		this._SkillDmgBonus = {};
		this._SCLimit = {};
	};

	var aliasnewskill = Game_Actor.prototype.learnSkill;
	Game_Actor.prototype.learnSkill = function(skillId) {
		if (!this.isLearnedSkill(skillId))
		{
			this._SkillCounter[skillId] = 0;
			this._SkillDmgBonus[skillId] = "gf";
			this._SCLimit[skillId] = -1;
		}
		aliasnewskill.call(this, skillId);
	};

	Game_Actor.prototype.SkillCountPlus = function(skill) {
		if (!this._SkillCounter[skill.id]) this._SkillCounter[skill.id] = 0;
		this._SkillCounter[skill.id]++;
	};

	var aliasuse = Game_Actor.prototype.useItem;
	Game_Actor.prototype.useItem = function(item) {
		aliasuse.call(this, item);
		if (DataManager.isSkill(item))
		{
			this.SkillCountPlus(item);
		}
	};
	
})();
