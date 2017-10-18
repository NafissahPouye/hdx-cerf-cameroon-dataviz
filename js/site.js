function generateringComponent(vardata, vargeodata){

  var lookup = genLookup(vargeodata) ;
  var cmrMap = dc.leafletChoroplethChart('#Map');
  var ue_trend = dc.compositeChart('#agency');
  var rr_trend = dc.compositeChart('#sector');
  var whoChart = dc.rowChart('#who');
  var whatChart = dc.rowChart('#what');
  var cf = crossfilter(vardata) ;
  var all = cf.groupAll();
  var mapDimension = cf.dimension(function(d) { return d.rowcacode1});
  var mapGroup = mapDimension.group().reduceSum(function(d){ return d.approved});
  var allocDim = cf.dimension(function(d) {
    return d.allocation
  });

  //console.log(crossfilter(allocDim.filter("RR")));

  //begin test
  var scale_maxDate = new Date(2016, 3, 10);
  var numberFormat = d3.format(',f');
  var dateFormat = d3.time.format("%Y-%m-%d");
  var dateFormatPretty = d3.time.format("%b %Y");
  var dateFormatPretty1 = d3.time.format("%Y");
  function formatDate(value) {
   var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   return monthNames[value.getMonth()] + " " + value.getDate();
};
    vardata.forEach(function (e) {
        e.date = dateFormat.parse(e.date);
    });

var colors = ['#FAE61E','#03a9f4','#E67800','#C80000','#E6E6FA', '#023858', '#a6bddb','#3690c0'] ;
  
var dateDimension = cf.dimension(function (d) { return d.Year;});
console.log(dateDimension);

var groupApproved_ufe = dateDimension.group().reduceSum(function (d){return d.approved/1000000;});
function remove_space(groupApproved_rr) { 
  return {
    all: function() {
      
      return groupApproved_rr.all().filter(function(d) {
        console.log(d)
        return d.value != "";
      });
    }
  };
}

var groupApproved_rr = dateDimension.group().reduceSum(function (d){ return d.approved_rr/1000000;});

  var sectorDimension = cf.dimension(function (d){return d.sector});
  var sectorGroup = sectorDimension.group();
  var whatDimension = cf.dimension(function (d){return d.Agency});
  var whatGroup = whatDimension.group();
    // compositeChart
     ue_trend.width(350)
               .height(370)
               .dimension(dateDimension)
               .x(d3.scale.linear().domain([2008, 2017]))
               //.x(d3.time.scale().domain([new Date(2005, 11, 0), new Date(2018, 3, 31)]))
               .legend(dc.legend().x($('#agency').width()-5).y(0).gap(3))
               .shareTitle(false)
               .valueAccessor(function(d){return d.key != "";})
               .compose([
                 dc.lineChart(ue_trend).group(groupApproved_ufe, "UFE").colors(colors[1]).title(function (p) {
                   return ["Année         : " + p.key , "Financement UFE : " + numberFormat(p.value) + "k" ].join('\n'); }),/*.renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 0.8}),*/
              
                 
                  ])
               .label(function (p) { return p.key; })
               /*.title(function (d) {
                   return ["Année      : " + d.key , "Biomasse : " + d.value + " k" ].join('\n'); })*/
               .margins({top: 10, right: 13, bottom: 80, left: 30})
               .brushOn(false)
              // .renderTitle(true)
               .elasticX(false)
               .elasticY(true)
               .colorAccessor(function(d,i){ return 0;});
               ue_trend.xAxis().tickFormat(d3.format("d"));
              /* .renderlet(function (chart) {
                    chart.selectAll("g.x text")
                      .attr('dx', '-12')
                      .attr('transform', "rotate(-60)");
                });*/
 rr_trend.width(350)
               .height(370)
               .dimension(dateDimension)
               .x(d3.scale.linear().domain([2008, 2017]))
               //.x(d3.time.scale().domain([new Date(2005, 11, 0), new Date(2018, 3, 31)]))
               .legend(dc.legend().x($('#sector').width()-5).y(0).gap(3))
               .shareTitle(false)
               .valueAccessor(function(d){return d.key != "";})
               .compose([
                 dc.lineChart(rr_trend).group(groupApproved_rr, "RR").colors(colors[1]).title(function (p) {
                   return ["Année      : " + p.key , "Financement RR : " + numberFormat(p.value) + "M" ].join('\n'); }),/*.renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 0.8}),*/
              
                 
                  ])
               .label(function (p) { return p.key; })
               /*.title(function (d) {
                   return ["Année      : " + d.key , "Biomasse : " + d.value + " k" ].join('\n'); })*/
               .margins({top: 10, right: 13, bottom: 80, left: 30})
               .brushOn(false)
              // .renderTitle(true)
               .elasticX(true)
               .elasticY(false)
               .colorAccessor(function(d,i){ return 0;});
        rr_trend.xAxis().tickFormat(d3.format("d"));
//sector rowChart
whoChart.width($('sector').width()).height(300)
            .dimension(sectorDimension)
            .group(sectorGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(15);
            })
            .labelOffsetY(13)
            .colors(colors[1])
            .colorAccessor(function(d, i){return 0;})
           // .xAxis().ticks(5);
whatChart.width($('sector').width()).height(300)
            .dimension(whatDimension)
            .group(whatGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(15);
            })
            .labelOffsetY(13)
            .colors(colors[1])
            .colorAccessor(function(d, i){return 0;})
            //.xAxis().ticks(5);

  //end test

dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);

         cmrMap.width(400)
             .height(400)
             .dimension(mapDimension)
             .group(mapGroup)
             .label(function (p) { return p.key; })
             .renderTitle(true)
             .center([0,0])
             .zoom(0)
             .geojson(vargeodata)
             .colors(['#CCCCCC','#03a9f4'])
             .colorDomain([0,1])
             .colorAccessor(function (d){

               if (d>0) {

                 return 1;

               } else {

                 return 0;

               }

             })

               .featureKeyAccessor(function (feature){
               return feature.properties['rowcacode1'];
             }).popup(function (d){
               return d.properties['ADM1_NAME'];
             })
             .renderPopup(true)
             .featureOptions({
                'fillColor': 'gray',
                'color': 'gray',
                'opacity':0.8,
                'fillOpacity': 0.1,
                'weight': 1
            });

      dc.renderAll();

      var map = cmrMap.map({ 
        
      });

      zoomToGeom(vargeodata);
      function zoomToGeom(geodata){
        var bounds = d3.geo.bounds(geodata) ;
        map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]])
            /*.setZoom(5)
            .setView([9, 10.37], 4);*/
      }
        

      function genLookup(geojson) {
        var lookup = {} ;
        geojson.features.forEach(function (e) {
          lookup[e.properties['rowcacode1']] = String(e.properties['ADM1_NAME']);
        });
        return lookup ;
      }
}

var dataCall = $.ajax({
    type: 'GET',
    url: 'data/data.json',
    dataType: 'json',
});

var geomCall = $.ajax({
    type: 'GET',
    url: 'data/cmr.geojson',
    dataType: 'json',
});


$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = geomArgs[0];
    geom.features.forEach(function(e){
        e.properties['rowcacode1'] = String(e.properties['rowcacode1']);
    });
    generateringComponent(dataArgs[0],geom);
});
