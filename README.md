SplatterPlot.js
===========

Splatterplot is a MooTools + Raphaeljs library for displaying concentric nodes(Images or SVG paths) in vector space.

![Screenshot](http://patternweaver.com/SplatterPlot/SplatterPlot.jpg)

How to use
----------

Recently I’ve been working on some prototypes at work, and we’ve been doing a lot of rapid iteration and one of the ideas called for a splatter plot which was assumed would be fixed, but I had an idea on handling placement purely by linear position, which would then map to some position on a ring (in a series of concentric rings) which, in turn, maps to an X, Y position. I experimentally determined the spacing, number of nodes and radius for the circles and coded up the prototype. The nodes were image based and I’d say maybe 40% of it was dynamic.

Since that project I’ve been curious if it would be possible to use SVG paths and dynamically scale them to a normalized size as well as clip them, so they align properly. In addition this will allow you to scale up the visualization to any size. The answer is yes, this works quite well.

The central class is the SplatterPlot class, to initialize it you simply reference some empty div on your page and tell it what it’s dimensions are and the maximum number of nodes.

    var plot = new SplatterPlot('panel_one', 1000, 600, 200);
Now you just need to add nodes to your visualization. Here, I’m going to add a star. remember, you can just grab any old SVG path without editing, because it will be scaled for you.

   plot.addNode(new SplatterPlotNode(
      "M 46,51 L 31,42 L 17,51 L 22,35 L 8,24 "+
     "L 25,23 L 31,7 L 38,23 L 55,24 L 41,35 L 46,51 z"
   ));
   
This draws the star using the default SplatterPlotNode class. I designed the Node class to be extendable using these functions. this would look like:

    var MyAwesomeNode = new Class({
        extends: SplatterPlotNode,
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
            popup.setStyle('top',  this.y+(
                     (this.height/2) - (popup.getHeight()/2)
            )+'px');
            popup.setStyle('left', this.x+(
                    (this.width /2) - (popup.getWidth() /2)
            )+'px');
        }
    });
    
So what options are available? Glad you asked:

nonSequentialDistributionMode : this boolean allows you to distribute nodes in a pseudo-random fashion across the full visualization. The plot uses and internal random number generator, so the output results are deterministic(repeatable).
seed : this number is the seed value for the internal random generator, and determines the overall layout of the graph.
expansionFactor : this determines the spacing between the layout rings. Initially set to 1.5
nodeY : determines the height of each node.
nodeX : determines the width of each node.
buffer : This determines the extra space between nodes on a given ring. Initially 0.
Now it’s time for some examples.

First let’s toss a bunch of random shapes on a canvas:

    var plot = new SplatterPlot('panel_one', 1000, 600, 200);
    plot.nodeX = 100;
    plot.nodeY = 100;
    plot.seed = 120;
    plot.buffer = 20;
    plot.nonSequentialDistributionMode = true;
    var nodes = [
        "M 46,51 L 31,42 L 17,51 L 22,35 L 8,24 "+
         "L 25,23 L 31,7 L 38,23 L 55,24 L 41,35 L 46,51 z",
        "M 0,34 L 0,53 C 9,60 18,68 26,75 C 35,83 45,90 53,99 "+
         "C 61,108 70,117 74,132 C 77,146 77,164 74,186 L 63,205 "+
         "L 63,227 L 83,236 C 89,234 96,233 104,233 "+
         "C 112,233 123,234 131,237 C 138,241 143,248 146,252 "+
         "C 150,257 152,261 152,265 L 176,275 L 244,206 L 243,183 "+
         "L 243,183 C 240,181 237,180 234,178 C 231,176 228,174 226,172 "+
         "C 250,174 270,175 288,174 C 305,173 317,171 329,168 "+
         "C 341,165 352,161 358,158 C 363,155 365,154 364,152 "+
         "C 363,149 361,149 351,144 C 340,139 316,129 302,123 "+
         "C 289,117 279,113 271,111 L 271,101 L 249,92 L 249,78 "+
         "L 46,0 C 30,11 15,22 0,34 z",
        "M 34,168 L 104,168 L 121,123 L 121,70 C 121,63 97,58 97,62 "+
         "L 97,78 L 97,54 C 97,50 73,47 73,54 L 73,72 L 73,8 C 67,-2 50,2 50,8 "+
         "L 50,73 L 50,54 C 50,48 26,48 26,54 L 26,104 L 26,78 "+
         "C 26,71 3,71 3,78 L 3,105 L 34,168 z"
    ];
    for(var lcv=0; lcv< 50; lcv++){
        plot.addNode(new SplatterPlotNode(
            nodes[Math.floor(Math.random()*nodes.length)]
        ));
    }

