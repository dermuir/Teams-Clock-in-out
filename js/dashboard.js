$("contents");
(function($)
{
     $(function(){
      $('#weekdays').weekdays({
    selectedIndexes: [0,1,2,3,4]
    });
    });

    ipcRenderer.send('request-data',true);
    ipcRenderer.on('response-data', (event, arg) => {
          $("#time-in").val(arg.timein)
          $("#time-out").val(arg.timeout);
          $("#clock-in").text(arg.clockin);
          $("#clock-out").text(arg.clockout);
          $("#week-clock").text(arg.lastclocks);
          $("#week-hours").text(arg.weekhours);
          $("#month-hours").text(arg.monthhours);
          $("#errors").text(arg.errors);
    });
    $('av').on('click',function(){
        console.log("button")
        var a = $('#weekdays').selectedIndexes();
        var c = "";
        for (let i = 0; i < a.length; i++) {
            c = c + a[i] + ",";
            if (i-1 === a.length){
                c = c + a[i];
            }
        }
        console.log(c);
        for (const b of a) {
            c = c + " " + b;
        }
        console.log(c);
        console.log($('#time-in').val());
        ipcRenderer.send('schedule', {team: $('#team').val(),timein: $('#time-in').val(),timeout: $('#time-out').val(),days: c});
        ipcRenderer.on('status-response', (event, arg) => {
            if (arg === true){
                $('#status').text('Active');
            } else {
                $('#status').text('Error');
            }
        });
    });
    setInterval(function() {
        $content.addClass("loading");
        ipcRenderer.send('request-data',true);
        ipcRenderer.on('response-data', (event, arg) => {
              $("#team").val(arg.team);
              $("#time-in").val(arg.timein);
              $("#time-out").val(arg.timeout);
              $("#clock-in").text(arg.clockin);
              $("#clock-out").text(arg.clockout);
              $("#week-clock").text(arg.lastclocks);
              $("#week-hours").text(arg.weekhours);
              $("#month-hours").text(arg.monthhours);
              $("#errors").text(arg.errors);
        });
    }, 120000);

})(jQuery);
