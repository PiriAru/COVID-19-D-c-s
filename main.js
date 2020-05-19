// Paramètres de la visualisation
const width = 1600;
const height = 300;
const margin = { top: 20, right: 0, bottom: 20, left: 20 };

d3.dsv(',','data/WHO-COVID-19-global-data.csv', function (d) {
    return {
        annee: d.day.substr(0,3),
        mois: d.day.substr(5,6),
        jour: d.day.substr(8,9),
        code_pays: d.Country,
        pays: d.CountryName,
        region: d.Region,
        cas_conf: parseInt(d.Confirmed),
        cas_conf_cumul: parseInt(d.CumulativeConfirmed),
        morts: parseInt(d.Deaths),
        morts_cumul: parseInt(d.CumulativeDeaths),

    }
}).then(function(data) {

    const code_pays = data.filter(d => d.code_pays === 'CH');
  
    // Créer l'élément SVG et le configurer
    const svg = d3.select('.main')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'font: 10px sans-serif')

    // Créer l'échelle horizontale (fonctions D3)
    const x = d3.scaleBand()
    .domain(code_pays.map(d => d.jour))
    .range([margin.left, width - margin.right])
    .padding(0.1)
    .round(true)

    // Créer l'échelle verticale (fonctions D3)
    const y = d3.scaleLinear()
    .domain([0, d3.max(code_pays, d => d.cas_conf)])
    .range([height - margin.bottom - 5, margin.top])
    .interpolate(d3.interpolateRound)

    const teinte = d3.scaleSequential()
    .domain([0, d3.max(code_pays, d => d.cas_conf)])
    .interpolator(d3.interpolateBlues)

    // Ajouter les barres
    svg.append('g')
    .selectAll('rect')
    .data(code_pays)
    .enter()
    .append('rect')
    .attr('width', x.bandwidth())
    .attr('height', d => y(0) - y(d.cas_conf))
    .attr('x', d => x(d.jour))
    .attr('y', d => y(d.cas_conf))
    .style('fill', d => teinte(d.cas_conf))

    // Ajouter les titres
    svg.append('g')
    .style('fill', 'white')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${x.bandwidth() / 2}, 6)`)
    .selectAll('text')
    .data(code_pays)
    .enter()
    .append('text')
    .attr('dy', '0.35em')
    .attr('x', d => x(d.jour))
    .attr('y', d => y(d.cas_conf))
    .text(d => d.cas_conf)

    // Ajouter l'axe horizontal
    svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .call(g => g.select('.domain').remove())

    // Ajouter l'axe vertical
    svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select('.domain').remove())
});
