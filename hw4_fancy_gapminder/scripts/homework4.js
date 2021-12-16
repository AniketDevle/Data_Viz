let employment_rate;
let child_mortality;
let countries_region;
let income_per_person;
let life_expectancy_years;
let population; 

let x_data;
let y_data;

var x_max;
var y_max;

var name_geo_dict = {};

var x_dataset;
var y_dataset;

var tooltip;
var pause_or_play = false;

var color_by_region = {
    'Europe & Central Asia': 'blue',
    'Latin America & Caribbean': 'yellow',
    'Middle East & North Africa': 'green',
    'Sub-Saharan Africa': 'red',
    'East Asia & Pacific': 'HoneyDew',
    'South Asia': 'Aqua',
    'North America': 'Pink',
    'All': 'Salmon'
}



const margin = {top: 10, right: 20, bottom: 50, left: 80};
const width = 900 - margin.left - margin.right;
const height = 550 - margin.top - margin.bottom;
var svg;

document.addEventListener('DOMContentLoaded', function () {

    svg = d3.select("#scatterplot")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("border","1px solid black")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    tooltip = d3.select('#tooltip');
    tooltip.style('opacity', '0');

    Promise.all([d3.csv('data/aged_15_24_employment_rate_percent.csv'),
                 d3.csv('data/child_mortality_0_5_year_olds_dying_per_1000_born.csv'),
                 d3.csv('data/countries_regions.csv'),
                 d3.csv('data/income_per_person.csv'),
                 d3.csv('data/life_expectancy_years.csv'),
                 d3.csv('data/population.csv')
                ]).then(function(values){

                values.forEach(inst => {
                    if ('country' in inst[0]) {
                        inst.forEach(d => {
                            for (const property in d) {
                                if (property !== 'country') {
                                    d[property] = +d[property];
                                }
                            } 
                        });    
                    }
                });        
                
                employment_rate = values[0];
                child_mortality = values [1];
                countries_region = values [2];
                income_per_person = values [3];
                life_expectancy_years = values[4];
                population = values[5]


                console.log("data loaded");
                //you also need to set the data
                setting_data();
                
                year = d3.select("#year-input").property('value')
                //console.log(year)

               //create a name geo dict
                for (let i = 0;i<197;i++)
                {
                    let county_name =countries_region[i]["name"];
                    let geo_name =  countries_region[i]["geo"];
                    name_geo_dict[county_name] = geo_name; 
                
                }
                console.log(name_geo_dict);

                drawScatterplot(year);
    });



});

function isCountryInRegion(country, region)
{
    if (region === 'All') {
        return true;
    }
    let flag = (countries_region.filter(row => {
        return (row['World bank region'] === region) && (row['name'] === country);})[0] !== undefined);


    return flag;
}


function geo_by_country(row)
{
    
    return name_geo_dict[row.country]
}
function setting_data()
{
    const x_attribute = d3.select("#X_attribute").property("value");
    const y_attribute = d3.select("#Y_attribute").property("value");
    const Region = d3.select("#Region").property("value");
    
    //loading x_data
    
    if  (x_attribute == "x_Income_per_person")
    {   
        x_data = income_per_person;
    }
    else if (x_attribute == "x_Life_Expectancy")
    {   
        x_data = life_expectancy_years;
    }
    else if (x_attribute == "x_population")
    {   
        x_data = population;
    }
    else if (x_attribute == "x_Employment_rate")
    {   
        x_data = employment_rate;
    }
    else if (x_attribute == "x_Child_Mortality")
    {   
        x_data = child_mortality;
    }
    else
    {
        console.log("X_loading_error")
    }

    //loading y_data
    
    if  (y_attribute == "y_Income_per_person")
    {      
        y_data = income_per_person;
    }
    else if (y_attribute == "y_Life_Expectancy")
    {   
        y_data = life_expectancy_years;
    }
    else if (y_attribute == "y_population")
    {   
        y_data = population;
    }
    else if (y_attribute == "y_Employment_rate")
    {   
        y_data = employment_rate;
    }
    else if (y_attribute == "y_Child_Mortality")
    {   
        y_data = child_mortality;
    }
    else
    {
        console.log("Y_loading_error")
    }
   

    x_dataset = x_data.filter(d => {return isCountryInRegion(d.country,Region)});
    y_dataset = y_data.filter(d => { return isCountryInRegion(d.country,Region)});

    //finding the max value for x and y as we dont wanna change the scale later
    x_max = 0
    x_dataset.forEach(row => {
        for (const property in row)
        {
            if (property !== "country")
            {
                if (row[property] > x_max)
                {
                    x_max = row[property];
                }
            }
        }
    });

    y_max = 0
    y_dataset.forEach(row => {
        for (const property in row)
        {
            if (property !== "country")
            {
                if (row[property] > y_max)
                {
                    y_max = row[property];
                }
            }
        }
    });

    //use these max values for scaling 
    console.log(x_max);
    console.log(y_max);
    year = d3.select("#year-input").property('value')
                //console.log(year)

    drawScatterplot(year);
}

