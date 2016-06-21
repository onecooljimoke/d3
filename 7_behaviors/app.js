// Chp 10 - Add behaviors to the bar chart
var body = d3.select("body");

var chartDataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                     11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

var ascendingSort = false;

var chartHeight = 200,
    chartWidth  = 600,
    barPadding  = 1;

var chartSvg = body.append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight);

var xScale = d3.scale.ordinal()
// d3.range returns an array of values from 0 to arg
    .domain(d3.range(chartDataset.length))
// rangeBands make the range values bands of a specified width
// the extra parameter of 0.05 builds space between the bands
    .rangeRoundBands([0, chartWidth], 0.05);

var yScale = d3.scale.linear()
    .domain([0, d3.max(chartDataset, function(d) {return d;})])
    .range([0, chartHeight - 30]);

var xStart = function(d, i){
  return xScale(i);
};

var yStart = function(d, i){
  return chartHeight - yScale(d);
};

var barWidth = function(d, i){
  return (chartWidth / chartDataset.length) - barPadding;
};

var barHeight = function(d, i){
  return yScale(d);
};

chartSvg.selectAll("rect")
  .data(chartDataset)
  .enter()
  .append("rect")
// pass an object to .attr to set multiple values
  .attr({
    x: xStart,
    y: yStart,
    // xScale.rangeBand() returns the size of a band
    width: xScale.rangeBand(),
    height: barHeight,
    fill: 'teal'});

// Add some text labels
var xLabel = function(d, i){
  return xStart(d,i) + xScale.rangeBand() / 2;
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
    y: yLabel,
    fill: "white",
  })
  .attr("font-family", "sans-serif")
  .attr("text-anchor", "middle");


// Chp 10
// add hover effects
/*
programmatically control transitions
commented out because hover transitions don't
play nice with sorting because they are also transitions
chartSvg.selectAll("rect")
  .on("mouseover", function(){
    d3.select(this)
      .transition()
      .duration(300)
      .attr("fill", "orange");
  })
  .on("mouseout", function(){
    d3.select(this)
      .transition()
      .duration(200)
      .attr("fill", "teal");
  });
*/

d3.select("button")
  .on("click", sortBars);

function sortBars() {
  // sort the rects
  function ascending(a,b){ return d3.ascending(a,b);}
  function descending(a,b){return d3.descending(a,b);}
  var sortFunc = null; 
  
  ascendingSort = !ascendingSort;

  if(ascendingSort){
    sortFunc = ascending;
  } else {
    sortFunc = descending;
  }

  chartSvg.selectAll("rect")
    .sort(sortFunc)
    .transition()
    .delay(function(d, i){return i * 50;})
    .duration(1000)
    .attr("x", xStart);

  // fix the labels
  chartSvg.selectAll("text")
    .sort(sortFunc)
    .transition()
    .delay(function(d, i){return i * 50;})
    .duration(1000)
    .attr("x", xLabel);
}
