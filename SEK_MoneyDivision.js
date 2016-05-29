//=============================================================================
// SEK_MoneyDivision.js
//=============================================================================

/*:
* @plugindesc Divides your money in Gold, Silver and Copper.
* @author SEK
*
*
*@param Gold Icon Id
*@desc Default is "163".
*@default 163
*
*@param Silver Icon Id
*@desc Default is "160".
*@default 160
*
*@param Copper Icon Id
*@desc Default is "162".
*@default 162
*
*/

//Note: may not work with a different shop/menu

/*
You are free to use this plugin. If you do use it, I'd like to have my name and my plugin's name included in credits.
*/
var params=PluginManager.parameters('SEK_MoneyDivision');
var Gold_Icon=Number(params['Gold Icon Id']||163);
var Silver_Icon=Number(params['Silver Icon Id']||160);
var Copper_Icon=Number(params['Copper Icon Id']||162);


Window_Base.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
    var spostamento = 22;
    this.resetTextColor();
	var copper=value%100;
	var silver=(((value-copper)/100))%100;
	var gold=((((value-copper)/100)-silver)/100)%100;
	var g,s,c;
	if (gold>0)
	{
	g=gold;
	if (silver<10) s="0"+silver;
	else s=silver;
	if (copper<10) c="0"+copper;
	else c=copper;
	this.drawText(c, x, y, width - spostamento - 6, 'right');
	this.drawText(s, x, y, width - spostamento - 6-this.textWidth('00')-32, 'right');
	this.drawText(g, x, y, width - spostamento - 6-this.textWidth('00')-32-this.textWidth('00')-32, 'right');
	this.drawIcon(Copper_Icon, x + width - spostamento -6, y,'right');
	spostamento+=this.textWidth('00')+32;
	this.drawIcon(Silver_Icon, x + width - spostamento -6, y,'right');
	spostamento+=this.textWidth('00')+32;
	this.drawIcon(Gold_Icon, x + width - spostamento -6, y,'right');
	}
	else if(silver>0)
	{
	s=silver;
	if (copper<10) c="0"+copper;
	else c=copper;
	this.drawText(c, x, y, width - spostamento - 6, 'right');
	this.drawText(s, x, y, width - spostamento - 6-this.textWidth('00')-32, 'right');
	this.drawIcon(Copper_Icon, x + width - spostamento -6, y,'right');
	spostamento+=this.textWidth('00')+32;
	this.drawIcon(Silver_Icon, x + width - spostamento -6, y,'right');
	}
	else
	{if (copper==0) c="0"+copper;
	else c=copper;
	this.drawText(c, x, y, width - spostamento - 6, 'right');
	this.drawIcon(Copper_Icon, x + width - spostamento -6, y,'right');
	}
	};
	
Window_ShopBuy.prototype.drawItem = function(index) {
    var item = this._data[index];
    var rect = this.itemRect(index);
    var priceWidth = this.textWidth('00')*3+112;
    rect.width -= this.textPadding();
    this.changePaintOpacity(this.isEnabled(item));
    this.drawItemName(item, rect.x, rect.y, rect.width - priceWidth);
	this.drawCurrencyValue(this.price(item), null,rect.x + rect.width-32 - priceWidth,
                  rect.y, priceWidth);
    this.changePaintOpacity(true);
};
