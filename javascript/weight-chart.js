
function updateChart(xmlDoc) {
  var dataArray = new Array();

  weightHighchart.destroy();
  weightHighchart = new Highcharts.chart('weight', weightChart);

  $(xmlDoc).find('list_item').each(function () {
    dataArray.push([
      new Date($(this).find('weight_date').text()).getTime(),
      parseInt($(this).find('weight_lbs').text())
    ]);
  });

  dataArray = dataArray.sort(function (a, b) {
    return a[0] - b[0];
  });

  var min = Infinity;
  var max = -Infinity;

  for (var i = 0; i < dataArray.length; i++) {
    if (dataArray[i][1] > max) {
      max = dataArray[i][1];
    }
    if (dataArray[i][1] < min) {
      min = dataArray[i][1];
    }
  }

  min -= 5;
  max += 5;

  if(dataArray.length > 0){
    var newest = dataArray[dataArray.length - 1][1];
    weightHighchart.setTitle(null, {text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Weight: '+newest+'</span>'});
  } else {
    weightHighchart.setTitle(null, {text: ''});
  }

  weightHighchart.axes[1].setExtremes(min, max);

  weightHighchart.series[0].setData(dataArray);
}

var weightChart = {
  chart: {
    type: 'areaspline',
    style: {
      fontFamily: 'Karla'
    }
  },
  credits: {
    enabled: false
  },
  exporting: {
    enabled: false
  },
  title: {
    useHTML: true,
    align: 'left',
    text: "Weight ",
    style: {
      color: "rgba(82,202,205,1)",
      fontWeight: '700'
    }
  },
  subtitle: {
    useHTML: true,
    align: 'left',
    text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Weight:</span>',

    style: {
      color: "rgba(45,98,112,1)"
    }
  },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: {
      millisecond: '%e. %b',
      month: '%e. %b',
      year: '%Y'
    }
  },
  yAxis: {
    min: 0,
    title: {
      text: '<span style="display:none;">Weight (Pounds)</span>',
      enabled: null
    },
    labels: {
      formatter: function () {
        return this.value + ' lbs.';
      }
    }
  },
  tooltip: {
    xDateFormat: '%e %b %Y',
    pointFormat: '<b>{point.y:,.0f}</b> pounds'
  },
  plotOptions: {
    area: {
      marker: {
        enabled: false,
        symbol: 'circle',
        radius: 2,
        states: {
          hover: {
            enabled: true
          }
        }
      }
    }
  },
  series: [
    {
      color: "rgba(82,202,205,0.75)",
      fillColor: "rgba(82,202,205,0.4)",
      showInLegend: false,
      name: 'Weight',
      data: []
    }
  ],
  lang: {
      noData: "<h2>Looks like you have no weight mesurements.</h2>"
  },
  noData: {
      style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
      }
  }
};

var weightHighchart = Highcharts.chart('weight', weightChart);
