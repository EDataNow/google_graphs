function defaultDrawData(title, vTitle, hTitle) {
  return {
    title: title,
    legend: 'none',
    vAxis: {
      title: vTitle
    },
    hAxis: {
      title: hTitle,
      minValue: 0,
      textStyle: {
        fontSize: 10
      }
    }
  };
}

function firstElementByID(elementId) {
  return $('#' + elementId)[0];
}

function drawSuspectsPerDayChart(data, elementId) {
  var line_data = new google.visualization.DataTable();
  line_data.addColumn('string', I18n.t('javascript_export.date'));
  line_data.addColumn('number', I18n.t('javascript_export.suspects'));

  for(var i=0;i<data.length;i++) {
    var row = [data[i].date, data[i].suspects];
    line_data.addRow(row);
  }

  var trendStartDate = data[0].date;
  var trendEndDate = data[data.length - 1].date;

  var title = (elementId == "trend_chart") ? I18n.t("javascript_export.suspect_trend") :
                     I18n.t("javascript_export.suspects_per_day", {startDate: trendStartDate, endDate: trendEndDate});

  var line_chart = new google.visualization.LineChart(firstElementByID(elementId));
  line_chart.draw(
    line_data,
    $.extend(defaultDrawData(title, I18n.t("javascript_export.quantity_suspect"), I18n.t("javascript_export.day")),
      {
        pointSize: 7,
        hAxis: {
          slantedTextAngle: 90,
          slantedText: true
        }
      }
    )
  );
}

function drawDefectsByDescriptionBarChart(data, elementId) {
  var bar_data = new google.visualization.DataTable();
  bar_data.addColumn('string', I18n.t('javascript_export.suspect_code'));
  bar_data.addColumn('number', I18n.t('javascript_export.quantity'));

  for(var i=0;i<data.length;i++) {
    var row = [ data[i].description.toLowerCase(), data[i].suspects ];
    bar_data.addRow(row);
  }

  var bar_chart = new google.visualization.ColumnChart(firstElementByID(elementId));
  bar_chart.draw(
    bar_data,
    defaultDrawData(I18n.t("javascript_export.quantity_per_suspect_code"), I18n.t("javascript_export.quantity"), I18n.t("javascript_export.suspect_code"))
  );
}

function drawDefectsByDescriptionPeriodColumnChart(data, periodNames, elementId) {
  var bar_data = new google.visualization.DataTable();
  bar_data.addColumn('string', I18n.t('javascript_export.suspect_code'));
  for(var i=0;i<periodNames.length;i++) {
    bar_data.addColumn('number', periodNames[i]);
  }

  for(var j=0;j<data.length;j++) {
    var row = [ data[j].suspect_code.toLowerCase() ].concat(data[j].suspects);
    bar_data.addRow(row);
  }

  var bar_chart = new google.visualization.ColumnChart(firstElementByID(elementId));
  bar_chart.draw(
    bar_data,
    $.extend(defaultDrawData(I18n.t("javascript_export.quantity_per_suspect_code"), I18n.t("javascript_export.quantity"), I18n.t("javascript_export.suspect_code")),
      {
        legend: {
          position: 'right',
        }
      }
    )
  );
}

function getDateTimeWithNoOffset(dateString) {
  var date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

  return date;
}

