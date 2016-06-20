// scatterplot chp 9

var dataset = [
  [5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
  [410, 12], [475, 44], [25, 67], [85, 21], [220, 88]
];

var svgWidth  = 500,
    svgHeight = 300,
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

// add a clip path so elements don't overflow
svg.append("clipPath")
   .attr("id", "chart-area")
   .append("rect")
   .attr({
     x: padding,
     y: padding,
     height: svgHeight - padding * 2,
     width: svgWidth - padding * 3 
   });

// build the scatterplot
// group the circles so we can use a clip path
svg.append("g")
  .attr("id", "circles")
  .attr("clip-path", "url(#chart-area)")
  // build the circles
  .selectAll("circle")
  .data(dataset)
  .enter()
  .append("circle")
  .attr({
    cx: function(d){return xScale(d[0]);},
    cy: function(d){return yScale(d[1]);},
    r:  function(d){return radiusScale(d[1]);},
    fill: "green"
  });

var xAxis = d3.svg.axis()
// give it our scale function
    .scale(xScale)
// specify where label text should appear in relation to the axis
    .orient("bottom")
    .ticks(5);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(5);

// add the axis to the screen
// .call() hands a selection object to a function
svg.append("g")
  .attr({
    class: "x axis",
    transform: "translate(0," + (svgHeight - padding) + ")"
  })
  .call(xAxis);

svg.append("g")
  .attr({
    class: "y axis",
    transform: "translate("+ padding + ",0)"
  })
  .call(yAxis);


// update the data
d3.select("p")
  .on("click", function(){
    // gen data
    var xMax = 1900,
        yMax = 100;
    var newDataset = [];
    for (var i = 0; i < dataset.length; i++){
      var randomX = Math.floor(Math.random() * xMax);
      var randomY = Math.floor(Math.random() * yMax);
      newDataset.push([randomX, randomY]);
    }

    // adjust the scales for new data
    xScale.domain([0, d3.max(newDataset, maxX)]);
    yScale.domain([0, d3.max(newDataset, maxY)]);
    
    // adjust the axes
    xAxis.scale(xScale);
    yAxis.scale(yScale);
    
    // bind new data
    svg.selectAll("circle")
      .data(newDataset)
      .transition()
      .duration(1000)
      // .each affects each element before or after the transition
      .each("start", function() {
        d3.select(this)
          .attr({
            fill: "magenta",
            r: 7
          });
      })
      .attr({
        cx: function(d){return xScale(d[0]);},
        cy: function(d){return yScale(d[1]);},
        r:  function(d){return radiusScale(d[1]);}
      })
      .each("end", function() {
        d3.select(this)
          .attr({
            fill: "green"
          });
      });
    
    // update the axes
    svg.select(".x.axis")
       .transition()
       .duration(1000)
       .call(xAxis);
    
    svg.select(".y.axis")
       .transition()
       .duration(1000)
       .call(yAxis);

  });
