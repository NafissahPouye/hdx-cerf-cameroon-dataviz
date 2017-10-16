function generateringComponent(vardata, vargeodata){

  var lookup = genLookup(vargeodata) ;
  var cmrMap = dc.leafletChoroplethChart('#Map');
  var ue_trend = dc.compositeChart('#agency');
  var sectors = dc.rowChart('#sector');
  var cf = crossfilter(vardata) ;
  var all = cf.groupAll();
  var mapDimension = cf.dimension(function(d) { return d.rowcacode1});
  var mapGroup = mapDimension.group().reduceSum(function(d){ return d.approved});
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

var colors = ['#FAE61E','#FAE61E','#E67800','#C80000','#E6E6FA', '#023858', '#a6bddb','#3690c0'] ;
  
var dateDimension = cf.dimension(function (d) { return d.date});

  var groupApproved = dateDimension.group().reduceSum(function (d){

    if(isNaN(d.approved)){console.log('Not included: ');console.log(d);return 0;} else {return d.approved / 1000;}

  });
  var sectorDimension = cf.dimension(function (d){return d.sector});
  var sectorGroup = sectorDimension.group();
  ue_trend
            .width(300)
            .height(230)
            .dimension(dateDimension)
            .x(d3.time.scale().domain([new Date(2013, 11, 0), new Date(2017, 3, 31)]))
            .elasticY(true)
            .legend(dc.legend().x($('#Requirement').width()-150).y(0).gap(3))
            .valueAccessor(function(d){return d.value.avg != "";})
            .shareTitle(false)
            //.omit("")
            .compose([
                dc.lineChart(ue_trend).group(groupApproved, 'Approved UE funding').colors(colors[5]).title(function (d) { return [dateFormatPretty1(d.key),  "Food Sec Req: " + numberFormat(d.value) + ' Million US $'].join('\n'); }),
               // dc.lineChart(req_trends).group(groupFundings, 'Funding').colors(colors[6]).title(function (d) { return [dateFormatPretty1(d.key), "Funding: " + numberFormat(d.value) + ' Million US $'].join('\n'); }),
              ])
            .margins({top: 20, right: 0, bottom: 30, left: 60})
            .brushOn(false)
            .renderHorizontalGridLines(true)
            .renderTitle(true)
            .xAxisLabel("Date")
            .xAxis().ticks(3)
            ue_trend.yAxis().tickFormat(function (v) {
            return v + 'M';
        });

//sector rowChart
sectors.width($('sector').width()).height(400)
            .dimension(sectorDimension)
            .group(sectorGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(15);
            })
            .labelOffsetY(13)
            .colors(colors[4])
            .colorAccessor(function(d, i){return 0;})
            .xAxis().ticks(5);

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
             .colors(['#DDDDDD','#FFC8BF','#F59181', '#FE5A43', '#921301', '#620D00'])
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
