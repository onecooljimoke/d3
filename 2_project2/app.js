// scatterplot chp 6

var dataset = [
                [5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
                [410, 12], [475, 44], [25, 67], [85, 21], [220, 88], [600, 150]
              ];

var svgWidth  = 500,
    svgHeight = 300
    padding = 30; // use this to add space around the margins so elements aren't cut off

function circleX(d,i){
  return d[0];
}

function circleY(d,i){
  return d[1];
}

function circleRadius(d, i){
  return Math.sqrt(svgHeight - d[1]);
}

function circleText(d,i){
  return d[0] + ',' + d[1];
}

// build scaling functions
function maxX(d){
  return d[0];
}

function maxY(d){
  return d[1];
}

// .domain -> map from these values
// .range -> map to thes values
// input = domain
// output = range

var xScale = d3.scale.linear()
                     .domain([0, d3.max(dataset, maxX)])
                     .range([padding, svgWidth - padding * 2]);

var yScale = d3.scale.linear()
                     .domain([0, d3.max(dataset, maxY)])
                     .range([svgHeight - padding, padding]);

var radiusScale = d3.scale.linear()
                          .domain([0, d3.max(dataset, maxY)])
                          .range([2,5]);

var svg = d3.select("body")
            .append("svg")
            .attr({
              width: svgWidth,
              height:svgHeight 
            });

// build the scatterplot
svg.selectAll("circle")
   .data(dataset)
   .enter()
   .append("circle")
   .attr({
     cx: function(d){return xScale(d[0]);},
     cy: function(d){return yScale(d[1]);},
     r:  function(d){return radiusScale(d[1]);},
     fill: "green"
   });

// Add labels
svg.selectAll("text")
   .data(dataset)
   .enter()
   .append("text")
   // commented out the text after we added axes
   // .text(circleText)
   .attr({
     x: function(d){return xScale(d[0]);},
     y: function(d){return yScale(d[1]);},
   })
   .attr("font-family", "sans-serif")
   .attr("font-size", "11px")
   .attr("fill", "red");


// add axes (chp 8)

// build an axis generating funciton
// displays tick values as percentages
var formatAsPercent = d3.format(".1%");

var xAxis = d3.svg.axis()
                  // give it our scale function
                  .scale(xScale)
                  // specify where label text should appear in relation to the axis
                  .orient("bottom")
                  .ticks(5)
                  .tickFormat(formatAsPercent);

var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .ticks(5);

// add the axis to the screen
// .call() hands a selection object to a function
svg.append("g")
   .attr({
     class: "axis",
     transform: "translate(0," + (svgHeight - padding) + ")"
   })
   .call(xAxis);

svg.append("g")
   .attr({
     class: "axis",
     transform: "translate("+ padding + ",0)"
   })
   .call(yAxis);
