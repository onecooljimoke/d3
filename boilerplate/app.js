// Data

var svgWidth = 1200,
    svgHeight = 600,
    padding = 40,
    nodeRadius = 25;

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


// Scales
// default tree layout computes x and y values on scale of 0 to 1
// this can be modified if you need to
var xScale = d3.scale
    .linear()
    .domain([0, 1])
    .range([padding * 2, svgWidth - padding]);

var yScale = d3.scale
    .linear()
    .domain([0, 1])
    .range([padding, svgHeight - padding]);

// Determine x and y positions
// flip the usage of d.x and d.y so the tree goes from right to left
// instead of top down
function xPosition(d, i) {
  return xScale(d.y);
}

function yPosition(d, i) {
  return yScale(d.x);
}

function projectionFunc(d) {
  return [xScale(d.y), yScale(d.x)];
}

// remove nodes and update view
function collapseNode(d) {
  console.log(d.name + " clicked");
  treeCache[d.name] = d.children;
  d.children = null;
  var n = tree(treeData);
  var l = tree.links(n);

  var lines = svg.selectAll("path").data(l);

  // update links
  lines.exit()
    .transition()
    .duration(500)
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
  var circles = svg.selectAll("circle").data(n);

  circles.exit()
    .transition()
    .duration(500)
    .remove();

  circles.transition()
    .duration(500)
    .attr({
      cx: xPosition,
      cy: yPosition,
      r: nodeRadius,
    })
}

// add nodes and update
// assumes that there are children of the node in the tree cache
function expandNode(d) {
  // pull children from cache and clear cache entry
  d.children = treeCache[d.name];
  treeCache[d.name] = null;

  var n = tree(treeData);
  var l = tree.links(n);

  var lines = svg.selectAll("path").data(l);
  var circles = svg.selectAll("circle").data(n);

  // add new links
  lines.enter()
    .append("path")
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
    .transition()
    .duration(500)
    .attr({
      cx: xPosition,
      cy: yPosition,
      r: nodeRadius,
      class: "node"
    });

  circles.transition()
    .duration(500)
    .attr({
      cx: xPosition,
      cy: yPosition,
      r: nodeRadius,
      class: "node"
    });


}

// Add svg to the screen
var svg = d3.select("#display")
    .append("svg")
    .attr({
      width: svgWidth,
      height: svgHeight
    });

// Build a tree
var tree = d3.layout.tree(treeData);
var nodes = tree(treeData);
var links = tree.links(nodes);

// draw the edges
// **note** I drew the edges first so the ends hide under the nodes
// this is, I'm sure, kind of suspect, but it works for now

// the diagonal projection function interprets the x and y coordinates
// need to use a custom projection function so the path's render correctly
var diagonal = d3.svg.diagonal().projection(projectionFunc);

svg.selectAll("path")
  .data(links)
  .enter()
  .append("path")
  .attr({
    d: diagonal,
    // need to set the stroke and stroke width to insure straight lines
    // appear.  looks like default bezier uses the fill property only to
    // show lines
    class: "edge"
  });

// draw the nodes
svg.selectAll("circle")
  .data(nodes)
  .enter()
  .append("circle")
  .attr({
    cx: xPosition,
    cy: yPosition,
    r: nodeRadius,
    class: "node"
  });

// select a node
svg.selectAll("circle")
  .on("click", function(d) {
    if(d.hasOwnProperty("children")) {
      collapseNode(d);
    } else {
      if(treeCache.hasOwnProperty(d.name)){
        expandNode(d);
      }
    }
  });
