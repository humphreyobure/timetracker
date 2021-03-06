function json_to_row(json) {
  var row = '<tr class="dataframe">';
  row += '<td class="mdl-data-table__cell--non-numeric">' + json.date + '</td>';
  row += '<td class="mdl-data-table__cell--non-numeric">' + json.start_time + '</td>';
  row += '<td class="mdl-data-table__cell--non-numeric">' + json.task_name + '</td>';
  row += '<td class="mdl-data-table__cell--non-numeric">' + json.category + '</td>';
  row += '<td>' + json.duration + '</td>';
  row += '<td class="mdl-data-table__cell--non-numeric">' + json.end_time + '</td>';
  row += '</tr>';

  return row;
}

$(document).on("keypress", "form", function(event) { 
    return event.keyCode != 13;
});

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function blink(row) {
  var highlight_color = '#fff176';

  row.css('background-color', highlight_color);

  setTimeout(function() {
    row.css('background-color', '');
  }, 1000);
}

function startCounter(startTime) {
  var now = new Date().getTime();
  var distance = now - startTime;
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  var cnt_txt = '';

  if (hours > 0) {
    cnt_txt += pad(hours, 2) + "h ";
  }
  cnt_txt += pad(minutes, 2) + "m " + pad(seconds, 2) + "s";

  $('#counter_value').html(cnt_txt);
  document.title = cnt_txt + " | Time Tracker";
}

function str2date(txt) {
  var date = txt.split(' ')[0];
  var time = txt.split(' ')[1];

  date = date.split('.').map(parseFloat);
  time = time.split(':').map(parseFloat);

  return new Date(date[0], date[1]-1, date[2], time[0], time[1], time[2]);
}

var counter;

$(function(){
  $('#pause_button').click(function(){
  });
});


$(function(){
  $('#task_button').click(function(){
    console.log('Adding task');
    var task_name = $('#task_name').val();
    var task_category = $('#task_category').val();

    if (task_name == "") {
      alert('Task Name has to be specified.');
      return false;
    }

    $.ajax({
      url: '/add',
      data: $('#task_form').serialize(),
      type: 'POST',
      success: function(response) {
        console.log(response);
        var json = JSON.parse(response)[0];
        var row = json_to_row(json);
        $('#tasks_list tbody').prepend(row);
        $('#task_input').hide();  
        $('#counter').show();

        blink($('#tasks_list tbody tr:first'));

        var startTime = new Date().getTime();
        startCounter(startTime);
        counter = setInterval(function() { startCounter(startTime); }, 1000);
      },
      error: function(error) {
        console.log(error);
      }

    });
  });
});