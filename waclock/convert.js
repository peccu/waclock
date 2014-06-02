// var $ = function(){}
// 干支
var eto = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

// 位置情報を取得する
$(document).ready(function(){
  getLocation();
});

function getLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(withLocAction, noLocAction);
  }else{
    noLocAction();
  }
}

// 位置情報を取得できたら現在地の日の出日の入りを求める
function withLocAction(location){
  var lat = location.coords.latitude;
  var lon = location.coords.longitude;
  var loc = {lat: lat, lon: lon};
  console.log("location detected: " + lat + "," + lon);
  getSunrise(loc);
}

// 位置情報を取得できなければデフォルト位置の日の出日の入りを求める
function noLocAction(){
  console.log("location disabled or error");
  var loc = {
    lat : 35,
    lon : 135
  }
  getSunrise(loc);
}

// 日の出日の入りのAPI用ポストデータ生成(位置情報以外)
function prepare(){
  var dateObj = new Date;
  var year = dateObj.getUTCFullYear();
  var month = dateObj.getUTCMonth();
  var day = dateObj.getUTCDate();
  return {
    json : null,
    y : year,
    m : month+1,
    d : day,
    tz : 9,
    e : 0
  };
}

// 日の出日の入り情報を取得する
function getSunrise(loc){
  var data = prepare();
  var postData = $.extend(data, loc);
  $.ajax({
    type : 'GET',
    url: "http://www.finds.jp/ws/movesun.php",
    dataType : 'json',
    data: postData,
    success: function( json ) {
      showWaclock(json);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      alert("ajax error");
      alert(xhr.status);
      alert(xhr.responseText);
      console.log(xhr.responseText);
      alert(thrownError);
    }
  });
}

function showWaclock(json){
  // 日の出と日の入りの時刻を取り出す
  var sun = parseResponse(json);

  // 日の出日の入りから35分ずらす(大人の科学の説明より)
  var offset = 35;
  sun.sunrise.setMinutes(sun.sunrise.getMinutes() - offset);
  sun.sunset.setMinutes(sun.sunset.getMinutes() + offset);
  var sunrise = sun.sunrise;
  var sunset = sun.sunset;

  // 昼間と夜間の時間を求める
  var daytime = new Date(sunset - sunrise);
  var now = new Date();
  // 昼用
  // 昼間の1目盛りの時間(分) = 昼間の時間(分) / 60(目盛り)
  var dayscale = (daytime.getUTCHours()*60 + daytime.getUTCMinutes()) / 60
  var scale = dayscale; // 1目盛りの時間
  var diff = new Date(now - sunrise);
  var etoOffset = 3; // 卯
  if(now >= sunset){
    // 夜用
    // 夜間の1目盛りの時間(分) = 昼間の時間(分) / 60(目盛り)
    var nightscale = (24*60 - daytime.getUTCHours()*60 + daytime.getUTCMinutes()) / 60;
    scale = nightscale; // 1目盛りの時間
    diff = new Date(now - sunset);
    etoOffset = 9; // 酉
  }

  // 今何目盛り目か求める
  var scales = (diff.getUTCHours()*60 + diff.getUTCMinutes()) / scale;
  var idx = (etoOffset + Math.floor(scales / 10)) % 12 ;
  var modulus = Math.round(scales % 10 * 10)/10;
  $("#time").html(now.getHours() + "時" + now.getMinutes() + "分");
  $("#wa").html(eto[idx] + "の刻の" + modulus + "目盛り目");
  $("#scale").html(Math.round(scale*10)/10 + "分");
}


function parseResponse(json){
  var civil = $(json.result.event).filter(function(i,e){
                return e.type == "civil";
              });
  var rise = $(civil).filter(function(i,e){return e.boundary == "start";});
  var set = $(civil).filter(function(i,e){return e.boundary == "end";});
  var sunrise = new Date(rise[0].time);
  var sunset = new Date(set[0].time);
  return {sunrise: sunrise, sunset: sunset};
}
