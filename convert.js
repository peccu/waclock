$(document).ready(function(){
    var dateObj = new Date;
    var year = dateObj.getUTCFullYear();
    var month = dateObj.getUTCMonth();
    var day = dateObj.getUTCDate();
    $("#weather-temp").html("<b>hoge</b>");
    console.log($('#weather-temp'));
    $.ajax({
        type : 'GET',
        url: "http://www.finds.jp/ws/movesun.php",
        dataType : 'json',
        data: {
            json : null,
            y : year,
            m : month+1,
            d : day,
            lat : 34.553,
            lon : 135.512,
            tz : 9,
            e : 0
        },
        success: function( json ) {
            var civil = $(json.result.event).filter(function(i,e){
                return e.type == "civil";
            });
            var rise = $(civil).filter(function(i,e){return e.boundary == "start";});
            var set = $(civil).filter(function(i,e){return e.boundary == "end";});
            var sunrise = new Date(rise[0].time);
            var sunset = new Date(set[0].time);
            var daytime = new Date(sunset - sunrise);
            // 昼間の1目盛りの時間(分) = 昼間の時間(分) / 60(目盛り)
            var dayscale = (daytime.getUTCHours()*60 + daytime.getUTCMinutes()) / 60
            // 夜間の1目盛りの時間(分) = 昼間の時間(分) / 60(目盛り)
            var nightscale = (24*60 - daytime.getUTCHours()*60 + daytime.getUTCMinutes()) / 60;
            var now = new Date();
            // 昼用
            var scale = dayscale;
            var diff = new Date(now - sunrise);
            var eto = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
            var etoOffset = 3;
            if(now >= sunset){
              // 夜用
              scale = nightscale;
              diff = new Date(now - sunset);
              etoOffset = 9;
            }
            var scales = (diff.getUTCHours()*60 + diff.getUTCMinutes()) / scale;
            var idx = (etoOffset + Math.floor(scales / 10)) % 12 ;
            var modulus = Math.round(scales % 10 * 10)/10;
            $("#time").html(now.getHours() + "時" + now.getMinutes() + "分");
            $("#wa").html(eto[idx] + "の刻の" + modulus + "目盛り目");
            $("#scale").html(Math.round(scale*10)/10 + "分");
        },
      error: function (xhr, ajaxOptions, thrownError) {
          alert("ajax error");
          alert(xhr.status);
          alert(xhr.responseText);
          console.log(xhr.responseText);
          alert(thrownError);
      }
    });
});
