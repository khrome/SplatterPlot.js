/***********************************************
 * SplatterPlot v1.1
 ***********************************************
 * Created by Abbey Hawk Sparrow
 * on 01/24/10
 * Last Modified by Abbey Hawk Sparrow
 * on 02/12/10
 ***********************************************/
 var SplatterImageNode = new Class({
    Extend: SplatterPlotNode,
    create: function(x, y){
        this.shape = this.plot.panel.image(this.imagePath, x, y, this.width, this.height);
        var bbox = this.shape.getBBox();
        this.shape.attr({scale: Math.min(this.width/bbox.width, this.height/bbox.height)});
        bbox = this.shape.getBBox();
        this.x = x;
        this.y = y;
        this.shape.attr({scale : 0.75});
        var ob = this;
        this.shape.node.onmouseover = function(){ ob.mouseover() };
        this.shape.node.onmouseout = function(){ ob.mouseout() };
        this.shape.node.onclick = function(){ ob.click() };
    },
    appear: function(){
        this.shape.animate({
            scale: 1.0
        }, 300, '<>', function(){
            this.shape.animate({
                scale: 0.60
            }, 500, '<>');
        }.bind(this));
    },
    initialize: function(imagePath){
        this.imagePath = imagePath;
    },
    mouseover: function(){
        this.shape.animate({
            scale: 0.75
        }, 300, '<>');
    },
    mouseout: function(){
        this.shape.animate({
            scale: 0.60
        }, 300, '<>');
    },
    click: function(){
        var popup = document.id('demo_popup');
        popup.setStyle('top',  this.y+(
                 (this.height/2) - (popup.getHeight()/2) 
        )+'px');
        popup.setStyle('left', this.x+( 
                (this.width /2) - (popup.getWidth() /2) 
        )+'px');
    }
});
var SplatterPlotNode = new Class({
    plot: null,
    shape: null,
    x: 0,
    y: 0,
    path: "",
    width: 25,
    height: 25,
    initialize: function(path){
        this.path = path;
    },
    create: function(x, y){
        this.shape = this.plot.panel.path(this.path);
        var bbox = this.shape.getBBox();
        this.shape.attr({scale: Math.min(this.width/bbox.width, this.height/bbox.height)});
        bbox = this.shape.getBBox();
        this.x = x;
        this.y = y;
        this.shape.attr({fill : "#CCCCCC", translation: (this.plot.xcenter-bbox.x) + ' ' + (this.plot.ycenter-bbox.y)});
        var ob = this;
        this.shape.node.onmouseover = function(){ ob.mouseover() };
        this.shape.node.onmouseout = function(){ ob.mouseout() };
        this.shape.node.onclick = function(){ ob.click() };
    },
    appear: function(){
        this.shape.animate({
            translation: (this.x-this.plot.xcenter) + ' ' + (this.y-this.plot.ycenter)
        }, 800, '<>');
    },
    mouseover: function(){
        this.shape.animate({
            "stroke-width": 2,
            stroke: "#FF0000"
        }, 300, '<>');
    },
    mouseout: function(){
        this.shape.animate({
            stroke: "#000000",
            "stroke-width": 1
        }, 300, '<>');
    },
    click: function(){
        var popup = document.id('demo_popup');
        popup.setStyle('top',  this.y+( (this.height/2) - (popup.getHeight()/2) )+'px');
        popup.setStyle('left', this.x+( (this.width /2) - (popup.getWidth() /2) )+'px');
    }
});

