'use strict'

var startMark = false;
const MINE_NUM = 99;
const ROWS = 18;
const COLS = 27;
var mines = new Array();
var bricks = new Array(); 
var playerBricks = new Array();

function Brick(){
	this.isMine = false; 		//bool
	this.totalNum = 0; 			//total number of mines
	this.leftNum = 0; 			//the number of unknown mines
	this.isClicked = false;
}

function PlayerBrick(){
	this.isMine = false;
	this.isTempMine = false;
	this.isEdge = false;
	this.isScan = false;
}

function Point(x,y){
	this.x = x;
	this.y = y;
}
function SetButtons(){
	startMark = true;
	var myTable = document.getElementById("tab");
	for(var i = 0; i < ROWS; i++){
		for(var j = 0; j < COLS; j++){
			var id = i*COLS + j;
			var str = "<button id=" + id + " onclick = 'ClickAction(this)'></button>";
			if(myTable.rows[i].cells[j].className != "brick virtual"){
				myTable.rows[i].cells[j].innerHTML = str;
				document.getElementById(id).style.width = "30px";
				document.getElementById(id).style.height = "30px";
				document.getElementById(id).style.borderColor = "#fff";
				document.getElementById(id).style.backgroundColor = "#999";
			}
		}
	}
	InititaliseBricks();	
}
//initialise bricks
function InititaliseBricks(){
	for(var i = 0; i < ROWS; i++){
		bricks[i] = new Array();
		playerBricks[i] = new Array(); 
		for(var j = 0; j < COLS; j++){
			bricks[i][j] = new Brick();	
			playerBricks[i][j] = new PlayerBrick();
		}
	}
}

function ClickAction(obj){
	var id = parseInt(obj.id);
	if(startMark){
		ClickFirst(id);
		DisplayNumber(Math.floor(id/COLS), id%COLS);
		PlayerSync();
		AutomaticSearching();
		startMark = false;
	}
	else{
		if(!GameOver(Math.floor(id/COLS), id%COLS)){
			DisplayNumber(Math.floor(id/COLS), id%COLS);
			PlayerSync();
			AutomaticSearching();
		}
	}
}

//first time to click and set all mines
function ClickFirst(id){
	var speicialBricks = NineId(id);				
	//put mines randomly
	for(var i = 0; i < MINE_NUM; i++){
		var randomMine = Math.floor(Math.random() * COLS * ROWS);
		if(speicialBricks.indexOf(randomMine)<0 && mines.indexOf(randomMine)<0){
			if(randomMine > COLS && randomMine < ((ROWS-1)*COLS-1) 
				&& randomMine%COLS!=0 && (randomMine%COLS!=(COLS-1))){
				mines[i] = randomMine;	
				//document.getElementById(randomMine).style.backgroundColor = "#f00";
			}else{
				i--;
			}		
		}else{
			i--;
		}
	}
	// mark mines
	for(var i = 0; i < bricks.length; i++){
		for(var j = 0; j < bricks[i].length; j++){
			if(mines.indexOf(i*COLS+j) >= 0){
				bricks[i][j].isMine = true;
			}			
		}
	}
	//cont the number of mines around the current brick
	for(var i = 1; i < bricks.length - 1; i++){
		for(var j = 1; j < bricks[i].length - 1; j++){
			if(bricks[i][j].isMine == false){
				for(var m = 0; m < 9; m++){
					var x = NineBricks(i,j)[m].x;
					var y = NineBricks(i,j)[m].y;
					if(m != 4 && bricks[x][y].isMine){
						bricks[i][j].totalNum += 1;
						bricks[i][j].leftNum += 1;
					}
				}
			}			
		}
	}

}

