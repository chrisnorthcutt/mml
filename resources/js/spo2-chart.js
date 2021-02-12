
function updateChart(xmlDoc) {
  var dataArray = new Array();

  spo2HighChart.destroy();
  spo2HighChart = new Highcharts.chart('spo2', spo2Chart);

  $(xmlDoc).find('list_item').each(function () {
    dataArray.push([
      new Date($(this).find('spo2_date').text()).getTime(),
      parseInt($(this).find('spo2').text())
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
    spo2HighChart.setTitle(null, {text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Measurement: '+newest+'%</span>'});
  } else {
    spo2HighChart.setTitle(null, {text: ''});
  }

  spo2HighChart.axes[1].setExtremes(min, max);

  spo2HighChart.series[0].setData(dataArray);
}

var spo2Chart = {
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
    text: "SpO<sub>2</sub> ",
    style: {
      color: "rgba(240,84,82,1)"
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
      text: '<span style="display:none;">SpO2</span>',
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
    pointFormat: '<b>{point.y:,.0f}</b>%'
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
      color: "rgba(240,84,82,0.75)",
      fillColor: "rgba(240,84,82,0.4)",
      showInLegend: false,
      name: 'SpO2',
      data: []
    }
  ],
  lang: {
      noData: "No SpO2 measurements. Why not add one?"
  },
  noData: {
      style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
      }
  }
};

var spo2HighChart = Highcharts.chart('spo2', spo2Chart);
