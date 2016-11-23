//=============================================================================
// SEK_CharacterSpacing.js
//=============================================================================

/*:
* @plugindesc Change the spacing between Characters.
* @author SEK
*
* @param space1
* @desc space between the Characters in the title. Default is 0.5.
* @default 0.5
*
* @param space2
* @desc space between the Characters in messages. Default is 2.
* @default 2
*
* @help 
* 
* Plugin Commands:
*
* txtspace1 x	Change the space between the Characters to x in the title.
*
* txtspace2 x	Change the space between the Characters to x in messages.
*
*/
	var params=PluginManager.parameters('SEK_CharacterSpacing');
	var space1 = Number (params['space1']||0.5);
	var space2 = Number (params['space2']||2);
	var aliasgamin = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliasgamin.call(this, command, args);
		if (command.toLowerCase() === "txtspace1") {
					space1=args[0];
			}
		if (command.toLowerCase() === "txtspace2") {
					space2=args[0];
			}
		}
	
	
	

Window_Base.prototype.processNormalCharacter = function(textState) {
    var c = textState.text[textState.index++];
    var w = this.textWidth(c)*space2/2;
    this.contents.drawText(c, textState.x, textState.y, w*2, textState.height);
    textState.x += w;
};

//==========================================================================================================
Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
    if (text !== undefined) {
        var tx = x;
        var ty = y + lineHeight - (lineHeight - this.fontSize * 0.7) / 2;
        var context = this._context;
        var alpha = context.globalAlpha;
        maxWidth = maxWidth || 0xffffffff;
        if (align === 'center') {
            tx += maxWidth / 2-2*x;
        }
        if (align === 'right') {
            tx += maxWidth;
        }
        context.save();
        context.font = this._makeFontNameText();
        context.textAlign = align;
        context.textBaseline = 'alphabetic';
        context.globalAlpha = 1;
        this._drawTextOutline(text, tx, ty, maxWidth);
        context.globalAlpha = alpha;
        this._drawTextBody(text, tx, ty, maxWidth);
        context.restore();
        this._setDirty();
    }
};
	
Bitmap.prototype._drawTextOutline = function(text, tx, ty, maxWidth) {
    var context = this._context;
    context.strokeStyle = this.outlineColor;
    context.lineWidth = this.outlineWidth;
    context.lineJoin = 'round';
	var add=0;
	if (context.textAlign=='right')
	
    context.strokeText(text, tx, ty, maxWidth);
	else
	for (var i=0;i<text.length;i++)
	{
		context.strokeText(text[i], tx+add, ty, maxWidth);
		add+=this.fontSize * space1;
	}
};


Bitmap.prototype._drawTextBody = function(text, tx, ty, maxWidth) {
    var context = this._context;
    context.fillStyle = this.textColor;
	var add=0;
	if (context.textAlign=='right')
	
    context.fillText(text, tx, ty, maxWidth);
	else
	for (var i=0;i<text.length;i++)
	{
		context.fillText(text[i], tx+add, ty, maxWidth);
		
		add+=this.fontSize * space1;
		console.log(this.fontSize * space1);
	}   

	
	
/**
 * @method _drawTextOutline
 * @param {String} text
 * @param {Number} tx
 * @param {Number} ty
 * @param {Number} maxWidth
 * @private
 */
Bitmap.prototype._drawTextOutlineold = function(text, tx, ty, maxWidth) {
    var context = this._context;
    context.strokeStyle = this.outlineColor;
    context.lineWidth = this.outlineWidth;
    context.lineJoin = 'round';
    context.strokeText(text, tx, ty, maxWidth);
};

/**
 * @method _drawTextBody
 * @param {String} text
 * @param {Number} tx
 * @param {Number} ty
 * @param {Number} maxWidth
 * @private
 */
Bitmap.prototype._drawTextBodyold = function(text, tx, ty, maxWidth) {
    var context = this._context;
    context.fillStyle = this.textColor;
    context.fillText(text, tx, ty, maxWidth);
};
	
	
};
