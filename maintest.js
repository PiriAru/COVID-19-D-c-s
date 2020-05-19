d3.selectAll("p").style("color", "blue");

var width = 960,
    height = 500;

var path = d3.geoPath();
console.log(path)

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("stroke", "red")
    .append('path')
    .style('background-color', "#ff0000")
    .attr("d", 'M 0 0 L 100 100')

var url = "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json"
d3.json(url).then(function(topology) {
    console.log("topojson", topology)
    var geojson = topojson.feature(topology, topology.objects.countries);
    console.log("geojson", geojson)

    svg.selectAll("path")
      .data(geojson.features)
      .enter().append("path")
      .attr("d", path);
})
.catch(function(error){
  console.log("bug")
  console.log(error)
})
  