function drawCompliancePerDay(elementClass) {
  // I18n labels
  var dayLabel = I18n.t("javascript_export.day");
  var complianceLabel = I18n.t("javascript_export.compliance_lc");
  var expectedComplianceLabel = I18n.t("javascript_export.expected_compliance");
  var compliancePercentLabel = I18n.t("javascript_export.compliance_percent");

  elementClass = "." + elementClass;

  var compliancePercents = $(elementClass).next(".daily_breakdown").find(".compliance_percent")
                                          .map(function(){ return $(this).text(); }).get();

  var days = $(elementClass).next(".daily_breakdown").find(".day")
                                          .map(function(){ return getDateTimeWithNoOffset($(this).text()); }).get();

  var dailyData = $(elementClass).next(".daily_breakdown").find(".day").map(function(index){
                                    return {
                                              day: getDateTimeWithNoOffset($(this).text()),
                                              compliance: parseFloat(compliancePercents[index].slice(0,-1))
                                            };
                                  }).get();

  var expectedCompliance = parseFloat($(elementClass).attr("data-expected_compliance"));

  var data = new google.visualization.DataTable();

  data.addColumn("date", dayLabel);
  data.addColumn("number", complianceLabel);
  data.addColumn("number", expectedComplianceLabel);

  if (dailyData.length > 0) {
    dailyData.forEach(function(object) {
      data.addRow([object.day, object.compliance, expectedCompliance]);
    });

    var options = {
      series: {
                1:{
                    pointSize:0,
                    enableInteractivity: false,
                    color: 'green'
                  }
              },
      vAxis: {
        minValue: 0,
        maxValue: 100,
        title: compliancePercentLabel
      },
      hAxis: {
        ticks: days,
        title: dayLabel,
        format: "dd",
        // viewWindow: { max: 31, min: 1},
        // viewWindowMode: 'explicit'
      },
      legend: { position: "top" },
      pointSize: 5,
      trendlines: { 0: { pointSize: 0, color: '#FFDB09'} }
    };

    var lineChart = new google.visualization.LineChart($(elementClass)[0]);
    lineChart.draw(data, options);
  } else {
    $(elementClass).hide();
  }
}

function drawComplianceByMonthZone(elementClass) {
  var compliancePercentLabel = I18n.t("javascript_export.compliance_percent");
  var zoneLabel = I18n.t("zone");

  elementClass = "#" + elementClass;
  var monthData = $(elementClass).next("table").find(".month_data");

  var compliance = monthData.map(function() {
    return {
              zone: $(this).find(".zone").text(),
              compliance: parseFloat($(this).find(".compliance_percent").attr("data-compliance-percent"))
           };
  }).get();

  var data = new google.visualization.DataTable();
  data.addColumn("string", zoneLabel);
  data.addColumn("number", compliancePercentLabel);

  if(compliance.length > 0) {
    compliance.forEach(function(object) {
      data.addRow([object.zone, object.compliance]);
    });

    var barChart = new google.visualization.BarChart($(elementClass)[0]);
    data.sort([{column: 1, desc:true}]);

    var options = {
      hAxis: {
        maxValue: 100,
        title: compliancePercentLabel
      }
    };

    barChart.draw(data, options);
  } else {
    $(elementClass).hide();
  }

}
function drawScheduledQuestionnaireComplianceBarChart(elementClass) {
  elementClass = "." + elementClass;

  var data = $.parseJSON($(elementClass).attr("data-scheduled-compliances"));
  var breakdowns = data.breakdowns;
  var totalScheduled = data.total_scheduled;
  var totalIncomplete = data.total_incomplete;
  var totalComplete = totalScheduled - totalIncomplete;

  var total_completion_compliance = Math.round((totalComplete / totalScheduled) * 100, 2);

  var intervalLabel = I18n.t("javascript_export.interval");
  var scheduledLabel = I18n.t("javascript_export.scheduled");
  var incompleteLabel = I18n.t("javascript_export.incomplete");

  var chartData = new google.visualization.DataTable();

  chartData.addColumn("string", intervalLabel);
  chartData.addColumn("number", incompleteLabel);
  chartData.addColumn("number", scheduledLabel);


  $.each(breakdowns, (function(key, value) {
    chartData.addRow([key, value.incomplete, value.scheduled]);
  }));

  var barChart = new google.visualization.ColumnChart($(elementClass)[0]);

  var legendTitle = I18n.t("javascript_export.completion_compliance_of_percent", {compliance: total_completion_compliance, completed: totalComplete, scheduled: totalScheduled});

  var options = {
    title: legendTitle,
    colors: ['red','green'],
    legend: { position: "top" }
  };

  barChart.draw(chartData, options);
}

