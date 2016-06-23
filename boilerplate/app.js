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
    i = 0;

var treeCache = {};

// Our fake dataset
var treeData = {
  "name": "A",
  "children": [
    {
      "name": "B",
      "children": [
        {
          "name": "D",
          "children": [
            {
              "name": "H",
              "children": [
                {"name": "I"},
                {"name": "J"}
              ]
            }
          ]
        },
        {"name": "E"}
      ]
    },
    {
      "name": "C",
      "children": [
        {"name": "F"},
        {"name": "G"}
      ]
    }
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
  var n = tree(treeData);
  var l = tree.links(n);
  
  // save current position of source node
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
    .duration(500)
    .attr("d", exitDiagonal)
    .remove();

  lines.transition()
    .duration(500)
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
      .duration(500)
      .attr("transform",  "translate(" + nodeSource.x + "," + nodeSource.y + ")")
      .remove();

  nodeExit.selectAll("circle")
    .attr("r", 0.001);

  node.transition()
    .duration(500)
    .attr("transform", function(d) {return "translate(" + xPosition(d) + "," + yPosition(d) + ")";})

  node.selectAll("circle")
    .attr("r", nodeRadius);
}

// add nodes and update
// assumes that there are children of the node in the tree cache
function expandNode(d) {
  // pull children from cache and clear cache entry
  d.children = treeCache[d.name];
  delete treeCache[d.name]

  var n = tree(treeData);
  var l = tree.links(n);

  var nodeSource = {x: xPosition(d), y: yPosition(d)};
  // use this diagonal to collapse the line
  var enterDiagonal = d3.svg.diagonal()
      .projection(projectionFunc)
      .source(nodeSource)
      .target(nodeSource);


  var lines = svg.selectAll("path").data(l, function(d){return d.target.id;});
  var circles = svg.selectAll("circle").data(n, nodeKeyFunc);

  // add new links
  lines.enter()
    .append("path")
    .attr("d", enterDiagonal)
    .transition()
    .duration(500)
    .attr({
      d: diagonal,
      class: "edge"
    });

  // update links
  lines.transition()
    .duration(500)
    .attr({
      d: diagonal,
      class: "edge"
    });

  // add new nodes
  circles.enter()
    .append("circle")
    .attr("r", 0.001)
    .transition()
    .duration(500)
    .attr({
      cx: xPosition,
      cy: yPosition,
      r: nodeRadius,
      class: "node"
    })

  circles.transition()
    .duration(500)
    .attr({
      cx: xPosition,
      cy: yPosition,
      r: nodeRadius,
      class: "node"
    });

  circles.on("click", clickFunc);


}

// draw the nodes
function activate() {
  var nodes = tree(treeData);
  var links = tree.links(nodes);

  // draw the edges

  var node = svg.selectAll("g.node")
      .data(nodes, nodeKeyFunc);

  var nodeEnter = node.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function(d){return "translate(" + xPosition(d) + "," + yPosition(d) + ")";})
      .on("click", clickFunc);


  nodeEnter.append("circle")
    .attr("r", nodeRadius);

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
