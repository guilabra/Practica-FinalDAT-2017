$(document).ready(function() {

var map;
var lista;
var num;
var latitude;
var longitude;
var colecciones = {};
var nombres_colecciones = [];
var usuarios_instalaciones = {};
var coleccion_activada;
var usuarios_cargados = [];
var usuarios_divs = [];
var num_usuarios = 0;
var api;
$("#fotos").hide();
$("#boton-principal").hide();
$("#boton-colecciones").hide();
$("#boton-instalaciones").hide();
$("#lista-ppal").hide();
$("#mapa").hide();
$("#resultado-cargar-git").hide();


  $("#cargar1").click(function(e){
    $("#boton-principal").show();
    $("#boton-colecciones").show();
    $("#boton-instalaciones").show();
    $("#lista-ppal").show();
    $("#mapa").show();

  })

  $("#boton-principal").click(function(e){
    $("#principal").show();
    $("#colecciones").hide();
    $("#instalaciones").hide();
  })

  $("#boton-colecciones").click(function(e){
    $("#principal").hide();
    $("#colecciones").show();
    $("#instalaciones").hide();
  })

  $("#boton-instalaciones").click(function(e){
    $("#principal").hide();
    $("#colecciones").hide();
    $("#instalaciones").show();
    if (usuarios_divs.length>0){
      $("#allUsers").html("");
      for(var i=0; i<usuarios_divs.length; i++){
        $("#allUsers").append(usuarios_divs[i]);
      }
    }
  })

  $('.carousel').carousel({
      interval: 5000 //changes the speed
  })

  function inicio(){
      $("#principal").show();
      $("#colecciones").hide();
      $("#instalaciones").hide();
      //mapa
      map = L.map('mapa').setView([40.4165, -3.7025], 14);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                  { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors', maxZoom: 18}
                ).addTo(map);
  		//Cargar lista aparcamientos inicial
			$('#lista-ppal').css("overflow-y","scroll");
			$('#lista-ppal').css("height", "700px");
      $('#lista-parking-col').css("overflow-y","scroll");
      $('#lista-parking-col').css("height", "700px");
      rellenarLista();
  };
  inicio();


  function rellenarLista(){
		//Descargamos los aparcamientos de instalaciones.json y los introducimos en el dom
			$.getJSON("info.json")
			.done(function(data){
				lista =  data['@graph'];
				num = lista.length;
        //Creamos el html para cada aparcamiento de la lista
        var html1 = "";
        var html2 = "";
        html1 += "<ul class='col-xs-12 col-sm-12 col-md-5 col-lg-5'>";
        //html2 += "<div id='parkings'>";
        for (var i = 0; i < num; i++){
          html1 += "<li class='parking' id='parking-" + i + "'>";
          html1 += "<h4>" + lista[i].title + "</h4>";
          html1 += "<p>" + lista[i].address['street-address'] + "</br>";
          html1 += lista[i].address['postal-code'] + "&nbsp" + lista[i].address['locality'] + "</p>";
          html1 += "</li>";

          html2 += "<div class='sortable' id='parking2-" + i + "'>";
          html2 += "<div class='sortable sortable-list ui-sortable-handle' id='" + i + "'>"
          html2 += "<h4>" + lista[i].title + "</h4>";
          html2 += "<p>" + lista[i].address['street-address'] + "</br>";
          html2 += lista[i].address['postal-code'] + "&nbsp" + lista[i].address['locality'] + "</p>";
          html2 += "</div></div>";
        }
        html1 += "</ul>";
        //html2 += "</div>";
        $('#lista-ppal').empty();
        $('#lista-ppal').html(html1);
        $('#lista-parking-col').empty();
        $('#lista-parking-col').html(html2);
        hacerAparcClicks();

        //Mostramos la info del parking al clickar sobre cada uno de ellos
        for (var i = 0; i < num; i++){
          var identificador = "#parking-" + i.toString();
          var aparcamiento = "parking-" + i.toString();
          usuarios_instalaciones[aparcamiento] = [];
          $(identificador).click(function(e) {
            //0) Incluimos los usuarios asociados a ese aparcamiento en instalaciones
            aparcamiento_activado = e.currentTarget.id;
            $("#usuarios-asociados").html("");
            var listaU = usuarios_instalaciones[aparcamiento_activado];
            if (listaU != ""){
              for(var i=0; i<listaU.length; i++){
                $("#usuarios-asociados").append(listaU[i]);
              }
            }
            //1) Incluimos la descripción detallada del aparcamiento clickeado
            var num_park = e.currentTarget.id.split('-')[1];
            $('#desc-ppal').empty();
            var html = "";
            var html = "<div class='col-xs-12 col-sm-12 col-md-7 col-lg-7'>";
            html += "<h5>" + lista[num_park].title + "</h5>";
            html += "<p>" + lista[num_park].address['street-address'] + "</br>";
            html += lista[num_park].address['locality'] + "&nbsp" + lista[num_park].address['postal-code'] + "</p>";
            html += "<p>" + lista[num_park].organization['organization-desc'] + "</p>";
            html += "</div>";
            $('#desc-ppal').html(html);
            var html2 = "";
            html2 += "<h5>" + lista[num_park].title + "</h5>";
            html2 += "<p>" + lista[num_park].address['street-address'] + "</br>";
            html2 += lista[num_park].address['locality'] + "&nbsp" + lista[num_park].address['postal-code'] + "</p>";
            html2 += "<p>" + lista[num_park].organization['organization-desc'] + "</p>";
            $("#desc-instalaciones").html(html2);
            //Guardamos la latitud y la longitud
            latitude = lista[num_park].location.latitude;
            longitude = lista[num_park].location.longitude;
            //2) Ponemos el marcador en el mapa
            marker = L.marker([latitude, longitude]).addTo(map)
              .bindPopup(lista[num_park].title.split('.')[1])
              .openPopup();
            //Creamos un manejador para cada elemento en el mapa
            //para que al pinchar en él también se cambie la descripción abajo
            $(marker).click(function(e){
              //Al pinchar en el marcador, mostramos el contenido del aparcamiento
              $('#desc-ppal').empty();
              var html = "";
              var html = "<div class='col-xs-12 col-sm-12 col-md-7 col-lg-7'>";
              html += "<h5>" + lista[num_park].title + "</h5>";
              html += "<p>" + lista[num_park].address['street-address'] + "</br>";
              html += lista[num_park].address['locality'] + "&nbsp" + lista[num_park].address['postal-code'] + "</p>";
              html += "<p>" + lista[num_park].organization['organization-desc'] + "</p>";
              html += "</div>";
              $('#desc-ppal').html(html);
            })
            //3) Buscamos las fotos para cada aparcamiento
            var url = "https:\/\/commons.wikimedia.org\/w\/api.php?format=json&action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6&ggsradius=500&ggscoord=";
            url += latitude + "|" + longitude;
            url += "&ggslimit=10&prop=imageinfo&iilimit=1&iiprop=url&iiurlwidth=200&iiurlheight=200&callback=?";
            var lista_imagenes = [];
            $.getJSON(url,function(json){
              $("#fotos").show();
                var i=1;
                var dictionary = json.query.pages;
                $.each(dictionary, function(key, value) {
                  if(i<4){ //3 fotos
                    var identificador = "#foto-" + i.toString();
                    $(identificador).attr("src", value.imageinfo[0].url);
                    $(identificador).css("height","450px");
                    $(identificador).css("width","750px");
                    lista_imagenes.push(value.imageinfo[0].url);
                  }
                  i = i+1;
                });
            });
          })
        }
      })
      .fail(function(jqxhr, status, error){
        $('#lista-ppal').empty();
        $('#lista-ppal').append("<p>Request Failed: " + status + ": " + error + "</p>");
      })
	}


  $("#boton-nueva-coleccion").click(function(e){
    e.preventDefault();
    var nombre = $("#name").val();
    $("#name").val("");
    colecciones[nombre] = []; //diccionario con todas las colecciones
    nombres_colecciones.push(nombre);
    var html = "<hr><h2 class='intro-text text-center'><li id='coleccion-" + nombre + "'><strong>" + nombre + "</strong></li></h2><hr>";
    $("#lista-colecciones").append(html);
    $("#coleccion-" + nombre).click(function(e){
      e.preventDefault();
      var titulo = e.currentTarget.id.split('-')[1];
      coleccion_activada = titulo;
      var html = "<hr><h2 class='intro-text text-center'><strong>" + titulo + "</strong></h2><hr>";
      $("#titulo").html("");
      $("#titulo").html(html);
      //tambien en la pagina principal
      $("#coleccion-ahora").html("");
      $("#coleccion-ahora").append(html);
      if (colecciones[titulo] == ""){
        $("#sortable-lis").html("");
        $("#sortable-lis").html("¡Aún no has añadido aparcamientos a esta colección!");
        $("#coleccion-ahora").append("¡Aún no has añadido aparcamientos a esta colección!");
      }
      else{
        list = colecciones[titulo];
        var contenido = "";
        if(list.length > 5){
          $("#sortable-lis").css("overflow-y","scroll");
          $("#sortable-lis").css("height", "600px");
        }
        for (var i=0; i<list.length; i++){
          contenido += list[i];
        }
        $("#sortable-lis").html("");
        $("#sortable-lis").html(contenido);
        $("#lista-ahora").append(contenido);
      }
    })
  })


  $( function() {
    $( "#sortable-lis" ).sortable({
      connectWith: ".sortable",
      items: "div",
      receive: function(event, ui) {
            if ($("#titulo").html == "") {
                alert('¡Tienes que añadir una colección previamente!');
                $(ui.sender).sortable('cancel');
            }
            else{
              var aparcamiento = "<div class='sortable' id='";
              aparcamiento += ui.item.context.id + "'>";
              aparcamiento += ui.item.context.innerHTML + "</div>";
              if ($.inArray(aparcamiento, colecciones[coleccion_activada]) == -1){
                aparcamientos.push(colecciones[coleccion_activada]);
              }
              else{
                alert("El aparcamiento ya se encuentra en la colección");
                $(ui.sender).sortable('cancel');
              }
            }
            if(colecciones[coleccion_activada].length > 5){
              $("#sortable-lis").css("overflow-y","scroll");
              $("#sortable-lis").css("height", "600px");
            }
        },
        remove: function(event, ui) {
          var aparcamiento = "<div class='sortable' id='";
          aparcamiento += ui.item.context.id + "'>";
          aparcamiento += ui.item.context.innerHTML + "</div>";
          if ($.inArray(aparcamiento, colecciones[coleccion_activada]) != -1){
            var pos = $.inArray(aparcamiento, colecciones[coleccion_activada]);
            colecciones[coleccion_activada].splice(pos, 1); //eliminamos el elemento de la lista
          }
          else{
            console.log("Error al eliminar el aparcamiento");
          }

        }
    }).disableSelection();
  });


  function hacerAparcSortables(){
    var identificador = "";
    for (var i = 0; i < num; i++){
      identificador = "#parking2-" + i.toString();
      $(identificador).sortable({
        connectWith: ".sortable",
        items: "div",
        receive: function(event, ui){
          var aparcamiento = "<div class='sortable' id='";
          aparcamiento += ui.item.context.id + "'>";
          aparcamiento += ui.item.context.innerHTML + "</div>";
        }
      }).disableSelection();
    }
  }

  function hacerAparcClicks(){
    var identificador = "";
    for (var i = 0; i < num; i++){
      identificador = "#parking2-" + i.toString();
      $(identificador).click(function(e){
        var len;
        if (colecciones[coleccion_activada]==""){
          colecciones[coleccion_activada] = [];
          $("#sortable-lis").html("");
        }
        var nuevoelemento = "<div class='sortable' id='" + e.currentTarget.id + "'>" + e.currentTarget.innerHTML + "</div>";
        if ($.inArray(nuevoelemento, colecciones[coleccion_activada]) == -1){
          if (colecciones[coleccion_activada]==""){
            colecciones[coleccion_activada][0] = nuevoelemento;
          }
          else{
            len = colecciones[coleccion_activada].length;
            colecciones[coleccion_activada][len] = nuevoelemento;
          }
          $("#sortable-lis").append(nuevoelemento);
        }

      }).disableSelection();
    }
  }

  $("#boton-usuarios").click(function(e){
    e.preventDefault();
    usuarios_cargados = [];
    $("#cargarU").hide();
    api = $("#api").val();
    if(api == ""){
      alert("Introduce un valor!");
    }
    else{
      try {
        var host = "ws://localhost:8002/"; //PFinalSocket
        var s = new WebSocket(host);
        s.onopen = function (e) {
          console.log("Socket opened.");
        };
        s.onclose = function (e) {
          console.log("Socket closed.");
        };
        s.onmessage = function (e) {
          if($.inArray(e.data, usuarios_cargados) == -1){
            //usuario nuevo, lo guardo
            usuarios_cargados.push(e.data);
            var id = e.data;
            gapi.client.setApiKey(api);
            makeApiCall(id);
          }
        };
        s.onerror = function (e) {
          console.log("Socket error:", e);
        };
      } catch (ex) {
        console.log("Socket exception:", ex);
      }
    }
  })

  function makeApiCall(id) {
    gapi.client.load('plus', 'v1', function() {
      var request = gapi.client.plus.people.get({
        'userId': id
      });
      request.execute(function(resp) {
        var image = resp.image.url;
        var name = resp.displayName;
        var html = "<div class='user' id='user-" + num_usuarios + "'>";
        if(image == ""){
          html += "<img src='img/user_blue_logo.png'></img>";
        }
        else{
          html += "<img src='" + image + "'></img>";
        }
        html += "<h5>" + name + "</h5>";
        html += "</div>";
        usuarios_divs[num_usuarios] = html;
        var identificador = '#user-' + num_usuarios.toString();
        num_usuarios = num_usuarios + 1;
        $("#usuarios").append(html);
        html = "";
        $(identificador).click(function(e){
          var elemento = "<div class='user' id="+ e.currentTarget.id + "'>" + e.currentTarget.innerHTML + "</div>";
          usuarios_instalaciones[aparcamiento_activado].push(elemento);
          $("#usuarios-asociados").append(elemento);
        })

      });
    });
  }


  $("#boton-guardar-git").click(function(e){
    e.preventDefault();
    var token = $("#git-token").val();
    var user = $("#git-user").val();
    var repo = $("#git-repo").val();
    var file = $("#git-file").val();
    ghub = new Github({
      token: token,
      auth: "oauth"
    });
    var data = {
      "names": nombres_colecciones,
      "collection": colecciones,
      "users": usuarios_instalaciones
    };
    var repositorio = ghub.getRepo(user, repo);
    var contenido = JSON.stringify(data);
    var commit = "fichero";
    repositorio.write('master', file, contenido, commit, function(e){console.log(e)});
    alert("Guardados OK");
  })


  $("#boton-cargar-git").click(function(e){
    e.preventDefault();
    var token = $("#git-token").val();
    var user = $("#git-user").val();
    var repo = $("#git-repo").val();
    var file = $("#git-file").val();
    ghub = new Github({
      token: token,
      auth: "oauth"
    })
    var repositorio = ghub.getRepo(user, repo);
    repositorio.read('master', file, function(err, data) {
      data = JSON.parse(data);
      nombres_colecciones = data.names;
      colecciones = data.collection;
      usuarios_instalaciones = data.users;
      var pos;
      $("#resultado-cargar-git").show();
      $("#resultados-git").html("");
      $("#resultados-git").append("Colecciones creadas:");
      for(var i=0; i<nombres_colecciones.length; i++){
        $("#resultados-git").append(nombres_colecciones[i] + "</br>");
      }
      for(var i=0; i<usuarios_instalaciones.length; i++){
        $("#resultados-git").append(usuarios_instalaciones[i] + "</br>");
      }
      alert("Cargados OK");
    })
  })




});