How about something full frame?

    var plot = new SplatterPlot('panel_one', 1000, 600, 500);
    plot.nodeX = 50;
    plot.nodeY = 50;
    plot.seed = 120;
    plot.buffer = 20;
    for(var lcv=0; lcv< 350; lcv++){
        plot.addNode(new SplatterPlotNode(
             "M 46,51 L 31,42 L 17,51 L 22,35 L 8,24 "+
             "L 25,23 L 31,7 L 38,23 L 55,24 L 41,35 L 46,51 z"
         ));
    }

Or a different scale?

    var plot = new SplatterPlot('panel_one', 1000, 600, 800);
    plot.nodeX = 10;
    plot.nodeY = 10;
    plot.seed = 120;
    plot.buffer = 20;
    plot.nonSequentialDistributionMode = true;
    for(var lcv=0; lcv< 400; lcv++){
        plot.addNode(new SplatterPlotNode(
             "M 46,51 L 31,42 L 17,51 L 22,35 L 8,24 "+
             "L 25,23 L 31,7 L 38,23 L 55,24 L 41,35 L 46,51 z"
         ));
    }

And now let’s see what happens if we just change the seed value (to clearly see the difference, open them in two tabs and flip back and forth).

    var plot = new SplatterPlot('panel_one', 1000, 600, 800);
    plot.nodeX = 10;
    plot.nodeY = 10;
    plot.seed = 666;
    plot.buffer = 20;
    plot.nonSequentialDistributionMode = true;
    for(var lcv=0; lcv< 400; lcv++){
        plot.addNode(new SplatterPlotNode(
             "M 46,51 L 31,42 L 17,51 L 22,35 L 8,24 "+
             "L 25,23 L 31,7 L 38,23 L 55,24 L 41,35 L 46,51 z"
         ));
    }

I was asked a few times if the splatter plot could support images, and I’d explain how you could extend the node class to do that, but my guess is people would find it useful if it did that 'out of the box'. SVG’s Image rendering uses really poor pixel resampling algorithms, so scaled imaged don’t look as good. In fact I found SVG scaling seems to break down as the draw buffer becomes much larger than your view pane, so it’s a hugely terrible idea to just zoom/scale to infinity in a complex SVG without hand occluding elements offscreen. So now that I’ve fully chastised you for your vector sins, onto the example:

so let’s create 10 instances of 1 of 4 (random) pngs we have laying around.

    window.addEvent('domready', function(){
    
        var plot = new SplatterPlot(
            'panel_one',
            Window.getSize().x-30,
            Window.getSize().y-40,
            200
        );
        plot.nodeX = 70;
        plot.nodeY = 70;
        plot.seed = 120;
        plot.buffer = 0;
        plot.nonSequentialDistributionMode = false;
        plot.expansionFactor = 0.7;
    
        for(var lcv=0; lcv < 10; lcv++){
            plot.addNode(buildNode($random(1,4)));
        }
    });
    
Now lets write the function to set up each node:

    function buildNode(id, title){
        var node = new SplatterImageNode('images/masked/'+id+'.png');
        var root  = new Element('div', {'id': id});
        root.inject(document.body);
        node.click = function(){
    
        }
        node.mouseover= function(){
            this.shape.toFront();
            this.shape.animate({
                scale: 1.5
            }, 300, '<>');
        }
        node.mouseout= function(){
            this.shape.animate({
                scale: 0.60
            }, 300, '<>');
        }
        return node;
    }

Not too painful, eh? Enjoy!