function drawCorrectiveActionsCountBarChart(elementClass, optionalTitle) {
  elementClass = "." + elementClass;

  var data = $.parseJSON($(elementClass).attr("data-corrective-action-data"));

  // I18n labels
  var monthLabel = I18n.t("javascript_export.month");
  var openCountLabel = I18n.t("javascript_export.open_count");
  var closedCountLabel = I18n.t("javascript_export.closed_count");
  var notAssignedCountLabel = I18n.t("javascript_export.not_assigned_count");
  var overdueCountLabel = I18n.t("javascript_export.overdue_count");

  var chartData = new google.visualization.DataTable();
  chartData.addColumn("string", monthLabel);
  chartData.addColumn("number", openCountLabel);
  chartData.addColumn("number", closedCountLabel);
  chartData.addColumn("number", notAssignedCountLabel);
  chartData.addColumn("number", overdueCountLabel);

  $.each(data.table, (function(month, monthData) {
    chartData.addRow([month, monthData.open_count, monthData.closed_count,
                      monthData.not_assigned_count, monthData.overdue_count]);
  }));

  var barChart = new google.visualization.ColumnChart($(elementClass)[0]);

  var options = {
    title: optionalTitle,
    colors: ['#FFDB09', 'green', 'grey', 'red'],
    legend: { position: "bottom" }
  };

  barChart.draw(chartData, options);
}

function drawCorrectiveActionsCount(theData, elementClass, optionalTitle) {
  elementClass = "#" + elementClass;

  // I18n labels
  var openCountLabel = "Open Count";
  var closedCountLabel = "Closed Count";
  var notAssignedCountLabel = "Not Assigned Count";
  var overdueCountLabel = "Overdue Count";

  // var openCount = parseInt($(elementClass).attr("data-open-count"), 10);
  // var closedCount = parseInt($(elementClass).attr("data-closed-count"), 10);
  // var notAssignedCount = parseInt($(elementClass).attr("data-not-assigned-count"), 10);
  // var overdueCount = parseInt($(elementClass).attr("data-overdue-count"), 10);

  var data = google.visualization.arrayToDataTable([
      ['Corrective Actions', "Number per Month"],
      [openCountLabel, theData.openCount],
      [closedCountLabel, theData.closedCount],
      [notAssignedCountLabel, theData.notAssignedCount],
      [overdueCountLabel, theData.overdueCount]
    ]);

  var options = {
    title: optionalTitle,
    pieSliceText: 'value',
    colors: ['#FFDB09', 'green', 'grey', 'red'],
    legend: { position: "top" }
  };

  var chart = new google.visualization.PieChart($(elementClass)[0]);
  chart.draw(data, options);
}

function drawCompliancePerQuestionnaire(theData, elementClass) {
  // I18n labels
  var questionnaireLabel = "Questionnaire";
  var complianceLabel = "Compliance";
  var compliancePercentLabel = "Compliance Percent";

  elementClass = "#" + elementClass;
  // var monthData = $(elementClass).next("table").find(".month_data");

  // var compliance = monthData.map(function() {
  //   return {
  //             questionnaire: $(this).find(".questionnaire_name").text(),
  //             compliance: parseFloat($(this).find(".compliance_percent").text().slice(0,-1))
  //          };
  // }).get();

  var data = new google.visualization.DataTable();
  data.addColumn("string", questionnaireLabel);
  data.addColumn("number", complianceLabel);

  if (theData.length > 0) {
    theData.forEach(function(object) {
      data.addRow([object.questionnaire, object.compliance]);
    });

    var barChart = new google.visualization.BarChart($(elementClass)[0]);

    data.sort([{column: 1, desc:true}]);

    var options = {
      hAxis: {
        maxValue: 100,
        title: compliancePercentLabel
      }
    };

    barChart.draw(data, options);
  } else {
    $(elementClass).hide();
  }


}