function DisplayNumber(i,j){

	if(i>0 && i<ROWS-1 && j>0 && j<COLS-1 && !bricks[i][j].isClicked){

		document.getElementById(i*COLS+j).style.backgroundColor = "#eee";
		document.getElementById(i*COLS+j).disabled = true;
		bricks[i][j].isClicked = true;

		if(bricks[i][j].totalNum != 0){
			document.getElementById(i*COLS+j).style.color = NumberColor(bricks[i][j].totalNum);
			document.getElementById(i*COLS+j).innerHTML = bricks[i][j].totalNum;
		}
		else{
			for(var m = 0; m < 9; m++){
				var x = NineBricks(i,j)[m].x;
				var y = NineBricks(i,j)[m].y; 	
				DisplayNumber(x,y);			
			}	
		}
	}
}

function GameOver(i,j){
	if(bricks[i][j].isMine){
		for(var m=0;m<mines.length;m++){
			document.getElementById(mines[m]).style.backgroundColor = "#f00";
		}
		return true;
	}
	return false;
}

//get all clicked information after each click 
function PlayerSync(){
	for(var i = 0; i < ROWS; i++){
		for(var j = 0; j < COLS; j++){
			if(bricks[i][j].isClicked){
				playerBricks[i][j].isClicked = true;			
			}
		}
	}
}

function AutomaticSearching(){
	//Mine searching
	for(var i = 1; i < playerBricks.length - 1; i++){
		for(var j = 1; j < playerBricks[i].length - 1; j++){
			if(bricks[i][j].isClicked && bricks[i][j].totalNum > 0){
				var leftArray = UnclickedNumberOfBrick(i,j);
				var leftNumber = LeftNumberOfMines(i,j);
				if(leftArray.length == leftNumber){
					for(var m = 0; m < leftArray.length; m++){
						var x = leftArray[m].x;
						var y = leftArray[m].y;
						playerBricks[x][y].isMine = true;
						bricks[i][j].leftNum--;	
						document.getElementById(x*COLS+y).style.backgroundColor = "#0de";
					}
				}
			}
		}
	}
	//number searching
	for(var i = 1; i < playerBricks.length - 1; i++){
		for(var j = 1; j < playerBricks[i].length - 1; j++){
			if(bricks[i][j].isClicked && bricks[i][j].totalNum > 0){
				if(LeftNumberOfMines(i,j) == 0){
					var leftArray = UnclickedNumberOfBrick(i,j);
					for(var m = 0; m < leftArray.length; m++){
						var x = leftArray[m].x;
						var y = leftArray[m].y;		
						if(!playerBricks[x][y].isMine){
							document.getElementById(x*COLS+y).style.backgroundColor = "#f0f";
						}	
					}
				}
			}
		}
	}
	//boundary searching

	if(isTimeToAssumption()){
		var possibility = GetPossibility();
		if(possibility.length == 1){
			for(var p = 0; p < possibility[0].length; p++){
				var x = possibility[p].x;
				var y = possibility[p].y;
				document.getElementById(x*COLS+y).style.backgroundColor = "#0de";
			}
		}
		if(possibility.length > 1){
			for(var i = 0; i < possibility[0].length; i++){
				var x = possibility[0][i].x;
				var y = possibility[0][i].y;
				var point = new Point(x,y);
				var j = 1;
				for(j = 1; j < possibility.length; j++){
					if(PointIndexOf(point,possibility[j]) < 0){
						console.log(possibility[j].indexOf(point));
						console.log(point);
						console.log("break");
						break;
					}
				}
				if(j == possibility.length){
					document.getElementById(x*COLS+y).style.backgroundColor = "#0de";
				}
			}
		}
	}
}