var SplatterPlot = new Class({
    randomOrientationOffsetMode : false,
    nonSequentialDistributionMode : false,
    interactiveMode : false,
    debugMode : false,
    center: 0,
    nodeX : 25,
    nodeY : 25,
    seed: 10,
    expansionFactor: 0.7,
    panel: null,
    max: 0,
    positions: null,
    offsets: [],
    logEntry: "",
    queue: [],
    groups: [],
    touched: false,
    buffer: 0,
    initialize: function(element, width, height, maxNumber){
        this.panel = Raphael(element, width, height);
        var node = element;
        if(this.isString(node)){
            node = document.id(node);
        }
        this.xcenter = width / 2;
        this.ycenter = height / 2;
        this.max = maxNumber;
        this.positions = new Array(maxNumber);
    },
    getPosition: function(node){
        for(var lcv=0; lcv < this.positions.length; lcv++){
            if(this.positions[lcv] == node){
                return lcv;
            }
        }
        return -1;
    },
    getNode: function(position){
        return this.positions[position];
    },
    loadQueue: function(node){
        this.queue.push(node);
    },
    clearQueue: function(){
        this.addNode(this.queue.pop());
        if(this.queue.length > 0) this.clearQueue.delay(200, this);
    },
    log: function(text){
        if(console) {
            if(navigator.userAgent.toLowerCase().indexOf("applewebkit") != -1) {
                console.log(text);
            } else {
                console.log.apply(this , arguments);
            }
        }else{
            
        }
    },
    addNode: function(node){
        var coordinates;
        var count = this.count();
        var position = -1;
        if(this.nonSequentialDistributionMode && count > 1 && count < this.max - 6){
            var rand = Math.floor(this.random(this.max)*this.max);
            if(!this.isObject(this.positions[rand])) position = rand;
        }
        if(position == -1){
            for(var lcv=1; lcv < this.positions.length; lcv++){
                if(!this.isObject(this.positions[lcv])){
                    position = lcv;
                    break;
                }
            }
        }
        if(position != -1){
            node.plot = this;
            node.width = this.nodeX;
            node.height = this.nodeY;
            this.positions[position] = node;
            coordinates = this.getCoordinatesFromPosition(position);
            node.create(coordinates['x'], coordinates['y'], this.panel);
            node.appear();
        }
    },
    random: function(range){
        if(!range) range = Math.pow(2, 32);
        var value = (this.seed = (134775813 * this.seed + 1) % range) / range;
        return value;
    },
    count: function(){
        var count = 0;
        for(var lcv=0; lcv < this.positions.length; lcv++){
            if(this.isObject(this.positions[lcv])){
                count++;
            }
        }
        return count;
    },
    computeRadiusForShell: function(shell_pos){
        //init for 0
        var radius = Math.sqrt(this.nodeX*this.nodeX + this.nodeY*this.nodeY)*(this.expansionFactor/2);
        //do the rest
        if(shell_pos >= 1) for(var lcv=1; lcv <= shell_pos; lcv++){
            radius += Math.sqrt(this.nodeX*this.nodeX + this.nodeY*this.nodeY)*this.expansionFactor;
        }
        return radius;
    },
    computeBaseForShell: function(shell_pos, radius){
        //init for 0
        var circumference = Math.PI*radius*2;
        var hw_average = (this.nodeX + this.nodeY)/2;
        var distance = this.buffer + hw_average;
        //this.log("hw: "+hw_average+", circ:"+circumference+", dist:"+distance);
        return Math.floor(circumference/distance);
    },
    isObject: function(o) {
        return ('object' == typeof o || 'Object' == typeof o);
    },
    isString: function() {if (typeof arguments[0] == 'string') return true;
        if(typeof arguments[0] == 'object') {  
            var criterion = arguments[0].constructor.toString().match(/string/i); 
            return (criterion != null);
        }return false;
    },
    computeShell: function(shell_pos){
        var radius = this.computeRadiusForShell(shell_pos);
        var floor = 0;
        if (!this.groups[shell_pos-1] && shell_pos-1  >= 0) this.computeShell(shell_pos-1);
        if (this.groups[shell_pos-1]) floor = this.groups[shell_pos-1].base;
        this.groups[shell_pos] = {
            "radius" : radius,
            base : this.computeBaseForShell(shell_pos, radius),
            floor : floor
        };
        if(this.debugMode) this.log("group["+shell_pos+"][r "+this.groups[shell_pos].radius+", b "+this.groups[shell_pos].base+", f "+this.groups[shell_pos].floor+"]");
    },
    getCoordinatesFromPosition: function(position){
        var base = 0;
        var radius = 0;
        var floor = 0;
        var group = Math.floor(position / 3);
        var groupid = 0;
        var fuse = position;
        if(!this.groups[0]) this.computeShell(0);
        fuse -= this.groups[0].base;
        while(fuse > 0){
            groupid++;
            if(!this.groups[groupid]) this.computeShell(groupid);
            fuse -= this.groups[groupid].base;
        }
        if(!this.groups[groupid]) this.computeShell(groupid);
        base = this.groups[groupid].base;
        radius = this.groups[groupid].radius;
        floor = this.groups[groupid].floor;
        var itemInterval = (2*Math.PI)/base;
        var offset;
        if(typeof this.offsets[base] == 'number'){ //is integer?
            offset = this.offsets[base];
        }else{
            offset = this.random(itemInterval) * itemInterval;
            this.offsets[base] = offset;
        }
        var lcv = position - floor;
        var x = this.xcenter + radius * Math.cos(offset + lcv * itemInterval);
        var y = this.ycenter + radius * Math.sin(offset + lcv * itemInterval);
        if(this.debugMode) this.log("radius = "+radius+"\ngroup = "+group+"\nbase = "+base+"\nfloor = "+floor+"\ninterval = "+itemInterval+"\nlcv = "+lcv+"\nx = "+x+"\ny = "+y+"\nposition = "+position);
        var coordinates = { 'x':x, 'y':y};
        return coordinates;
    }
});