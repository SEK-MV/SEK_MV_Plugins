//=============================================================================
// SEK_AttackCountAndFormula.js
//=============================================================================

/*:
* @plugindesc Counts uses of skills and attacks and adds a bonus damage formula.
* @author SEK
*
*
* @param Skill General Formula
* @desc General formula for new skill's bonus damage. If 0, no bonus will be added. Default is "ac*lv".
* @default ac*lv
*
* @param Weapon General Formula
* @desc General formula for new weapon's bonus damage. If 0, no bonus will be added. Default is "ac*lv".
* @default ac*lv
*
* @param Draw Skill Counter in menu
* @desc Set this true to draw Skill Counter in menu. Default is true.
* @default true
*
* @param Menu Counter Color
* @desc Skill Counter's color. Use message colors. Default is 6.
* @default 6
*
* @param Skill Counter Menu Text
* @desc Skill Counter's Text in menu. Write "null" to hide it. Default is "Counter:".
* @default Counter:
*
* @param Font Size
* @desc Skill Counter's Font Size in menu. Default is 20.
* @default 20
*
* @help 
*
* You can also manage the number of uses.
*
* Note: plugin commands are not case sensitive!
*
* Plugin Commands:
* 
* AttackCount showsc
* If Draw Skill Counter in menu is true, sets it false, otherwise sets it true.
*
* AttackCount set x y z
* Sets the counter of a skill from an actor to a specific number.
* x = actorId
* y = skillId
* z = number of uses
*
* AttackCount get x y z
* Puts the counter of a skill from an actor into a Variable.
* x = actorId
* y = skillId
* z = variableId 
*
* AttackCount add x y z
* Adds a specific number of uses to the counter of a skill from an actor.
* x = actorId
* y = skillId
* z = number of uses to add
*
* AttackCount GFset x
* Changes the base damage bonus formula used for all new skills.
* x = formula, written with no spaces, 
*	  where 
*			-ac = y's attack counter; 
*			-lv = x's level
*	  		-gf = General Formula
*
* AttackCount bonus x y z
* Adds a bonus damage/heal to the basic damage/heal
* based on a formula that must be written with no spaces.
* x = actorId
* y = skill to apply the formula to
* z = formula, written with no spaces, 
*	  where 
*			-ac = y's attack counter; 
*			-lv = x's level
*	  		-gf = General Formula
*
* Example: AttackCount bonus 1 10 25*ac+2*lv
* if actor one is level 10 and has used skill 10 five times,
* bonus damage will be 25*5+2*10 = 145.
*
* AttackCount limit x y z
* Adds a limit to an actor's attack's counter.
* Note: Attack Counter will still increase, but if it goes over
*       this limit, it will be considered lowered to the limit
*       during bonus damage calculation. 
*		Set it to -1 to remove the limit!
* x = actorId
* y = skillId
* z = Attack Counter Limit
*
* Plugin Commands are the same for weapons: just add "w" before the command.
* Example: AttackCount wlimit x y z
*/

(function() {
	var params=PluginManager.parameters('SEK_AttackCountAndFormula');
	var Formula = String(params['Skill General Formula'] || "ac*lv");
	var wFormula = String(params['Weapon General Formula'] || "ac*lv");
	var showsc = (params['Draw Skill Counter in menu'] || "true").toLowerCase()==="true";
	var colore = Number(params['Menu Counter Color'] || 6);
	var scText = String(params['Skill Counter Menu Text'] || "Counter:");
	var fSize = Number(params['Font Size'] || 20);
	var aliasgamin = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliasgamin.call(this, command, args);
		if (command.toLowerCase() === "attackcount") {
			switch (args[0].toLowerCase())
			{		
				case 'showsc':
				{
					if (showsc) showsc=false;
					else showsc=true;
				} break;			
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
				case 'wset':
				{
					var num=0;
					if (Number(args[3])!=null)
					num=Number(args[3]);
					this.wsetUses(Number(args[1]), Number(args[2]), num);
				} break;
				case 'wget':
				{
					this.wgetUses(Number(args[1]),Number(args[2]),Number(args[3]));
				} break;
				case 'wadd':
				{
					this.waddUses(Number(args[1]),Number(args[2]),Number(args[3]));
				} break;
				case 'wbonus':
				{
					this.wsetFormula(Number(args[1]), Number(args[2]), String(args[3]));
				} break;
				case 'wlimit':
				{
					this.wsetLimit(Number(args[1]), Number(args[2]), Number(args[3]));
				} break;
				case 'wgfset':
				{
					wFormula = String(args[1]);
				} break;
			}
		}
	};
	console.log(Formula);
	Window_SkillList.prototype.drawSkillCounter = function(skill, x, y, width) {
			var Testo=this._actor._SkillCounter[skill.id];
			if (scText!="null") Testo=scText+Testo;
			this.contents.fontSize=fSize;
			this.changeTextColor(this.textColor(colore));
            this.drawText(Testo, x, y, width-4, 'right');
			this.contents.fontSize=this.standardFontSize();
    }
	
Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
    if (this._actor.skillTpCost(skill) > 0) {
        this.changeTextColor(this.tpCostColor());
        this.drawText(this._actor.skillTpCost(skill), x, y, width, 'right');
    } else if (this._actor.skillMpCost(skill) > 0) {
        this.changeTextColor(this.mpCostColor());
        this.drawText(this._actor.skillMpCost(skill), x, y, width, 'right');
    }
	return ret-this.costWidth();
};

