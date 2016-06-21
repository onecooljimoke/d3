// Data

var svgWidth = 1200,
    svgHeight = 600,
    padding = 40,
    nodeRadius = 25;

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

