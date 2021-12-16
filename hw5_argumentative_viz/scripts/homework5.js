
var data;

var left_data = {};
var right_data = {};

var width = 700;
var height = 600;
var margin = 40;

function colors1(key){
    
    c = {};
    c["Asian"] = "yellow";
    c["Black"] = "orange";
    c["Hispanic"] = "green";
    c["Native"] = "red";
    c["Other"] = "clay";
    c["White"] = "blue";

    return c[key];
}

//adding this just for final commit lol


document.addEventListener("DOMContentLoaded", function () {
    Promise.all([
        d3.csv("data/shootings.csv"),
      ]).then(function (values) {
        data = values[0];
    
       //console.log(data);
       preprocessing();
       drawleft();
       drawright();
    });
   
});

function preprocessing(){
    for (var i = 0 ; i < data.length;i++)
    {
        key = data[i]["race"];
        

        if (data[i]["state"] =="AZ" || data[i]["state"] == "CA" || data[i]["state"] == "TX")
        {
            if (!(key in right_data))
            {
                right_data[key] = 0;
            }
            right_data[key] = right_data[key]+1;
    
        }
        else
        {
            if (!(key in left_data))
            {
                left_data[key] = 0;
            }
            left_data[key] = left_data[key]+1;
        }
    }
    //sorting the keys of the dictionary
    var keys = Object.keys(left_data); 
    keys.sort();
    var keys2 = Object.keys(right_data); 
    keys2.sort();
    
}

function drawleft()
{   
    
    console.log("in left");
    console.log(left_data);
    var radius = Math.min(width, height) / 2 - margin-20;
  

    var svg = d3.select("#left")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Compute the position of each group on the pie:
    var pie = d3.pie()
    .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(left_data))

    var divi = d3.select(".tooltip-left");

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
    .selectAll('myslices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
    )
    .attr('fill', function(d){ return(colors1(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
    .on("mouseover", function (d, i) {
        d3.select(this)
          .transition()
          .style("stroke", "cyan")
          .style("stroke-width", "4");
  
      })
      .on("mousemove", function (d, i) {
        
        divi.transition().duration(50).style("opacity", 1);
        let race = d.data.key;
        let count = left_data[d.data.key]
        divi
          .html("<p>Race: " + race + "</p><p>Shooting count: " + count + "</p>")
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
        console.log("clicked on " + d.data.key + " and count is " + left_data[d.data.key]);
      });
    
    svg.append("text")
      .attr("x", 0)             
      .attr("y", -275)
      .attr("text-anchor", "middle")  
      .style("font-size", "24px") 
      .style("text-decoration", "underline")  
      .text("Shootings Data for states other than AZ , CA and TX");
    

}

function drawright()
{
    console.log("printing from right");
    console.log(right_data);
    
    var radius = Math.min(width, height) / 2 - margin-20;
  

    var svg = d3.select("#right")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" +  +width / 2 + "," +height / 2 + ")");

    // Compute the position of each group on the pie:
    var pie = d3.pie()
    .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(right_data))

    var divi_right = d3.select(".tooltip-right");
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
    .selectAll('whatever')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
    )
    .attr('fill', function(d){ return(colors1(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
    .on("mouseover", function (d, i) {
        d3.select(this)
          .transition()
          .style("stroke", "cyan")
          .style("stroke-width", "4");
  
      })
      .on("mousemove", function (d, i) {
        
        divi_right.transition().duration(50).style("opacity", 1);
        let race = d.data.key;
        let count = right_data[d.data.key]
        divi_right
          .html("<p>Race: " + race + "</p><p>Shooting count: " + count + "</p>")
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 15 + "px")
          .style("position", "absolute");
      })
      .on("mouseout", function (d, i) {
        d3.select(this)
          .transition()
          .style("stroke", "black")
          .style("stroke-width", "1");
        divi_right.transition().duration(50).style("opacity", 0);
      })
      .on("click", function (d, i) {
        console.log("clicked on " + d.data.key + " and count is " + right_data[d.data.key]);
      });
    

    svg.append("text")
       .attr("x", 0)             
       .attr("y", -275)
       .attr("text-anchor", "middle")  
       .style("font-size", "24px") 
       .style("text-decoration", "underline")  
       .text("Shootings Data for Arizona, California and Texas");
}