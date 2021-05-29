
function allButtons(s) { //setta a checked tutti i bottoni dei generi
    var b = "btncheck";
    var a = "";
    for (var i = 1; i < 15; i++) {
        a = b + String(i);
        document.getElementById(a).checked = s.checked;
    }
    return true;
}

function moodFun() { //disabilita i bottoni dei generi quando si scelgono i mood
    var b = "btncheck";
    var s = "";
    for (var i = 0; i < 15; i++) {
        s = b + String(i);
        document.getElementById(s).disabled = true;
    }
    var b = "btnradio";
    var s = "";
    for (var i = 1; i < 8; i++) {
        s = b + String(i);
        document.getElementById(s).disabled = false;
    }
    return true;
}

function genreFun() {  //disabilita i bottoni dei mood quando si scelgono i generi
    var b = "btnradio";
    var s = "";
    for (var i = 1; i < 8; i++) {
        s = b + String(i);
        document.getElementById(s).disabled = true;
    }
    var b = "btncheck";
    var s = "";
    for (var i = 0; i < 15; i++) {
        s = b + String(i);
        document.getElementById(s).disabled = false;
    }
    return true;
}


//crea una url basata sulle scelte dell'utente ed invia una richiesta al server che risponderà con un film
function selectMovie() { 
    document.getElementById("Spin").disabled = true;
    var moods = ["happy", "sad", "lonely", "romantic", "fearless", "demotivated","curious"];
    var s = "";
    var url = "/movie";
    var gom = "";
    var mog = 0;
    if (document.getElementById("option1").checked) {
        var b = "btncheck";
        gom = '%5B';
        mog = 1;
        for (var i = 1; i < 15; i++) {
            s = b + String(i);
            var temp = document.getElementById(s);
            if (temp.checked) {
                gom += '%22' + temp.name + '%22';
                gom += '%2C';
            }
        }
        gom = gom.substring(0, gom.length - 3);
        gom += "%5D";
        url += "/genres";
        url += "?genres=" + gom;
        console.log(url);
    } else {
        var b = "btnradio";
        for (var i = 1; i < 8; i++) {
            s = b + String(i);
            var temp = document.getElementById(s);
            if (temp.checked) gom += moods[i - 1];
        }
        url += "/mood";
        url += "?mood=" + gom;
    }
    if(gom === '%5D' || gom === ''){
        alert("Select something!");
        return true;
    }else{
        $.ajax({
            url: url, 
            type: 'GET',
            success: function(data) {
                //console.log(data);
                setTimeout(function() {
                    $('#nomeFilm').html('<p style="color: white;">' + JSON.parse(data).name + '</p>');
                    document.getElementById("btn-film").disabled = false;
                }, 2200);
                document.getElementById("btn-film").setAttribute('href',"/MoviePage?id=" +JSON.parse(data).id + "&title="+JSON.parse(data).name);
                doSlot(JSON.parse(data).name.replace(/ /g, '_'));
            },
            error: function(e) {
                console.log(e);
            }
        });
        return true;
    }
}

function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return '';
}


 function addmovieFun() { //aggiunge un film al tuo account
    var auth = getCookie('AuthToken');
    if (auth != '') {
        $.post('/movie/save', {
            title: $('#title').text(),
            id: $('#idMovie').text()
        }, function (data, status) {
            //console.log(data);
            if (JSON.parse(data).success === 'true') {
                $("#mymoviediv").html('<div class="messagemoviepage">Movie added to your account</div>');
            } else if(JSON.parse(data).success === 'duplicato'){
                $("#mymoviediv").html('<div class="messagemoviepage">Movie already added to your account</div>');
            }else{
                $("#mymoviediv").html('<div class="messagemoviepage">Something gone wrong</div>');
            }            
        })
    } else {
        $("#mymoviediv").html('<div class="messagemoviepage">You have to login first!</div>');
    }
}

function addTraktFun() { //aggiunge un film al tuo account Trakt.tv
    $.post('/addToTrakt', {
        imdbId: $('#idMovie').text()
    }, function (data, status) {
        //console.log(data);
         if (JSON.parse(data).success === true) {
            $("#mymoviediv").html('<div class="messagemoviepage">Movie added to your Trakt.tv account!</div>');
        }else if(JSON.parse(data).success === false){
            $("#mymoviediv").html('<div class="messagemoviepage">You have to link your Trakt.tv account first!</div>');
        }
    })
}

function rate(n){ //fa una richiesta al server per aggiungere la valutazione del film al db
    $.post('/rate', {
        number: $('#numrate').text(),
        title: $('#ratetitle'+ n).text().replace(/_/g, ' ')
    }, function (data, status) {
        //console.log(data);      
    })
}

function Password() { //fa comparire il popup
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
    
  }
function timeout(){
    var time = setTimeout(Password,3000);
}
