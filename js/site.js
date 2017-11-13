function generateringComponent(vardata, vargeodata){

  var lookup = genLookup(vargeodata) ;
  var cmrMap = dc.leafletChoroplethChart('#Map');
  var ue_trend = dc.compositeChart('#sector');
  var whoChart = dc.rowChart('#who');
  var whatChart = dc.rowChart('#what');
  var whenChart = dc.rowChart("#when");
  var cf = crossfilter(vardata) ;
  var all = cf.groupAll();
  var mapDimension = cf.dimension(function(d) { return d.rowcacode1});
  var mapGroup = mapDimension.group().reduceSum(function(d){ return d.approved});
  var allocDim = cf.dimension(function(d) {
    return d.allocation
  });
  
//begin test
  var scale_maxDate = new Date(2016, 3, 10);
  var numberFormat = d3.format(',f');
  var dateFormat = d3.time.format("%Y-%m-%d");
  var dateFormatPretty = d3.time.format("%d %b %Y");
  var dateFormatPretty1 = d3.time.format("%Y");
  function formatDate(value) {
   var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   return monthNames[value.getMonth()] + " " + value.getDate();
};
    vardata.forEach(function (e) {
        e.date = dateFormat.parse(e.date);
    });

var colors = ['#FAE61E','#03a9f4','#E67800','#C80000','#E6E6FA', '#023858', '#a6bddb','#3690c0'] ;
  
var dateDimension = cf.dimension(function (d) { return d.date;});
var allocationGroup1 = cf.dimension(function(d) {return d.allocation ==="RR"});
var allocationGroup2 = cf.dimension(function(d) {return d.allocation ==="UFE"});
var groupApproved_ufe = dateDimension.group().reduceSum(function (d){
 if (d.allocation !="RR")  return d.approved/1000000; else {return 0;}} );

function remove_values(groupApproved_ufe) { 
  return {
    all: function() {
        return groupApproved_ufe.all().filter(function(d) {
      
        return d.value!==0;
      });
    }
  };
}
var appGroup = remove_values(groupApproved_ufe);

var groupApproved_rr = dateDimension.group().reduceSum(function (d){ if (d.allocation!="UFE") return d.approved/1000000; else {return 0;}});
function remove_value(groupApproved_rr) { 
  return {
    all: function() {
      return groupApproved_rr.all().filter(function(d) {
      
        return d.value!==0;
      });
    }
  };
}
var appGroup2 = remove_value(groupApproved_rr);

  var sectorDimension = cf.dimension(function (d){return d.sector});
  var sectorGroup = sectorDimension.group();
  var whatDimension = cf.dimension(function (d){return d.Agency});
  var whenDimension = cf.dimension(function(d){return d.Year});
  var whatGroup = whatDimension.group();
  var whenGroup = whenDimension.group();

// compositeChart
        ue_trend.width(500)
                .height(300)
                //.transitionDuration(1000)
                .margins({top: 30, right: 50, bottom: 25, left: 60})
                .dimension(dateDimension)
                .valueAccessor(function (d) {
                                return d.value!=0;
                 })
               // .mouseZoomable(true)
                .shareTitle(false)
                .x(d3.time.scale().domain([new Date(2008, 0, 1), new Date(2017, 11, 31)]))
                //.round(d3.time.month.round)
                //.xUnits(d3.time.months)
                .elasticY(true)
               // .renderHorizontalGridLines(true)
                .legend(dc.legend().x(80).y(10).itemHeight(13).gap(5))
                .brushOn(false)
                .compose([
                    dc.lineChart(ue_trend)
                            .group(appGroup, "UFE")
                            .title(function (d) {return [' Date de déboursement : '+  dateFormatPretty(d.key),  "Financement UFE: " + numberFormat(d.value) + ' Million US $'].join('\n'); })
                            /*.valueAccessor(function (d) {
                                return d.value.avg;
                            })*/,
                 dc.lineChart(ue_trend)
                    .group(appGroup2, "RR")
                    .title(function (d) { return [' Date de déboursement : '+dateFormatPretty(d.key),  "Financement RR: " + numberFormat(d.value) + ' Million US $'].join('\n'); })
                            /*.valueAccessor(function (d) {
                                return d.value.avg;
                            })*/
                            /*.title(function (d) {
                                var value = d.value.avg ? d.value.avg : d.value;
                                if (isNaN(value)) value = 0;
                                return dateFormatPretty1(d.key) + "\n" + numberFormat(value);
                            })*/
                    .ordinalColors(["orange"])
                    .useRightYAxis(true)
                ])
                
                .yAxisLabel("Financement UFE")
                .rightYAxisLabel("Financement RR")
                .renderHorizontalGridLines(true);
    ue_trend.yAxis().tickFormat(d3.format(',2f'));
//sector rowChart
whoChart.width(500).height(300)
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
whatChart.width(500).height(300)
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
  whenChart.width($('when').width()).height(300)
           .dimension(whenDimension)
            .group(whenGroup)
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
       cmrMap.width(500)
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
