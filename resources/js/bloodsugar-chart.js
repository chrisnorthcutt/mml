
function updateChart(xmlDoc) {
  var dataArray = new Array();

  bloodSugarHighChart.destroy();
  bloodSugarHighChart = new Highcharts.chart('bloodsugar', bloodSugarChart);

  $(xmlDoc).find('list_item').each(function () {
    dataArray.push([
      new Date($(this).find('bs_date').text()).getTime(),
      parseInt($(this).find('blood_sugar').text())
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
    bloodSugarHighChart.setTitle(null, {text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Measurement: '+newest+'mg/dL</span>'});
  } else {
    bloodSugarHighChart.setTitle(null, {text: ''});
  }

  bloodSugarHighChart.axes[1].setExtremes(min, max);

  bloodSugarHighChart.series[0].setData(dataArray);
}

var bloodSugarChart = {
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
    text: "Blood Sugar ",
    style: {
      color: "rgba(240,57,111,1)"
    }
  },
  subtitle: {
    useHTML: true,
    align: 'left',
    text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Measurement:</span>',

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
      text: '<span style="display:none;">Blood Sugar</span>',
      enabled: null
    },
    labels: {
      formatter: function () {
        return this.value;
      }
    }
  },
  tooltip: {
    xDateFormat: '%e %b %Y',
    pointFormat: '<b>{point.y:,.0f}</b> mg/dL'
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
      color: "rgba(240,57,111,0.75)",
      fillColor: "rgba(240,57,111,0.4)",
      showInLegend: false,
      name: 'Blood Sugar',
      data: []
    }
  ],
  lang: {
      noData: "No blood sugar measurements. Why not add one?"
  },
  noData: {
      style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
      }
  }
};

var bloodSugarHighChart = Highcharts.chart('bloodsugar', bloodSugarChart);
