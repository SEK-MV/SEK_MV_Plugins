//=============================================================================
// SEK_SkillUseMessage.js
//=============================================================================

/*:
* @plugindesc Show a message for every battle action.
* @author SEK
*
*
* @param Message
* @desc The Message shown for every action. write %s for subject, %a for action and %t for target/targets.
* @default %s uses %a on %t!
*
* @param Conjunction
* @desc The conjuction that will be used with more targets (ex. BatA & BatB). Default is "and"
* @default and
*
* @param Himself
* @desc Word used when the target is the subject. Default is "himself"
* @default and
*
*/
var params=PluginManager.parameters('SEK_SkillUseMessage');
	var Frase = String(params['Message'] || "%s uses %a on %t!");
	var cong = String(params['Conjunction'] || "and");
	var sestesso = String(params['Himself'] || "himself");

Window_BattleLog.prototype.startAction = function(subject, action, targets) {
	var sogg=subject.name();
	var bers="";
	for (var i=0;i<targets.length;i++)
	{
		if (targets[i].name()==sogg) bers+=sestesso;
		else
		bers+=targets[i].name();
		if (i!=targets.length-1) 
		{
			if (i==targets.length-2) bers+=" "+cong+" ";
			else bers+=", ";
		}
	}
	$gameMessage.add(
	Frase.replace(new RegExp("%s","g"), (sogg)).replace(new RegExp("%a","g"), (action.item().name)).replace(new RegExp("%t","g"), (bers)));
	var item = action.item();
	this.push('performActionStart', subject, action);
    this.push('waitForMovement');
    this.push('performAction', subject, action);
    this.push('showAnimation', subject, targets.clone(), item.animationId);
    this.displayAction(subject, item);
};