function GetPossibility(){
	var bounaries = GetBoundary();
	for(var b = 0; b < bounaries.length; b++){
		var boundary = bounaries[b];
		var results = [[]];
		for(var l = 0; l < boundary.length; l++){
			var x = boundary[l][0];
			var y = boundary[l][1];
			var possibility = MinePossibility(x,y);
			var pLen = possibility.length;
			if(!playerBricks[x][y].isMine && pLen > 0){	
				var rLen = results.length;
				for(var r = 0; r < rLen; r++){
					var tempArr  = results[r].slice(0);
					for(var point = 0; point < possibility[0].length; point++){
						results[r].push(possibility[0][point]);
					}
					var mark = 1;
					while(mark < pLen){					
						results.push(tempArr.slice(0));		
						for(var point = 0; point < possibility[mark].length; point++){
							results[results.length - 1].push(possibility[mark][point]);
						}
						mark++;
					}					
				}
				for(var r = 0; r < results.length; r++){
					for(var p = 0; p < results[r].length; p++){
						var _x = results[r][p].x;
						var _y = results[r][p].y;
						playerBricks[_x][_y].isTempMine = true;
					}
					if(!Rationality(x,y)){
						for(var p = 0; p < results[r].length; p++){
							var _x = results[r][p].x;
							var _y = results[r][p].y;
							playerBricks[_x][_y].isTempMine = false;
						}
						results.splice(r,1);
						r--;
					}
					else{
						for(var p = 0; p < results[r].length; p++){
							var _x = results[r][p].x;
							var _y = results[r][p].y;
							playerBricks[_x][_y].isTempMine = false;
						}
					}			
				}		
			}	
		}		
	}	
	return results;
}
function PointIndexOf(point,point_array){
	for(var p = 0; p < point_array.length; p++){
		if(point_array[p].x == point.x && point_array[p].y == point.y){
			return p;
		}
	}
	return -1;
}
function Rationality(i,j){
	for(var m = 0; m < 9; m++){
		var x = NineBricks(i,j)[m].x;
		var y = NineBricks(i,j)[m].y; 
		if(bricks[x][y].isClicked && bricks[x][y].totalNum > 0){
			if((LeftNumberOfMines(x,y) - TempmineNumberOfBrick(x,y)) < 0){
				return false;
			}
		}	
	}
	return true;
}


//all possibilities of putting mines left
function MinePossibility(i,j){
	var possibility = new Array();
	var leftMine = LeftNumberOfMines(i,j);
	var unclickdArray = UnclickedNumberOfBrick(i,j);
	if(leftMine > 0){	
		possibility = groupSplit(unclickdArray,leftMine);	
	}
	return possibility;
}

function groupSplit (arr, size) {
  var r = []; //result
  function _(t, a, n) { //tempArr, arr, num
    if (n === 0) {
      r[r.length] = t;
      return;
    }
    for (var i = 0, l = a.length - n; i <= l; i++) {
      var b = t.slice();
      b.push(a[i]);
      _(b, a.slice(i + 1), n - 1);
    }
  }
  _([], arr, size);
  return r;
}

function GetBoundary(){
	var bounaries = new Array();
	for(var i = 1; i < playerBricks.length - 1; i++){
		for(var j = 1; j < playerBricks[i].length - 1; j++){
			playerBricks[i][j].isScan =  false;
			playerBricks[i][j].isEdge = false;
			if(isBoundary(i,j)){
				playerBricks[i][j].isEdge = true; //find all edges
			}
			document.getElementById(i*COLS+j).style.borderColor = "#fff";
		}
	}	
	//find edge
	for(var i = 1; i < playerBricks.length - 1; i++){
		for(var j = 1; j < playerBricks[i].length - 1; j++){
			if(playerBricks[i][j].isClicked || playerBricks[i][j].isMine){
				var scanPonit = new Array();
				var nextPoint = new Array();
				if(playerBricks[i][j].isEdge && !playerBricks[i][j].isScan){
					scanPonit.push([i,j,0]);
					playerBricks[i][j].isScan = true;
					nextPoint = DirectionSearching(i,j,0);
					document.getElementById(i*COLS+j).style.borderColor =  "#234";
					while(nextPoint[0]!=scanPonit[0][0] || nextPoint[1]!=scanPonit[0][1]){
						var x = nextPoint[0];
						var y = nextPoint[1];
						var dir = nextPoint[2];
						scanPonit.push(nextPoint);
						playerBricks[x][y].isScan = true;
						nextPoint = DirectionSearching(x,y,dir);
						document.getElementById(x*COLS+y).style.borderColor =  "#234";
					}
					bounaries.push(scanPonit);		
				}			
			}
		}
	}
	//console.log(bounaries.length);
	//console.log(bounaries);
	return bounaries;
}

