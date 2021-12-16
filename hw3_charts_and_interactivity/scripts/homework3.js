var mapSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };
var parseTime = d3.timeParse("%Y");
var mapData;
var timeData;
var height = 100;
var margin = { top: 20, right: 60, bottom: 60, left: 20 };
var barHeight = 20;

let Timedata;
// This runs when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  mapSvg = d3.select("#map");
  lineSvg = d3.select("#linechart");
  lineWidth = +lineSvg.style("width").replace("px", "");
  lineHeight = +lineSvg.style("height").replace("px", "");
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  // Load both files before doing anything else
  Promise.all([
    d3.json("data/africa.geojson"),
    d3.csv("data/africa_gdp_per_capita.csv"),
  ]).then(function (values) {
    mapData = values[0];

    timeData = values[1];
    Timedata = timeData;
    drawMap();
  });
});
function formatTick(d) {
  return this.parentNode.nextSibling ? `${d}` : `${d}`;
}
// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for (var key in yearData) {
    if (key == "Year") continue;
    let val = +yearData[key];
    if (val > max) max = val;
    if (val < min) min = val;
  }
  return [min, max];
}

// Draw the map in the #map svg
function drawMap() {
  // create the map projection and geoPath
  let projection = d3
    .geoMercator()
    .scale(400)
    .center(d3.geoCentroid(mapData))
    .translate([
      +mapSvg.style("width").replace("px", "") / 2,
      +mapSvg.style("height").replace("px", "") / 2.3,
    ]);
  let path = d3.geoPath().projection(projection);

  // get the selected year based on the input box's value
  var year = document.getElementById("year-input").value;

  // get the GDP values for countries for the selected year
  let yearData = timeData.filter((d) => d.Year == year)[0];

  // get the min/max GDP values for the selected year
  let extent = getExtentsForYear(yearData);

  // get the selected color scale based on the dropdown value
  var color_scale_select = document.getElementById("color-scale-select").value;
  var colorScale = d3.scaleSequential(d3[color_scale_select]).domain(extent);

  //adding the div that will be invisible initially
  var divi = d3.select(".tooltip-map");

  // draw the map on the #map svg
  mapSvg.selectAll("*").remove();
  let g = mapSvg.append("g");

  g.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", (d) => {
      return d.properties.name;
    })
    .attr("class", "countrymap")
    .style("fill", (d) => {
      let val = +yearData[d.properties.name];
      if (isNaN(val)) return "white";
      return colorScale(val);
    })
    .attr("transform", "translate(0, 0)")
    .on("mouseover", function (d, i) {
      d3.select(this)
        .transition()
        .style("stroke", "cyan")
        .style("stroke-width", "4");

      //line chart

      drawLineChart(d.properties.name);
    })
    .on("mousemove", function (d, i) {
      //making the div appear on hover
      divi.transition().duration(50).style("opacity", 1);
      let country_name = d.properties.name;
      let year = document.getElementById("year-input").value;
      let gdp = Timedata[+year - 1960][country_name];
      divi
        .html("<p>Country: " + country_name + "</p><p>GDP: " + gdp + "</p>")
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 15 + "px")
        .style("position", "absolute");
    })
    .on("mouseout", function (d, i) {
      d3.select(this)
        .transition()
        .style("stroke", "black")
        .style("stroke-width", "1");
      divi.transition().duration(50).style("opacity", 0);
    })
    .on("click", function (d, i) {
      console.log("clicked on " + d.properties.name);
    });

  axisScale = d3.scaleLinear().domain(colorScale.domain()).range([0, 200]);

  axisBottom = (mapSvg) =>
    mapSvg
      .attr("class", `x-axis`)
      .attr("transform", `translate(${margin.left},500)`)
      .call(d3.axisBottom(axisScale).ticks(5).tickSize(-20));

  const linearGradient = mapSvg
    .append("defs")
    .append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient
    .selectAll("stop")
    .data(
      colorScale
        .ticks()
        .map((t, i, n) => ({
          offset: `${(100 * i) / n.length}%`,
          color: colorScale(t),
        }))
    )
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  mapSvg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom - barHeight})`)
    .append("rect")
    .attr("transform", `translate(${margin.left}, 460)`)
    .attr("width", 200)
    .attr("height", 20)
    .style("fill", "url(#linear-gradient)");

  mapSvg.append("g").call(axisBottom).attr("class", "colorLegend");
}

// Draw the line chart in the #linechart svg for
// the country argument (e.g., `Egypt').
function drawLineChart(country) {
  if (!country) return;

  let parseTime = d3.timeParse("%Y");

  var x = d3
    .scaleTime()
    .domain([new Date("1960"), new Date("2011")])
    .range([0, lineInnerWidth]);

  var y = d3
    .scaleTime()
    .domain([0, d3.max(timeData, (d) => +d[country])])
    .range([lineInnerHeight, 0]);

  lineSvg.selectAll("*").remove();
  const g = lineSvg
    .append("g")
    .attr(
      "transform",
      "translate(" + lineMargin.left + ", " + lineMargin.top + ")"
    );

  //circle thing
  var focus = g
    .append("g")
    .append("circle")
    .style("fill", "none")
    .attr("stroke", "black")
    .attr("r", 10.0)
    .style("opacity", 0);
  //invisible div for line chart
  var div = d3.select(".tooltip-map-line");

  //draw line
  var line = d3
    .line()
    .x(function (d) {
      return x(+parseTime(d["Year"]));
    })
    .y(function (d) {
      return y(+d[country]);
    });

  g.append("path")
    .datum(timeData)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", line)
    .attr("id-x", (d) => {
      return x(+parseTime(d["Year"]));
    })
    .attr("id-y", (d) => {
      return y(+d[country]);
    });

  g.append("rect")
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr("width", lineInnerWidth)
    .attr("height", lineInnerHeight)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  function mouseover() {
    focus.style("opacity", 1);
  }
  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]);
    // get closest x index of mouse
    var bisect = d3.bisector(function (d) {
      return parseTime(d.Year);
    }).right;
    var item = timeData[bisect(timeData, x0)];

    focus.attr(
      "transform",
      `translate(${x(parseTime(item.Year))},${y(item[country])})`
    );

    div.transition().duration(50).style("opacity", 1);

    let yg = "<p>Year: " + item.Year + "</p> <p>GDP: " + item[country] + "</p>";
    div
      .html(yg)
      .style("left", d3.event.pageX + 3 + "px")
      .style("top", d3.event.pageY - 15 + "px");
  }
  function mouseout() {
    focus.style("opacity", 0);
    div.transition().duration("0").style("opacity", 0);
  }

  g.append("g")
    .attr("transform", `translate(0,${lineInnerHeight})`)
    .attr("color", "grey")
    .call(
      d3
        .axisBottom(x)
        .ticks(d3.timeYear.every(5))
        .tickFormat((d) =>
          d <= d3.timeYear.every(10)(d) ? d.getFullYear() : null
        )
    )
    .style("stroke", "grey")
    .attr("font-size", 13)
    .attr("opacity", 0.7)
    .call((g) => g.select(".domain").remove());

  g.append("g")
    .call(
      d3
        .axisRight(y)
        .tickSize(lineWidth - lineMargin.left - lineMargin.right)
        .tickFormat(formatTick)
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "5,10")
    )
    .style("stroke", "grey")

    .call((g) =>
      g
        .selectAll(".tick text")
        .attr("x", -25)
        .attr("dy", 3.5)
        .attr("font-size", 13)
        .attr("opacity", 0)
        .attr("font-color", "grey")
    );

  // Add X and Y Labels
  g.append("text")
    .attr("x", lineInnerWidth / 2)
    .attr("y", lineInnerHeight + 40)
    .style("fill", "grey")
    .text("Year");
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", "-40px")
    .attr("x", -lineInnerHeight / 2)
    .attr("text-anchor", "middle")
    .text("GDP for " + country + " (based on current USD)")
    .style("fill", "grey");
}