function drawScatterplot (year) 
{
    const x_attribute = d3.select("#X_attribute").property("value");
    const y_attribute = d3.select("#Y_attribute").property("value");
    const Region = d3.select("#Region").property("value");

    var xscale = d3.scaleLinear()
                    .range([0,width])
                    .domain([0,x_max]);

    var yscale = d3.scaleLinear()
                    .range([height,0])
                    .domain([0,y_max]);
    
    const t = svg.transition()
                .duration(500);
    
    const radius = 20;

    let circles = svg.selectAll('circle');

    circles = circles
                .data(x_dataset.filter(row => {return (year in row) && y_dataset.filter(d => {return (year in d) && (d.country === row.country)})[0] !== undefined}))
                .join(
                    check => check.append("circle")
                    .style("fill",color_by_region[Region])
                    .style("stroke","black")
                    .style("opacity",0.7)
                    .attr("r" , radius)
                    .attr("cx" , d=> xscale(d[year]))
                    .attr("cy", function(d) { return yscale(y_dataset.filter(row => {return d.country == row.country})[0][year]); })
                    .on("mouseover", d=> {
                        var mouse = d3.mouse(circles.node()).map(function(d){
                            return parseInt(d);
                        });
                        
                        tooltip.attr('style', `position: absolute`)
                        .style("left", d3.event.pageX + 10 + "px")
                        .style("top", d3.event.pageY + 15 + "px")
                        .style("border-radius", '4px')
                        .style("color", 'black')
                        .style('z-index', '999')
                        .style("padding", '0.5em')
                        .style('opacity', '1')
                        .style("background-color", 'Snow')
                        .html(`${d.country} (${d[year]}, ${y_dataset.filter(row => {return d.country == row.country})[0][year]})`); 
                    })
                    .on('mouseout', d => {
                        tooltip.style('opacity', '0');
                    }),
    
                    update => update.call(circles => circles.transition(600)
                                                        .style('fill', color_by_region[Region])
                                                        .attr('cx', d => xscale(d[year]))
                                                        .attr('cy', function(d) { return yscale(y_dataset.filter(row => {return d.country == row.country})[0][year]); })),
                    exit => exit.call(circles => circles.transition(800).style("opacity", 0.1).remove())
                );
  
  
    let geo = svg.selectAll('text.geo');                
    geo = geo
            .data(x_dataset.filter(row => {return (year in row) && y_dataset.filter(d => {return (year in d) && 
                (d.country === row.country)})[0] !== undefined}))
            .join(
                enter => enter.append("text")
                .attr('class', 'geo')
                .text(geo_by_country)
                .style('z-index', '2')
                .style('text-anchor', 'middle')
                .attr("dx", d => xscale(d[year]))
                .attr("dy", function(d) { return yscale(y_dataset.filter(row => {return d.country == row.country})[0][year]); })
                .on("mouseover", d=> {
                    var mouse = d3.mouse(circles.node()).map(function(d){
                        return parseInt(d);
                    });
                    
                    tooltip.attr('style', `position: absolute`)
                    .style("left", d3.event.pageX + 10 + "px")
                    .style("top", d3.event.pageY + 15 + "px")
                    .style("border-radius", '4px')
                    .style("color", 'black')
                    .style('z-index', '999')
                    .style("padding", '0.5em')
                    .style('opacity', '1')
                    .style("background-color", 'Snow')
                    .html(`${d.country} (${d[year]}, ${y_dataset.filter(row => {return d.country == row.country})[0][year]})`); 
                })
                .on('mouseout', d => {
                    tooltip.style('opacity', '0');
                }),

                update => update.call(geo => geo.transition(600)
                                                    .text(geo_by_country)
                                                    .attr('dx', d => xscale(d[year]))
                                                    .attr('dy', function(d) { return yscale(y_dataset.filter(row => {return d.country == row.country})[0][year]); })),
                exit => exit.call(geo => geo.transition(800).style("opacity", 0.1).remove())
            );

    const yAxis = d3.axisLeft(yscale).ticks(9, '.0s');
    svg.selectAll('g.axis').remove();

    svg.append("g")
        .attr('class', 'axis')
        .call(yAxis);

    const xAxis = d3.axisBottom(xscale).ticks(12, ".0s");
    svg.append("g")
        .attr('class', 'axis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    
    svg.selectAll('text.axis_text').remove();
    
    
    svg.append('text')
        .text(y_attribute.toString())
        .attr('class', 'axis_text')
        .attr("y", -30)
        .attr("x",0 - (height / 2))
        .style('font-weight', '700')
        .style('font-size', '1em')
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)");


    
    svg.append('text')
        .text(x_attribute.toString())
        .attr('class', 'axis_text')
        .attr("y", height + 40)
        .attr("x", width/2)
        .style('font-size', '1em')
        .style('font-weight', '700')
        .style("text-anchor", "middle")
    
    
    svg.selectAll('text.year').remove();
    svg.append('text')
        .text(year)
        .style("font-size","xxx-large")
        .attr('class', 'year')
        .attr('x', width/2)
        .attr('y', height/2);
}

function run_animation()
{
    if (parseInt(year) < 2100 && pause_or_play == true) {
        year = (parseInt(year) + 1).toString();
        drawScatterplot(year);
        timeout = setTimeout(run_animation, 300);
    }
}

function pause_and_play()
{
    if (pause_or_play)
    {   
        document.getElementById('pause_play').value = 'Play';
        drawScatterplot(year);
        pause_or_play = false;
    }
    else
    {   document.getElementById('pause_play').value = 'Pause';
        pause_or_play = true;
        run_animation();
    }

         
   
}