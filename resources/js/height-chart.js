
function updateChart(xmlDoc) {
  var dataArray = new Array();

  heightHighchart.destroy();
  heightHighchart = new Highcharts.chart('height', heightChart);

  $(xmlDoc).find('list_item').each(function () {
    dataArray.push([
      new Date($(this).find('height_date').text()).getTime(),
      (+($(this).find('height_ft').text()) * 12) + parseInt($(this).find('height_in').text())
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
    heightHighchart.setTitle(null, {text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Height: '+(Math.floor(newest / 12) + '\'') + ((newest % 12) + '"')+'</span>'});
  } else {
    heightHighchart.setTitle(null, {text: ''});
  }

  heightHighchart.axes[1].setExtremes(min, max);

  heightHighchart.series[0].setData(dataArray);
}

var heightChart = {
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
    text: "Height ",
    style: {
      color: "rgba(153,193,61,1)"
    }
  },
  subtitle: {
    useHTML: true,
    align: 'left',
    text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Height:</span>',

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
      text: '<span style="display:none;">Height</span>',
      enabled: null
    },
    labels: {
      formatter: function () {
        return (Math.floor(this.value / 12) + '\'') + ((this.value % 12) + '"');
      }
    }
  },
  tooltip: {
    xDateFormat: '%e %b %Y',
    pointFormatter: function() {
      return (Math.floor(this.y / 12) + '\'') + ((this.y % 12) + '"');
    }
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
      color: "rgba(153,193,61,0.75)",
      fillColor: "rgba(153,193,61,0.4)",
      showInLegend: false,
      name: 'Weight',
      data: []
    }
  ],
  lang: {
      noData: "No height measurements. Why not add one?"
  },
  noData: {
      style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
      }
  }
};

var heightHighchart = Highcharts.chart('height', heightChart);
