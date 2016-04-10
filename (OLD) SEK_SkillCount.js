//=============================================================================
// SEK_SkillCount.js
//=============================================================================

/*:
* @plugindesc Counts how many times a skill has been used by an actor.
* @author SEK
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
*/

(function() {
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
			}
		}
	};
	
	Game_Interpreter.prototype.setUses = function(actorId, skillId, count){
		$gameActors.actor(actorId)._SkillCounter[skillId] = count;
	};
	
	Game_Interpreter.prototype.addUses = function(actorId, skillId, add){
		if ($gameActors.actor(actorId)._SkillCounter[skillId]) add+=$gameActors.actor(actorId)._SkillCounter[skillId];
		$gameActors.actor(actorId)._SkillCounter[skillId] = add;
	};
	
	Game_Interpreter.prototype.getUses = function(actorId, skillId, variableId){
		console.log("id = "+actorId+", skillId = "+skillId+"||Variabile = "+variableId);
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
	};

	var aliasnewskill = Game_Actor.prototype.learnSkill;
	Game_Actor.prototype.learnSkill = function(skillId) {
		if (!this.isLearnedSkill(skillId))
		{
			this._SkillCounter[skillId] = 0;
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