var ret
Window_SkillList.prototype.drawItem = function(index) {
    var skill = this._data[index];
    if (skill) {
        var costWidth = this.costWidth();
		var counterWidth = this.counterWidth(skill.id);
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
		ret = rect.width;
        this.changePaintOpacity(this.isEnabled(skill));
		 var space= this.textWidth(skill.name);
        this.drawItemName(skill, rect.x, rect.y, rect.width - costWidth-counterWidth);
		var dw = this.drawSkillCost(skill, rect.x, rect.y, rect.width);
		if (showsc)
		{
		this.drawSkillCounter(skill, rect.x, rect.y, dw);
		}
        this.changePaintOpacity(1);
    }};

Window_SkillList.prototype.counterWidth = function(skillId) {
    return this.textWidth(this._actor._SkillCounter[skillId]);
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
			{
			var bonus=((a._SkillDmgBonus[this._item._itemId]).toLowerCase()).replace(new RegExp("gf", 'g') , (""+Formula)).replace(new RegExp("lv", 'g') , (""+a._level));
			if ((Number(a._SCLimit[this._item._itemId])<0)||(Number(a._SkillCounter[this._item._itemId])<=Number(a._SCLimit[this._item._itemId])))
			{
				return (Math.max(eval(item.damage.formula), 0)+eval((bonus).replace(new RegExp("ac", 'g') , (""+a._SkillCounter[this._item._itemId])))) * sign;
			}
				return (Math.max(eval(item.damage.formula), 0)+eval((bonus).replace(new RegExp("ac", 'g') , (""+a._SCLimit[this._item._itemId])))) * sign;
			
			}
			if (this.isAttack()&&(a.isActor())&&(a.weapons().length!=0))
			{
			var armi=0;
			var idArmi=[];
				if (a.weapons()[0]){idArmi[0]= a.weapons()[0].id; armi++;}
				if (a.weapons()[1]){idArmi[1]= a.weapons()[1].id; armi++;}
				
				for (arma=0;arma<armi;arma++)
				{
					a._WeaponCounter[idArmi[arma]]?a._WeaponCounter[idArmi[arma]]++:a._WeaponCounter[idArmi[arma]]=1;
				}
				var bonus;
				if (!((a._WeaponDmgBonus[idArmi[0]]))) bonus=wFormula;
				else bonus=a._WeaponDmgBonus[idArmi[0]];
				bonus=bonus.toLowerCase().replace(new RegExp("gf", 'g') , (""+wFormula)).replace(new RegExp("lv", 'g') , (""+a.level));
				if ((!(a._WCLimit[idArmi[0]]))||(a._WCLimit[idArmi[0]]<0)||(a._WeaponCounter[idArmi[0]]<a._WCLimit[idArmi[0]]))
				{
					return (Math.max(eval(item.damage.formula), 0)+eval((bonus).replace(new RegExp("ac", 'g') , (""+a._WeaponCounter[idArmi[0]])))) * sign;
				}
					return (Math.max(eval(item.damage.formula), 0)+eval((bonus).replace(new RegExp("ac", 'g') , (""+a._WCLimit[idArmi[0]])))) * sign;
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
	//________________
	
	
	Game_Interpreter.prototype.wsetLimit = function(actorId, WeaponId, limit){
	$gameActors.actor(actorId)._WCLimit[WeaponId]=limit;
	}
	
	Game_Interpreter.prototype.wsetFormula = function(actorId, WeaponId, bonus){
		$gameActors.actor(actorId)._WeaponDmgBonus[WeaponId]=bonus;
	}
	
	Game_Interpreter.prototype.wsetUses = function(actorId, WeaponId, count){
		$gameActors.actor(actorId)._WeaponCounter[WeaponId] = count;
	};
	
	Game_Interpreter.prototype.waddUses = function(actorId, WeaponId, add){
		if ($gameActors.actor(actorId)._WeaponCounter[WeaponId]) add+=$gameActors.actor(actorId)._WeaponCounter[WeaponId];
		$gameActors.actor(actorId)._WeaponCounter[WeaponId] = add;
	};
	
	Game_Interpreter.prototype.wgetUses = function(actorId, WeaponId, variableId){
		var ret=0;
		if ($gameActors.actor(actorId)._WeaponCounter[WeaponId]) ret=$gameActors.actor(actorId)._WeaponCounter[WeaponId];
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
	    this._WeaponCounter = {};
		this._WeaponDmgBonus = {};
		this._WCLimit = {};
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

	Game_Actor.prototype.AttackCountPlus = function(skill) {
		if (!this._SkillCounter[skill.id]) this._SkillCounter[skill.id] = 0;
		this._SkillCounter[skill.id]++;
	};

	var aliasuse = Game_Actor.prototype.useItem;
	Game_Actor.prototype.useItem = function(item) {
		aliasuse.call(this, item);
		if (DataManager.isSkill(item))
		{
			this.AttackCountPlus(item);
		}
	};
	
})();
