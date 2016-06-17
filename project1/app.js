var dataset = [5, 10, 15, 20, 25];
var body = d3.select("body");

// Add some paragraphs (chp. 5)
body.selectAll("p")
  // loads data so we can bind it to the selection
  .data(dataset)
  // loop through dataset and bind each value to an element
  // create the element if it doesn't exist
  .enter()
  .append("p")
  .text(function(d){return d;})
  .style("color", function(d, i) {
    if(d < 15) {
      return "red";
    } else {
      return "black";
    }
  });

// Add SVG (chp. 6)
var svgWidth = 500
    , svgHeight = 50;

var xPosFunc = function(d, i) {
  return (i * 50) + 25;
};

var yPosFunc = function(d, i) {
  return svgHeight / 2;
};

var radiusFunc = function(d, i){
  return d;
};

var svg = body.append("svg")
              .attr("width", svgWidth)
              .attr("height", svgHeight);

svg.selectAll("circle")
   .data(dataset)
   .enter()
   .append("circle")
   .attr("cx", xPosFunc)
   .attr("cy", yPosFunc)
   .attr("r", radiusFunc)
   .attr("fill", "green")
   .attr("stroke", "orange")
   .attr("stroke-width", function(d){return d/2;});


// build a bar chart (chp. 6)
var chartDataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

var chartHeight = 100,
    chartWidth  = 500,
    barPadding  = 1;

var chartSvg = body.append("svg")
                   .attr("width", chartWidth)
                   .attr("height", chartHeight);

var xStart = function(d, i){
  return i * (chartWidth / chartDataset.length);
};

var yStart = function(d, i){
  return chartHeight - (4 * d);
};

var barWidth = function(d, i){
  return (chartWidth / chartDataset.length) - barPadding;
};

var barHeight = function(d, i){
  return (4 * d);
};

chartSvg.selectAll("rect")
        .data(chartDataset)
        .enter()
        .append("rect")
        // pass an object to .attr to set multiple values
        .attr({
          x: xStart,
          y: yStart,
          width: barWidth,
          height: barHeight,
          fill: 'teal'});

// Add some text labels
var xLabel = function(d, i){
  return xStart(d,i) + 5;
};

var yLabel = function(d,i){
  return yStart(d,i) + 15;
};

chartSvg.selectAll("text")
        .data(chartDataset)
        .enter()
        .append("text")
        .text(function(d,i){return d;})
        .attr({
          x: xLabel,
          y: yLabel 
          });
