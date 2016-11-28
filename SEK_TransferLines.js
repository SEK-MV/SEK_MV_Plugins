//=============================================================================
// SEK_TransferLines.js
//=============================================================================

/*:
* @plugindesc Transfers a player based on a line.
* @author SEK
*
* @help 
* Create a TransferLine to teleport your actor to a relative location on another map or in the same map!
*
* Plugin Commands:
*
* sektl mapid, x, y, arriving-direction, fade-effect, needed-direction, step-forward
*
* arriving-direction = 8-up, 6-right, 2-down, 4-left (watch you numpad to remember this)
* 			  if direction is different from 2,4,6,8, the direction of the player
*			  as he enters the t.l. will be kept.
*
* needed-direction = player must be facing this way to be transferred, 
* else it won't activate(if missing, every direction will be ok to be transferred)
*
* fade-effect = 0-Black, 1-White, 2-None (If missing, it will be set to 0)
*
* step-forward: Number of steps your player will make after being transferred.
*
* Creates a transfer line and deletes the calling event: all you need to do is to
* create a line of squares with the same region and put an event with this plugin
* command on its top left corner.
* if direction and fadetype are missing, they will be set by default:
* direction will be kept, fadetype will be 0.
*
* sektloff		turns off the plugin (transfer lines aren't deleted but they are inactive)
*
* sektlon		turns on the plugin
*
*/



	var params=PluginManager.parameters('SEK_TransferLines');
	var aliasgamin = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		aliasgamin.call(this, command, args);
		if (command.toLowerCase() === "sektl") {
			var evid=$gameMap.event(this.eventId());
			this.GetDirections(evid);			//	0	mapid			1	x				2	y			3	dir			4	fade			5 ev.x				6 ev.y				7	giu 		8 dx		9 facing			 10 step-forward
			dict[$gameMap.regionId(evid.x, evid.y)]=[parseInt(args[0]), parseInt(args[1]), parseInt(args[2]), parseInt(args[3]), parseInt(args[4]), parseInt(evid.x), parseInt(evid.y), parseInt(giu), parseInt(dx), parseInt(args[5]), parseInt(args[6])];
			tl=true;
			$gameMap.eraseEvent(this.eventId());
			}
		if (command.toLowerCase() === "sektloff") {
			tl=false;
			}
		if (command.toLowerCase() === "sektlon") {
			tl=true;
			}
		}
	var dict={};
	var tl=false;
	var giu,dx;
	var passo=0;
	Game_Party.prototype.passo=function(){
		for (var reg in dict)
		{
		if (($gamePlayer._x>=dict[reg][5]&&$gamePlayer._x<=dict[reg][5]+dict[reg][8])&&($gamePlayer._y>=dict[reg][6]&&$gamePlayer._y<=dict[reg][6]+dict[reg][7]))
			{
				var mapid=dict[reg][0];
				var x=dict[reg][1]+$gamePlayer._x-dict[reg][5];
				var y=dict[reg][2]+$gamePlayer._y-dict[reg][6];
				var dir=dict[reg][3];
				if(dir==null||(dir!=2&&dir!=4&&dir!=6&&dir!=8)) dir=$gamePlayer.direction();
				var facing=dict[reg][9];
				if ((facing==null)||(facing!=2&&facing!=4&&facing!=6&&facing!=8)) facing=$gamePlayer.direction();
				var fade=dict[reg][4];
				if(fade==null||(fade!=0&&fade!=1&&fade!=2)) fade=0;
				passo=dict[reg][10];
				if($gamePlayer.direction()==facing)
				{
				if (mapid!=$gameMap.mapId())
				dict={};
				$gamePlayer.reserveTransfer(mapid,x,y,dir,fade);
				return;
				}
			}
		}
		};
		
	Game_Player.prototype.performTransfer = function() {
    if (this.isTransferring()) {
        this.setDirection(this._newDirection);
        if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
            $gameMap.setup(this._newMapId);
            this._needsMapReload = false;
        }
        this.locate(this._newX, this._newY);
        this.refresh();
        this.clearTransferInfo();
		for (var i=0;i<passo;i++)
		$gamePlayer.moveForward();
		}
	};
	
	Game_Interpreter.prototype.GetDirections =function(evid){
	dx=parseInt(0);
	giu=parseInt(0);
	var ex=parseInt(evid.x);
	var ey=parseInt(evid.y);
	var regid=$gameMap.regionId(ex, ey);
	while ($gameMap.regionId(ex, (parseInt(ey)+parseInt(giu)+1))==regid)
	{
		giu++;
	}
	while ($gameMap.regionId(ex+1+dx, ey)==regid)
	{
		dx++;
	}
	};
	
	Game_Party.prototype.increaseSteps = function() {
		if (tl) this.passo();
		this._steps++;
		
	};
	
	
	