// chp 9 Improve our bar chart
var body = d3.select("body");

var chartDataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                     11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

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

// Chp 9 Adding elements
d3.select("p")
  .on("click", function() {
    // here's the new data we're going to bind
    var maxValue = 25;
    var newNumber = Math.floor(Math.random() * maxValue);
    chartDataset.push(newNumber);

    // update xScale with the new size of the array
    xScale.domain(d3.range(chartDataset.length));

    // select all the rectangles
    var bars = chartSvg.selectAll('rect')
        .data(chartDataset);

    // add a new rectangle
    bars.enter()
      .append('rect')
      .attr({
        x: chartWidth,
        y: yStart,
        // xScale.rangeBand() returns the size of a band
        width: xScale.rangeBand(),
        height: barHeight,
        fill: 'teal'});

    // update all the bars
    // because we added a new element we need to update the x attribute
    // don't need to update the y attribute since the max value is fixed
    bars.transition()
      .duration(500)
      .attr({
        x: xStart,
        width: xScale.rangeBand()
      });

    // select all the labels
    var labels = chartSvg.selectAll('text')
        .data(chartDataset);

    // add a new label
    labels.enter()
      .append("text")
      .text(function(d,i){return d;})
      .attr({
        x: chartWidth,
        y: yLabel,
        fill: "white",
      })
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");

    // update the labels
    // because we added a new element we need to update the x attribute
    // don't need to update the y attribute since the max value is fixed

    labels.transition()
      .duration(500)
      .attr({
        x: xLabel
      });
  });
