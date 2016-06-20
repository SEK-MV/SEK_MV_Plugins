//=============================================================================
// SEK_BodyGuards.js
//=============================================================================

/*:
* @plugindesc With this plugin you can make your party members act like bodyguard for one of them!
* @author SEK
*
*
*@param Actor to defend
*@desc The Id of the actor that will be defended. Default is "0".
*@default 0
*
*@param Success Percentage
*@desc Default is "40".
*@default 40
*
*@param Enabled
*@desc If true, the plugin will be enabled. Default is "true".
*@default true
*
* @help 
* 
* To set the message to be shown when an actor defends, write in its notetags
*  "<bodyg:Text to be shown>" (without quotation marks)
* Plugin Commands:
*
* bodyg on   Activates the plugin
* bodyg off  Deactivates the plugin
* 
* bodyg perc x      Success percentage becomes x (from 0 to 100).
* bodyg actor x     Actor x will be defended
* 
*You are free to use this plugin. If you do use it, I'd like to have my name and my plugin's name included in credits.
*/
var params=PluginManager.parameters('SEK_BodyGuards');
var actor=Number(params['Actor to defend'] || 0);
var enabled=(params['Enabled'] || "true").toLowerCase()==="true";
var perc=Number(params['Success Percentage'] || 40);

var intrptr = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		intrptr.call(this, command, args);
		if (command.toLowerCase() === "bodyg") {
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
                                case 'perc':
				{
					perc=args[1];
				} break;				
				case 'actor':
				{
					actors=args[1];
                                    } break;
			}
		}
	};


var danno;
var bg=false;

Game_Action.prototype.bodyGuard = function(target,value) {
    if (target.isActor()&&enabled&&target.index()===actor)
    {
        var shield;
        var bg=false;
        for (var i=0;i<$gameParty.members().length;i++)
            {
                if ($gameParty.members()[i].index()!==actor&&$gameParty.members()[i].hp!=0&&(!shield||$gameParty.members()[i].agi>shield.agi))
                {
                    shield=$gameParty.members()[i];
                    bg=true;
                }
            }
            if (bg&&(value>target.hp))
            {
                target=this.Defender($gameParty.members().clone(), shield);
                if (!target) {
                    var critical = (Math.random() < this.itemCri(shield));
                    danno = this.makeDamageValue(shield, critical);
                    target=shield;
                }
            }
            else if (bg&&this.processDefend())
            {
                target=this.Defender($gameParty.members().clone(), shield);
                if (!target) {
                    var critical = (Math.random() < this.itemCri(shield));
                    danno = this.makeDamageValue(shield, critical);
                    target=shield;
                }
            }
        
    }
    return target;
};

Game_Action.prototype.Defender = function (membri, shield)
{
    var critical = (Math.random() < this.itemCri(shield));
    var value = this.makeDamageValue(shield, critical);
    if (value>=shield.hp)
    {
        var array=[];
        for (var i=0;i<membri.length;i++)
            if(membri[i].index()!=shield.index())
                array.push(membri[i]);
        membri=array;
        if (membri.length==0) return null;
        shield=null;
        for (var i=0;i<membri.length;i++)
            {
                if (membri[i].hp!=0&&(!shield||membri[i].agi>shield.agi))
                {
                    shield=membri[i];
                }
            }
        if (shield)
            return this.Defender(membri,shield);
    }
    bg=true;
    danno=value;
    return shield;     
};


Game_Action.prototype.apply = function(target) {
    var result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = (result.used && Math.random() >= this.itemHit(target));
    result.evaded = (!result.missed && Math.random() < this.itemEva(target));
    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.isHit()) {
        if (this.item().damage.type > 0) {
            result.critical = (Math.random() < this.itemCri(target));
            var value = this.makeDamageValue(target, result.critical);
            danno=value;
            bg=false;
            target=this.bodyGuard(target, value);
            if (bg){
                var testo=$dataActors[target.actorId()].meta.bodyg;
                console.log(testo);
                if (testo){
                $gameMessage.setFaceImage(target._faceName,target._faceIndex);
                $gameMessage.add(testo);}
                this.apply(target);
                target.performDamage();
                target.startDamagePopup();
            }
            else
            this.executeDamage(target, danno);
        }
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target);
    }
};

Game_Action.prototype.processDefend = function() {
    var success = (Math.random()*100 < perc);
    return success;
};