function drawRangeChart(data, elementClass) {
  var lineData = new google.visualization.DataTable();

  lineData.addColumn('string', "Date");
  lineData.addColumn('number', "Range");

  data.forEach(function(range) {
    var row = [ range.date,
                range.range
    ];
    lineData.addRow(row);

  });

  var element = $('#' + elementClass);

  var lineChart = new google.visualization.LineChart(element[0]);

  lineChart.draw(lineData,
    {
      pointSize: 7,
      width: 870,
      height: 375,
      title: "R-Chart",
      vAxis: {
        title: "Range",
        minValue: 0,
        viewWindow: {
          min: 0,
        }
      },
      hAxis: {
        title: "Date",
        slantedTextAngle: 90,
              slantedText: true,
              textStyle: {
                  fontSize: 10
              }
      }
    });

}

function drawLineChart(data, element) {
  var line_data = new google.visualization.DataTable();
  line_data.addColumn('string', 'hour');
  line_data.addColumn('number', 'inspected');
  line_data.addRows(data.length);
  var col = 0;

  for (var i = 0; i < data.length; i++) {
    line_data.setValue(col, 0, data[i].date);
    line_data.setValue(col, 1, data[i].parts_inspected);
    col++;
  }

  var line_chart = new google.visualization.LineChart(document.getElementById(element));
  line_chart.draw(
    line_data,
    {
      pointSize: 7,
      title: 'Line Chart',
      legend: 'none',
      vAxis: {
        title: "Parts Inspected"
      },
      hAxis: {
        title: 'Hour',
        minValue: 0,
        slantedTextAngle: 90,
        slantedText: true,
        textStyle: {
          fontSize: 12
        }
      }
    }
  );
}

function drawObservationsByShiftChart(data, element_id){
  var line_data = new google.visualization.DataTable();
  line_data.addColumn('string', "Date");
  line_data.addColumn('number', "Observation");
  line_data.addColumn('number', data[0].spec_max.toString() + " " + "Spec Max");
  line_data.addColumn('number', data[0].ucl.toString() + " " + "UCL");
  line_data.addColumn('number', data[0].nominal.toString() + " " + "Nominal");
  line_data.addColumn('number', data[0].lcl.toString() + " " + "LCL");
  line_data.addColumn('number', data[0].spec_min.toString() + " " + "Spec Min");

  var limit = [null, null, data[0].spec_max, data[0].ucl, data[0].nominal, data[0].lcl, data[0].spec_min];

  line_data.addRow(limit);

  for(var i=0;i<data.length;i++) {
      var row = [
                  data[i].date,
                  data[i].observation,
                  data[i].spec_max,
                  data[i].ucl,
                  data[i].nominal,
                  data[i].lcl,
                  data[i].spec_min
                ];
      line_data.addRow(row);
  }

  line_data.addRow(limit);

  var element = $('#' + element_id);

  var line_chart = new google.visualization.LineChart(element[0]);
  line_chart.draw(
      line_data,
      {
          series: {
                    1:{
                        pointSize:0,
                        enableInteractivity: false,
                        color: 'red'
                      },
                    2:{
                        pointSize:0,
                        enableInteractivity: false,
                        color: '#EEC900'
                      },
                    3:{
                        pointSize:0,
                        enableInteractivity: false,
                        color: 'green'
                      },
                    4:{
                        pointSize:0,
                        enableInteractivity: false,
                        color: '#EEC900'
                      },
                    5:{
                        pointSize:0,
                        enableInteractivity: false,
                        color: 'red'
                      }
                  },
          pointSize: 7,
          width: 870,
          height: 375,
          title: "Control Chart",
          vAxis: {
              title: "Observation",
          },
          hAxis: {
              gridlines: {color: '#333', count: 4},
              title: "Date",
              minValue: 0,
              slantedTextAngle: 90,
              slantedText: true,
              textStyle: {
                  fontSize: 10
              }
          }
      }
  );
}
