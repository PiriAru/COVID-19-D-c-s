
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

  
    // Créer l'élément SVG et le configurer
    const svg = d3.select('.main')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'font: 10px sans-serif')
});
