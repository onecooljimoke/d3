// Data

var svgWidth = 1200,
    svgHeight = 600,
    margin = {
      left: 80,
      right: 40,
      top: 40,
      bottom: 40
    },
    nodeRadius = 25,
    i = 0,
    duration = 500;

var treeCache = {
  "B": [
    {"name": "D"},
    {"name": "E"}
  ],
  "C": [
    {"name": "F"},
    {"name": "G"}
  ],
  "D": [
    {"name": "H"}
  ],
  "H": [
    {"name": "I"},
    {"name": "J"}
  ]
};

// Our fake dataset
var treeData = {
  "name": "A",
  "children": [
    {"name": "B"},
    {"name": "C"}
  ]
};

/** Initialize screen at start **/
// Add svg to the screen
var svg = d3.select("#display")
    .append("svg")
    .attr({
      width: svgWidth,
      height: svgHeight
    });

// Build a tree
var tree = d3.layout.tree(treeData);

// the diagonal projection function interprets the x and y coordinates
// need to use a custom projection function so the path's render correctly
var diagonal = d3.svg.diagonal()
    .projection(projectionFunc)
    .source(sourceFunc)
    .target(targetFunc);



// define a key function
function nodeKeyFunc(d) {
  return d.id || (d.id = ++i);
}

function pathKeyFunc(d) {
  return d.target.id;
}

function clickFunc(d) {
  if(d.hasOwnProperty("children")) {
    collapseNode(d);
  } else {
    if(treeCache.hasOwnProperty(d.name)){
      expandNode(d);
    }
  }
}


// Scales
// default tree layout computes x and y values on scale of 0 to 1
// this can be modified if you need to
var xScale = d3.scale
    .linear()
    .domain([0, 1])
    .range([margin.left, svgWidth - margin.right]);

var yScale = d3.scale
    .linear()
    .domain([0, 1])
    .range([margin.top, svgHeight - margin.bottom]);

// Determine x and y positions
// flip the usage of d.x and d.y so the tree goes from right to left
// instead of top down
function xPosition(d, i) {
  return xScale(d.y);
}

function yPosition(d, i) {
  return yScale(d.x);
}

// bezier functions return a value between 0 and 1
// which corresponds to the x and y positions calculated by
// the tree layout
// these functions used for calculating the paths
function bezierXSource(d){
  return d.x;
}

function bezierYSource(d){
  var yPos = xPosition(d) + nodeRadius;
  return xScale.invert(yPos);
}

function bezierXTarget(d){
  return d.x;
}

function bezierYTarget(d){
  var yPos = xPosition(d) - nodeRadius;
  return xScale.invert(yPos);
}

function projectionFunc(d) {
  return [xScale(d.y), yScale(d.x)];
}

function sourceFunc(d) {
  return {x: bezierXSource(d.source), y: bezierYSource(d.source)};
}

function targetFunc(d) {
  return {x: bezierXTarget(d.target), y: bezierYTarget(d.target)};
}

// remove nodes and update view
function collapseNode(source) {
  treeCache[source.name] = source.children;
  source.children = null;

  // calling tree updates the x,y values of all nodes
  // this actually changes the x,y values of source
  var n = tree(treeData);
  var l = tree.links(n);

  // save the new position of the source
  var nodeSource = {x: xPosition(source), y: yPosition(source)};

  // use this diagonal to collapse the line
  var exitDiagonal = d3.svg.diagonal()
      .projection(projectionFunc)
      .source({x: bezierXSource(source), y: bezierYSource(source)})
      .target({x: bezierXSource(source), y: bezierYSource(source)});

  var lines = svg.selectAll("path").data(l, pathKeyFunc);

  // update links
  lines.exit()
    .transition()
    .duration(duration)
    .attr("d", exitDiagonal)
    .remove();

  lines.transition()
    .duration(duration)
    .attr({
      d: diagonal,
      // need to set the stroke and stroke width to insure straight lines
      // appear.  looks like default bezier uses the fill property only to
      // show lines
      class: "edge"
    });

  // update nodes
  var node = svg.selectAll("g")
      .data(n, nodeKeyFunc);

  var nodeExit = node.exit()
      .transition()
      .duration(duration)
      .attr("transform",  "translate(" + nodeSource.x + "," + nodeSource.y + ")")
      .remove();

  nodeExit.selectAll("circle")
    .attr("r", 0.001);

  node.transition()
    .duration(duration)
    .attr("transform", function(d) {return "translate(" + xPosition(d) + "," + yPosition(d) + ")";})

  node.selectAll("circle")
    .attr("r", nodeRadius);
}

// add nodes and update
// assumes that there are children of the node in the tree cache
function expandNode(source) {
  // pull children from cache and clear cache entry
  source.children = treeCache[source.name];
  delete treeCache[source.name]

  // save the old position of source node
  var nodeSource = {x: xPosition(source), y: yPosition(source)};
  var nodeBezier = {x: source.x, y: source.y};

  var n = tree(treeData);
  var l = tree.links(n);


  // use this diagonal to collapse the line
  var enterDiagonal = d3.svg.diagonal()
      .projection(projectionFunc)
      .source({x: bezierXSource(nodeBezier), y: bezierYSource(nodeBezier)})
      .target({x: bezierXSource(nodeBezier), y: bezierYSource(nodeBezier)});

  // add new nodes
  var node = svg.selectAll("g")
      .data(n, nodeKeyFunc);

  var nodeEnter = node.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function(d){
        return "translate(" + nodeSource.x + "," + nodeSource.y + ")";
      })
      .on("click", clickFunc);

  nodeEnter.append("circle")
    .attr("r", nodeRadius)
  
  nodeEnter.append("text")
    .attr("y", 40)
    .text(function(d) {return d.name;});


  node.transition()
    .duration(duration)
    .attr("transform", function(d){
      return "translate(" + xPosition(d) + "," + yPosition(d) + ")";
    });

  // add new links
  var link = svg.selectAll("path").data(l, pathKeyFunc);

  link.enter()
    .append("path")
    .attr("d", enterDiagonal)
    .attr("class", "edge");

  link.transition()
    .duration(duration)
    .attr("d", diagonal);


}

// draw the nodes
function activate() {
  var nodes = tree(treeData);
  var links = tree.links(nodes);

  // draw the nodes 

  var node = svg.selectAll("g.node")
      .data(nodes, nodeKeyFunc);

  var nodeEnter = node.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function(d){return "translate(" + xPosition(d) + "," + yPosition(d) + ")";})
      .on("click", clickFunc);


  nodeEnter.append("circle")
    .attr("r", nodeRadius);
  
  nodeEnter.append("text")
    .attr("y", 40)
    .text(function(d) {return d.name;});

  // draw the links
  svg.selectAll("path")
    .data(links, pathKeyFunc)
    .enter()
    .append("path")
    .attr({
      d: diagonal,
      // need to set the stroke and stroke width to insure straight lines
      // appear.  looks like default bezier uses the fill property only to
      // show lines
      class: "edge"
    });
}

activate();
