//=============================================================================
// SEK_BodyGuards.js
//=============================================================================

/*:
* @plugindesc With this plugin you can make your party members act like bodyguard for one of them!
* @author SEK
*
*
*@param Actor to defend
*@desc The Id of the actor that will be defended. Default is 1.
*@default 1
*
*@param Enabled
*@desc If true, the plugin will be enabled. Default is "true".
*@default true
*
*@param Guard Chance
*@desc If false, guard chance will be disabled (the actor to defend will be protected from sure death anyhow). Default is "true".
*@default true
*
*@param Block Chance
*@desc If true, block chance will be enabled. Default is "true".
*@default true
*
*@param Guard Chance Rate
*@desc Guard Chance % Rate. Default is 40%.
*@default 40
*
*@param Block Chance Rate
*@desc Block Chance % Rate. Default is 30%.
*@default 30
*
* @help 
* Every actor has a percentage of success in defending the selected actor.
* If the selected actor would die if hit, he will be protected for sure.
* To set the message to be shown when an actor defends, write in its notetags
*  "<bodyg:Text to be shown>"  (without quotation marks)
* Plugin Commands:
*
* bodyg on      Activates the plugin
* bodyg off     Deactivates the plugin
* 
* bodyg gon     Activates Guard Chance
* bodyg goff    Deactivates Guard Chance except for attacks that would kill
*               the selected actor.
* 
* bodyg bon     Activates Block Chance
* bodyg boff    Deactivates Block Chance
* 
* bodyg perc x      Success percentage becomes x (from 0 to 100).
* bodyg actor x     Actor x will be defended
* bodyg block x     Sets block chance to x%
* 
*You are free to use this plugin. If you do use it, I'd like to have my name and my plugin's name included in credits.
*/
var params=PluginManager.parameters('SEK_BodyGuards');
var actor=Number(params['Actor to defend'] || 1);
var enabled=(params['Enabled'] || "true").toLowerCase()==="true";
var benabled=(params['Block Chance'] || "true").toLowerCase()==="true";
var genabled=(params['Guard Chance'] || "true").toLowerCase()==="true";
var perc=Number(params['Guard Chance Rate'] || 40);
var brate=Number(params['Block Chance Rate'] || 30);

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
				case 'bon':
				{
					benabled=true;
				} break;				
				case 'boff':
				{
					benabled=false;
				} break;
				case 'gon':
				{
					genabled=true;
				} break;				
				case 'goff':
				{
					genabled=false;
				} break;
                                case 'perc':
				{
					perc=args[1];
				} break;				
				case 'actor':
				{
					actors=args[1];
                                    } break;
                                case 'block':
				{
					brate=args[1];
                                    } break;
			}
		}
	};


var danno;
var bg=false;

Game_Action.prototype.bodyGuard = function(target,value) {
    if (target.isActor()&&enabled&&target.actorId()===actor)
    {
        var shield=this.choseGuard();
        shield? bg=true:bg=false;
        if (bg&&(value>target.hp))
        {
            target=shield;
        }
        else if (bg&&genabled&&this.processDefend())
        {
            target=shield;
        }
        else bg=false;
        return target
    }
    bg=false;
    return target;
};

Game_Action.prototype.choseGuard = function ()
{
    // Select alive fighting members that can defend actor
    var avaliableMembers=[];
    for (var i=0;i<$gameParty.members().length;i++)
    {
        if ($gameParty.members()[i].actorId()!=actor&&$gameParty.members()[i].hp>0)
        {
            avaliableMembers.push($gameParty.members()[i]);
        }
    }
    if (avaliableMembers.length==0) return null;
    
    // Obtain their defending percent
    var membersPercent=this.setPercents(avaliableMembers);
    
    // Chose who should defend
    var defenderIndex = this.defenderIndex(membersPercent);
    
    // Return the defender chosen or the one that will take his place if
    // He would die.
    var shield=avaliableMembers[defenderIndex];
    var critical = (Math.random() < this.itemCri(shield));
    var value = this.makeDamageValue(shield, critical);
    avaliableMembers.splice(defenderIndex,1);
    var ret=this.Defender(avaliableMembers, shield);
    
    if (ret==null) 
    { 
        danno=value;
        return shield;
    }
    return ret;
};




Game_Action.prototype.Defender = function (membri, shield)
{
    var critical = (Math.random() < this.itemCri(shield));
    var value = this.makeDamageValue(shield, critical);
    if (value>=shield.hp)
    {
        // If this is the last defender and would die too, return null so
        // The first chosen will defend and die.
        if (membri.length==0) return null;
        // Else
        // Obtain their defending percent
        var membersPercent=this.setPercents(membri);

        // Chose who should defend
        var defenderIndex = this.defenderIndex(membersPercent);
        
        var ret=membri[defenderIndex];
        // Return the defender chosen or the one that will take his place if
        // He would die.
        return this.Defender(membri.splice(defenderIndex,1), ret);
        
    }
    bg=true;
    danno=value;
    return shield;     
};



Game_Action.prototype.defenderIndex = function (percents)
{  
    var i=0;
    // Check wich is chosen:
    while (true)
    {
        if (Math.random()*100 < percents[i])
            return i;
        i++;
        if (i==percents.length) i=0;
    }
};

Game_Action.prototype.setPercents = function (membri)
{
    var agitot=0;
    var hptot=0;
    var ret=[];
    
    // Calculate totals
    for (var i=0;i<membri.length; i++)
    {
        agitot+=membri[i].agi;
        hptot+=membri[i].hp;
    }
    
    // Assign a percentage to each member
    for (var i=0;i<membri.length; i++)
    {
        ret[i]=(membri[i].agi*100/agitot+membri[i].hp*100/hptot)/2;
    }
    return ret;
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
            target=this.bodyGuard(target, danno);
            if (bg){
                if (benabled&&Math.random()*100<brate) 
                {
                    var testo=$dataActors[target.actorId()].meta.bodyg;
                    if (testo){
                        $gameMessage.setFaceImage(target._faceName,target._faceIndex);
                        $gameMessage.add(testo);}
                    danno*=Math.random();
                    target=this.subject();
                    this.executeDamage(target, danno);
                    target.performDamage();
                    target.startDamagePopup();
                    this.executeDamage(target, danno);
                }
                else
                var testo=$dataActors[target.actorId()].meta.bodyg;
                if (testo){
                $gameMessage.setFaceImage(target._faceName,target._faceIndex);
                $gameMessage.add(testo);}
                this.apply(target);
                target.performDamage();
                target.startDamagePopup();
                if (target.hp<=0)
                target.performCollapse();
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

