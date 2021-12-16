// Hint: declare global variables here


let females;
let males;

var time_parser = d3.timeParse("%Y");


// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function
    
    
   // This will load your two CSV files and store them into two arrays.
   Promise.all([d3.csv('data/females_data.csv'),d3.csv('data/males_data.csv')])
        .then(function (values) {
            console.log('loaded females_data.csv and males_data.csv');
            female_data = values[0];
            male_data = values[1];
            
            // Hint: This is a good spot for doing data wrangling
            female_data.map(data =>
                {
                    data.Year               = +time_parser(data["Year"]);
                    data["Argentina"]       = +data["Argentina"];
                    data["Canada"]          = +data["Canada"];
                    data["United States"]   = +data["United States"];
                    data["Germany"]         = +data["Germany"];
                    data["Brazil"]          = +data["Brazil"];
                });

            females = female_data;
            
            male_data.map(data =>
                {
                    data.Year               =  +time_parser(data["Year"]);
                    data["Argentina"]       = +data["Argentina"];
                    data["Canada"]          = +data["Canada"];
                    data["United States"]   = +data["United States"];
                    data["Germany"]         = +data["Germany"];
                    data["Brazil"]          = +data["Brazil"];
                });
            console.log(females);
            
            males = male_data;
            drawLolliPopChart();
        });
});

// Use this function to draw the lollipop chart.
function drawLolliPopChart() {
  
    
    

    //Getting which country is selected
    const country = d3.select("#Countries").property('value');
    //console.log(country);

    //creating x and y scale 
    //const xScale = d3.scaleLinear().domain([1990,2023]).range([0,innerwidth]);
    const xScale = d3.scaleTime()
    .domain([new Date("1990"), new Date("2023")])
    .range([0,innerWidth]);

    const max_male = d3.max(males,d=>d[country]);
    const max_female = d3.max(females,d=> d[country]);
    const yScale = d3.scaleLinear().domain([0,Math.max(max_male,max_female)]).range([innerHeight,0]);

    //removing everything that was drawn earlier
    svg.select('g').remove();

    const g = svg.append('g').attr('transform','translate('+margin.left +', '+margin.top+')');
    
    g.selectAll('circle')
    .data(males)
    .enter()
    .append('circle')
    .attr('cx',d=>xScale(d.Year)-5)
    .attr('cy',d=>yScale(d[country]))
    .attr('r',5)
    .style('fill','blue');
    

    g.selectAll('lines')
    .data(males)
    .enter()
    .append('line')
    .attr('x1',d=>xScale(d.Year)-5)
    .attr('x2',d=>xScale(d.Year)-5)
    .attr('y1',d=>yScale(0))
    .attr('y2',d=>yScale(d[country]))
    .style("stroke", "blue");


    
    
    g.selectAll('circle2')
    .data(females)
    .enter()
    .append('circle')
    .attr('cx',d=>xScale(d.Year)+5)
    .attr('cy',d=>yScale(d[country]))
    .attr('r',5)
    .style("fill",'magenta');
    

    g.selectAll('lines')
    .data(females)
    .enter()
    .append('line')
    .attr('x1',d=>xScale(d.Year)+5)
    .attr('x2',d=>xScale(d.Year)+5)
    .attr('y1',d=>yScale(0))
    .attr('y2',d=>yScale(d[country]))
    .style("stroke", "magenta");

    const yAxis = d3.axisLeft(yScale);
    g.append('g').call(yAxis);

    const xAxis = d3.axisBottom(xScale);
    g.append('g').call(xAxis).attr('transform',`translate(0, ${innerHeight})`);

    g.append('text')
    .attr('x',innerWidth/2)
    .attr('y',innerHeight+40)
    .text("Years");

    g.append('text')
    .attr('transform','rotate(-90)')
    .attr('y','-40px')
    .attr('x',-innerHeight/2)
    .attr('text-anchor','middle')
    .text("Employment Rate");

    //add legend
    g.append("rect")
    .attr("x",720)
    .attr("y",-48)
    .attr("width",17)
    .attr("height",17)
    .style("fill","magenta");

    g.append("rect")
    .attr("x",720)
    .attr("y",-22)
    .attr("width",17)
    .attr("height",17)
    .style("fill","blue");

    g.append("text")
    .attr("x",750)
    .attr("y",-35)
    .text("Female Employment Rate")
    .style("font-size","15px")
    .attr("alignment-baseline","middle");

    g.append("text")
    .attr("x",750)
    .attr("y",-10)
    .text("Male Employment Rate")
    .style("font-size","15px")
    .attr("alignment-baseline","middle");
}

