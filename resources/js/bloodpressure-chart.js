function updateChart(xmlDoc) {
  var systolicArray = new Array();
  var diastolicArray = new Array();

  bloodHighchart.destroy();
  bloodHighchart = new Highcharts.chart('blood', bloodChart);

  $(xmlDoc).find('list_item').each(function () {
    var logDate = new Date($(this).find('bp_date').text()).getTime();
    systolicArray.push([
      logDate,
      parseInt($(this).find('systolic').text())
    ]);
    diastolicArray.push([
      logDate,
      parseInt($(this).find('diastolic').text())
    ]);
  });

  systolicArray = systolicArray.sort(function (a, b) {
    return a[0] - b[0];
  });

  diastolicArray = diastolicArray.sort(function (a, b) {
    return a[0] - b[0];
  });

  var min = Infinity;
  var max = -Infinity;

  for (var i = 0; i < systolicArray.length; i++) {
    if (systolicArray[i][1] > max) {
      max = systolicArray[i][1];
    }
    if (systolicArray[i][1] < min) {
      min = systolicArray[i][1];
    }
  }

  for (var i = 0; i < diastolicArray.length; i++) {
    if (diastolicArray[i][1] > max) {
      max = diastolicArray[i][1];
    }
    if (diastolicArray[i][1] < min) {
      min = diastolicArray[i][1];
    }
  }

  min -= 5;
  max += 5;

  if(systolicArray.length > 0){
    var newest = systolicArray[systolicArray.length - 1][1] + '/' + diastolicArray[diastolicArray.length - 1][1];
    bloodHighchart.setTitle(null, {text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Blood Pressure: '+newest+'</span>'});
  }else{
    bloodHighchart.setTitle(null, {text: ''});
  }

  bloodHighchart.axes[1].setExtremes(min, max);

  bloodHighchart.series[0].setData(systolicArray);
  bloodHighchart.series[1].setData(diastolicArray);
}

var bloodChart = {
  chart: {
    type: 'spline',
    style: {
      fontFamily: 'Karla'
    }
  },
  credits: {
    enabled: false
  },
  title: {
    text: 'Blood Pressure',
    align: 'left',
    style: {
      color: '#F05452'
    }
  },
  subtitle: {
    useHTML: true,
    text: '<span style="font-size: 10px">Most Recent Blood Pressure:</span>',
    align: 'left',
    style: {
      color: '#2D6170'
    }
  },
  exporting: {
    enabled: false
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
      text: '<span style="display:none;">Pressure (mmHg)</span>'
    },
    labels: {
      formatter: function () {
        return this.value + ' mmHg';
      }
    }
  },
  tooltip: {
    xDateFormat: '%e %b %Y',
    headerFormat: '<span style="font-size: 10px">{point.key} - {series.name}</span><br />',
    pointFormat: '<b>{point.y:,.0f}</b> mmHg'
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
      showInLegend: false,
      name: 'Systolic',
      data: []
    }, {
      color: "#F06967",
      showInLegend: false,
      name: 'Diastolic',
      data: []
    }
  ],
  lang: {
      noData: "No blood pressure measurements. Why not add one?"
  },
  noData: {
      style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
      }
  }
};

var bloodHighchart = Highcharts.chart('blood', bloodChart);
