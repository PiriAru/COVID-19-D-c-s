//initialize today's date
$(document).ready( function() {
    $('#selectedDate').val(new Date().toLocaleDateString().substr(0, 10))
})
//When user changes date, map content and legend are removed
    $("#selectedDate").change(function() {
    $("#map").empty()
    $("#legend").empty()
    initMap()
})

data = {}

function initMap() {
    d3.csv('deces.csv', dataset => {
        data.dataset = dataset
    console.log(dataset)

        var margin = {top: 75, left: 50, right: 50, bottom: 0},
            height = 450 - margin.top - margin.bottom,
            width = 700 - margin.left - margin.right;
        console.log(height)
        console.log(width)

        var svg = d3.select("#map")
            .append("svg")
            .attr("height", height + margin.top + margin.bottom)
            .attr("width", width + margin.left + margin.right)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.queue()
            .defer(d3.json, "cartedumonde.topojson")
            .defer(d3.csv, "population1.csv")
            .await(ready)

        var projection = d3.geoMercator()
            .translate([width / 2, height / 2 + 50])
            .scale(100);

        var path = d3.geoPath()
            .projection(projection);

        function ready(error, topoData, populationData) {
            var countries = topojson.feature(topoData, topoData.objects.countries).features;
            console.log(topojson.feature(topoData, topoData.objects.countries))

            // Findind matches for population data, injecting them into main dataset
            data.dataset.forEach(d => {
                const match = populationData.find(e => e.name === d['Country/Region']);
                if (match) {
                    d.population = (match.population);
                } else {
                    console.warn('Could not find population data for ' + d['Country/Region']);
                }
            })

            max_date = $('#selectedDate').val() // Uses the user's input
            // Transform date from input format to data's format 
            max_date = +max_date.substr(5, 2) + '/' + +max_date.substr(8, 2) + '/' +max_date.substr(2, 2)
            console.log(max_date)

            displayCountries(svg, path, countries, max_date)
            updateCountriesColor(svg, path, countries, max_date)
        }
    })
}

// First initialization
initMap()

function hslToHex(h, s, l) {
    h /= 360;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


/**
 * Display countries given topojson data and infected people data
 * @param svg to display the map on
 * @param path projection world map (such as Mercator)
 * @param countries topojson data
 * @param dataset infected people data
 * @param date
 */
function displayCountries(svg, path, countries, max_date) {
    const max = d3.max(data.dataset, d => parseInt(d[max_date]));
    const logMax = Math.log2(max)

    var colorScale = d3.scaleLinear()
        .domain([0, 100])
        .range(['#FFFFFF', '#FF0000', '#000000']);

    // append a defs (for definition) element to your SVG
    var svgLegend = d3.select('#legend').append('svg')
        .attr("width", 900);
    var defs = svgLegend.append('defs');

    // append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append('linearGradient')
        .attr('id', 'linear-gradient');

    // horizontal gradient
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    // append multiple color stops by using D3's data/enter step
    linearGradient.selectAll("stop")
        .data([
            {offset: "0%", color: "#FFFFFF"},
            {offset: "50%", color: "#FF0000"},
            {offset: "100%", color: "#000000"}
        ])
        .enter().append("stop")
        .attr("offset", function (d) {
            return d.offset;
        })
        .attr("stop-color", function (d) {
            return d.color;
        });

    // append title
    svgLegend.append("text")
        .attr("class", "legendTitle")
        .attr("x", 0)
        .attr("y", 20)
        .style("text-anchor", "left")
        .text("Légende :");

    // draw the rectangle and fill with gradient
    svgLegend.append("rect")
        .attr("x", 10)
        .attr("y", 30)
        .attr("width", 791)
        .attr("height", 15)
        .style("fill", "url(#linear-gradient)");

    //create tick marks
    var xLeg = d3.scaleLog()
        .domain([0, max])
        .range([10, 800]) // This is where the axis is placed: from 10 px to 400px
        .base(2)


    var axisLeg = d3.axisBottom(xLeg)
        .tickFormat(d3.format(".2s"))

    svgLegend
        .attr("class", "axis")
        .append("g")
        .attr("transform", "translate(0, 40)")
        .call(axisLeg);

    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("stroke-width", 0.3)
        .attr("stroke", "black")
        .attr("d", path)

	updateCountriesColor(svg, path, countries, max_date)
}

function updateCountriesColor(svg, path, countries, max_date) {
    const max = d3.max(data.dataset, d => parseInt(d[max_date]));
    const logMax = Math.log2(max)

    svg.selectAll(".country")
        .attr("fill", (d, _) => {
            const name = d.properties.name
            const match = data.dataset.filter(row => row['Country/Region'] === name)
            if (match.length > 0) {
                const logInfected = Math.log2(parseInt(match[0][max_date]))
                return hslToHex(0, 1, 1 - logInfected / logMax)
            } else {
                return hslToHex(180, 1, 50)
            }
        })

}
