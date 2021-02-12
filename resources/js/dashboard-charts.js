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
    document.getElementById('weightEmpty').style.display = 'none';
    document.getElementById('weight').style.display = 'inherit';
    document.getElementById('weight').style.visibility = 'inherit';
    var newest = dataArray[dataArray.length - 1][1];
    weightHighchart.setTitle(null, {text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Weight: '+newest+'</span>'});
  } else {
    document.getElementById('weightEmpty').style.display = 'inherit';
    document.getElementById('weight').style.display = 'none';
    document.getElementById('weight').style.visibility = 'hidden';
    weightHighchart.setTitle(null, {text: ''});
  }

  weightHighchart.axes[1].setExtremes(min, max);

  weightHighchart.series[0].setData(dataArray);
}

function updateBloodChart(xmlDoc) {
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
    document.getElementById('bloodEmpty').style.display = 'none';
    document.getElementById('blood').style.display = 'inherit';
    document.getElementById('blood').style.visibility = 'inherit';
    var newest = systolicArray[systolicArray.length - 1][1] + '/' + diastolicArray[diastolicArray.length - 1][1];
    bloodHighchart.setTitle(null, {text: '<span style="font-size: 10px; margin-bottom: 5px;">Most Recent Blood Pressure: '+newest+'</span>'});
  }else{
    document.getElementById('bloodEmpty').style.display = 'inherit';
    document.getElementById('blood').style.display = 'none';
    document.getElementById('blood').style.visibility = 'hidden';
    bloodHighchart.setTitle(null, {text: ''});
  }

  bloodHighchart.axes[1].setExtremes(min, max);

  bloodHighchart.series[0].setData(systolicArray);
  bloodHighchart.series[1].setData(diastolicArray);
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
    text: "<a href='#!weight'>Weight</a> ",
    style: {
      color: "rgba(82,202,205,1)"
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
      // style: {
      //     fontWeight: 'bold',
      //     fontSize: '15px',
      //     color: '#303030'
      // }
  }
};

var weightHighchart = Highcharts.chart('weight', weightChart);

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
    useHTML: true,
    text: "<a href='#!bloodpressure'>Blood Pressure</a> ",
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