function isTimeToAssumption(){
	for(var i = 1; i < playerBricks.length - 1; i++){
		for(var j = 1; j < playerBricks[i].length - 1; j++){
			if(document.getElementById(i*COLS+j).style.backgroundColor == "rgb(255, 0, 255)"){
				return false;
			}
		}
	}
	return true;
}

function isBoundary(i,j){
	for(var m = 0; m < 9; m++){
		if(m != 4){
			var x = NineBricks(i,j)[m].x;
			var y = NineBricks(i,j)[m].y; 
			if(!playerBricks[x][y].isClicked && !playerBricks[x][y].isMine){
				return true;
			}
		}
	}
	return false;
}

function DirectionSearching(i,j,pre_direction){
	var startDirection = (pre_direction + 3) % 4;
	var brick = [i,j,pre_direction];	
	for(var s = startDirection; s < startDirection + 4; s++){
		var next_direction = NextDirection(i,j,s % 4);
		var x = next_direction[0];
		var y = next_direction[1];
		if(playerBricks[x][y].isClicked || playerBricks[x][y].isMine){
			if(playerBricks[x][y].isEdge){
				brick = next_direction;
				break;
			}	
		}
	}
	return brick;
}

function NextDirection(i,j,direction){
	var nextDirection = [i,j,direction];
	switch(direction){
		case 0: nextDirection = [i,j+1,0]; break;//right
		case 1: nextDirection = [i+1,j,1]; break;//down
		case 2: nextDirection = [i,j-1,2]; break;//left
		case 3: nextDirection = [i-1,j,3]; break;//up
	}
	return nextDirection;
}

//the number of mines that have been found
function MineNumberOfBrick(i,j){
	var num = 0;
	for(var m = 0; m < 9; m++){
		if(m != 4){
			var x = NineBricks(i,j)[m].x;
			var y = NineBricks(i,j)[m].y; 
			if(playerBricks[x][y].isMine){
				num++;
			}
		}	
	}
	return num;
}
function TempmineNumberOfBrick(i,j){
	var num = 0;
	for(var m = 0; m < 9; m++){
		if(m != 4){
			var x = NineBricks(i,j)[m].x;
			var y = NineBricks(i,j)[m].y; 
			if(playerBricks[x][y].isTempMine){
				num++;
			}
		}	
	}
	return num;
}

//the left number of mines that haven't been found
function LeftNumberOfMines(i,j){
	return bricks[i][j].totalNum - MineNumberOfBrick(i,j);
}

//the number of bricks that haven't been clicked
function UnclickedNumberOfBrick(i,j){
	var array = new Array();
	for(var m = 0; m < 9; m++){
		if(m != 4){
			var x = NineBricks(i,j)[m].x;
			var y = NineBricks(i,j)[m].y; 
			if(!bricks[x][y].isClicked && !playerBricks[x][y].isMine){
				if(x>0 && x<17 && y>0 && y<26){
					array.push(new Point(x,y));
				}		
			}
		}	
	}
	return array;
}


function NineId(id){
	return [
			id - COLS - 1,
			id - COLS, 
			id - COLS + 1,
			id - 1,
			id,
			id + 1,
			id + COLS - 1,
			id + COLS,
			id + COLS + 1
		];
}

function NineBricks(i,j){
	return [
		new Point(i-1,j-1),
		new Point(i-1,j),
		new Point(i-1,j+1),
		new Point(i,j-1),
		new Point(i,j),
		new Point(i,j+1),
		new Point(i+1,j-1),
		new Point(i+1,j),
		new Point(i+1,j+1)
	];
}
function NumberColor(num){
	var cr = "#000";
	switch(num){
		case 1:cr = "#100";break;
		case 2:cr = "#200";break;
		case 3:cr = "#300";break;
		case 4:cr = "#400";break;
		case 5:cr = "#500";break;
		case 6:cr = "#600";break;
		case 7:cr = "#700";break;
		case 8:cr = "#800";break;
	}
	return cr;
}