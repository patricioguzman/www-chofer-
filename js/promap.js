//--Declaro variables globales--//
	// variable geocoder, geocodificacion inversa, transforma Latitud y longitud en una direccion String
	var geocoder = new google.maps.Geocoder();
	// incializamos inforWindow...muestra informacion en un content
	var infoWindow = new google.maps.InfoWindow();
	// Icono chofer
	var icons ={
		chof: new google.maps.MarkerImage(
			// URL
			'img/chof.png',
			// (width,height)
			new google.maps.Size(71,72),
			// The origin point (x,y)
			new google.maps.Point(0,0),
			// The anchor point (x,y)
			new google.maps.Point(22,32)
		),
		myPos: new google.maps.MarkerImage(
		// URL
			'img/start.png',
			// (width,height)
			new google.maps.Size(48,48),
			// The origin point (x,y)
			new google.maps.Point(0,0),
			// The anchor point (x,y)
			new google.maps.Point(22,32)
		),
		end: new google.maps.MarkerImage(
			'img/end.png',
			new google.maps.Size(64,64),
			new google.maps.Point(0,0),
			new google.maps.Point(22,32)
		),
		user: new google.maps.MarkerImage(
			'img/user.png',
			new google.maps.Size(48,48),
			new google.maps.Point(0,0),
			new google.maps.Point(22,32)
		)			
	};
	// variables para datos de domicilio usuario
	var direccion = document.querySelector('#start');//direccion de casa
	// Variable para guardar longitud y latitud
	var myLatlng;
	//declaracion de objeto mapa 
    var map;
	// Declaracion de variables para trazar ruta
	var directionsDisplay;//solicitud a la api
	var directionsService = new google.maps.DirectionsService();//para obtener resultados//mostrar lo obtenido
	//Creamos boton gps
	var botonGps = document.createElement('button');
	var markersArray = [];
	//var imgGps= document.createElement('i');
	//imgGps.className='ui-icon-location';
	botonGps.id='gps';
	botonGps.className = 'ui-btn ui-shadow ui-corner-all ui-icon-location ui-btn-icon-notext ui-nodisc-icon ui-alt-icon';
	//botonGps.innerHTML = 'GPS';
	//botonGps.appendChild(imgGps);
	botonGps.onclick = geocalizando;
	botonGps.index = 1;

	var autocomplete;
	var markerGeo;
	//--CARGAR MAPA-->
	///////////////////////////////
	//Funcion que inicia el sistema
	function load_map() {
		loader("Cargando mapa...", false);
		// Declarar Opciones de Mapa
		var myOptions = {
	        zoom: 15,
			mapTypeControl: false,
			panControl: false,
			zoomControlOptions: {style: google.maps.ZoomControlStyle.LARGE, position: google.maps.ControlPosition.LEFT_CENTER},
			streetViewControl: false,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	   	};
		// Mostrar Mapa en Pantalla
		map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
		//icono camion posicion chofer
		markerGeo = new google.maps.Marker({map: map, icon: icons.chof, title: "Tu posición", animation: google.maps.Animation.DROP});
		//variables para trazar ruta
		directionsDisplay = new google.maps.DirectionsRenderer({
			preserveViewport: true,
			map: map,
			suppressMarkers: true
		});//solicitando api trazado de ruta

		//PONEMOS EL BOTON EN EL MAPA!
		map.controls[google.maps.ControlPosition.RIGHT_TOP].push(botonGps);
		/////HTML5 GEOCALIZAR AL USUARIO/////
		google.maps.event.addListenerOnce(map, 'idle', function(){
	    	$.mobile.loading( "hide" );
		});
		geocalizando();
		//google.maps.event.addListener(marker, 'click', geocalizando);//
		//marker.bindTo('position', map, 'center');//mantiene marker en el centro
	}///FIN LOAD_MAP/////////////////
	////////////////////////////////

	/////FUNCION GEOLOCATION USARIO!//////
	function geocalizando(){
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				markerGeo.setPosition(myLatlng);
				map.panTo(myLatlng);
				codeLatLng(myLatlng);//mostramos su direccion!
			}, function() {
				handleNoGeolocation(true);
			});	

		/*navigator.geolocation.watchPosition(function(position){
				myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				markerGeo.setPosition(myLatlng);
				//USAMOS WEBSOCKET
		}, handleNoGeolocation(true),{enableHighAccuracy:true, maximumAge:30000, timeout:27000});
*/
		}else {
			// Funcion de Excepcion si el browser no soporta geocalizacion
			handleNoGeolocation(false);
		}
	}///FIN GEOLOCATION////
	/////////////////////
	///Excepcion de GEOLOCATION en caso de ERROR.
	function handleNoGeolocation(errorFlag) {
		if (errorFlag) {
			var content = 'Error: The Geolocation service failed.';
		} else {
			var content = 'Error: Your dispositive doesn\'t support geolocation.';
		}
		var options = {
			map: map,
			position: new google.maps.LatLng(-33.46953993048928, -70.64397811889648),//en caso de error mostrar mapa en la posicion especificada
			content: content,
		};
		infoWindow = new google.maps.InfoWindow(options);
		map.setCenter(options.position);
		map.setZoom(13);
	}//fin funcion excepcion
	////////////////////////
					
	///////////////////////////////////////////
	//FUNCION REVERSE GEOLOCATION PARA MOSTRA DIRECCION ACTUAL DEL USUARIO
	function codeLatLng(pos) {
		//var infowindow = new google.maps.InfoWindow();
		var ll=""+pos; //pasamos latitud y longitud a string?
		var newPos = ll.substr(1, ll.length-2); //sacamos los parentesis
		var input = newPos; //pasamos longitud y latitud a la variable input -000,000
		var latlngStr = input.split(',', 2);//divido en las comas y guardo en 2 cadena
		var lat = parseFloat(latlngStr[0]);//obtengo la primera cadena
		var lng = parseFloat(latlngStr[1]);//obtengo la segunda cadena
		var latlng = new google.maps.LatLng(lat, lng);
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					$('#start').val(results[0].address_components[1].long_name+" "+results[0].address_components[0].short_name);
					$( "#btnEstado" ).attr("disabled", false);
				}else {alert('No results found');}
			}else {alert('Geocoder failed due to: ' + status);}
		});
	}//////FIN FUNCION REVERSE GEOLOCATION!
	/////////////////////////////////////////
		
	//FUNCION TRAZAR RUTA
	function verRuta(solicitud,usuario, precio){
		$("#finishTransport").css("display","block");
		$("#footerMap").css("background", "rgb(4, 95, 165)");
		$("#btnEstado").css("display","none");
		directionsDisplay.setMap(map);
    	var destDirec = solicitud.destino;
    	var waypts =[]
    	var myDirec = $('#start').val();
    	waypts.push({
    		location:solicitud.origen,
    		stopover:true
    	});
    	//datos para la solicitud
    	var request = {
        origin: myDirec,
        destination: destDirec,
        waypoints: waypts,
        travelMode: google.maps.DirectionsTravelMode['DRIVING'],
        unitSystem: google.maps.DirectionsUnitSystem['METRIC'],
        provideRouteAlternatives: false
    	};
	   	//hacemos la solicitud a la API con lo que establecimos en request
		directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {		    
		    //directionsDisplay.setPanel($("#directions_panel").get(0));
			//$("#directions_panel").text("a "+response.routes[0].legs[0].distance.text+" y "+ response.routes[0].legs[0].duration.text + " Aprox.");
		    directionsDisplay.setDirections(response);
		    makeMarker(response.routes[0].legs[0].start_location, icons.myPos, "Tu punto de partida!", "Datos de partida",response.routes[0].legs[0].start_address);
			makeMarkerUser(response.routes[0].legs[0].end_location, icons.user, "Tu cliente esta aqui!. Haz click para ver información",usuario, solicitud, precio);
			makeMarker(response.routes[0].legs[1].end_location, icons.end, "Aqui debes llegar!","Destino de descarga",response.routes[0].legs[1].end_address);
		   } else {alert("No existen rutas entre los puntos!!");}
		});
	}///FIN funcion verRuta
	///////////////////////

	//Funcion para crear Markers
	function makeMarker(position, icon, title, label, section){
		var contenido = '<b>'+label+'</b><br>'+section;
		var marker = new google.maps.Marker({
			position: position,
			map: map,
			icon: icon,
			title: title
		});
		markersArray.push(marker);
		new google.maps.event.addListener(marker, 'click', function() {
       		infoWindow.setContent(contenido); 
       		infoWindow.open(map,marker);
       	});
	}
	function makeMarkerUser(position, icon, title, usuario, solicitud, precio){
		var contenido = '<b>Datos del usuario</b><br><span> Nombre: '+usuario.nombre+'</span><br><span> Correo: '+usuario.correo+'</span><br><span> Celular: '+usuario.celular+'</span><br><span><b>Datos de solicitud</b></span><br><span> Origen: '+solicitud.origen+'</span><br><span> Destino: '+solicitud.destino+'</span><br><span> Cargar: '+solicitud.cargar+' Descargar: '+solicitud.descargar+'<span><br><span>Comentario: '+solicitud.comentario+'</span><br><span>Distancia total: '+solicitud.kms+" y "+solicitud.tiempo+'</span><br><b>Precio: '+precio+'</b>';
		var marker = new google.maps.Marker({
			position: position,
			map: map,
			icon: icon,
			title: title
		});
		markersArray.push(marker);
		new google.maps.event.addListener(marker, 'click', function() {
       		infoWindow.setContent(contenido); 
       		infoWindow.open(map,marker);
      	});
	}

	function clearMap(){
		$("#finishTransport").css("display","none");
		$("#footerMap").css("background", "rgb(4, 180, 21)");
		$("#btnEstado").css("display","block");
		directionsDisplay.setMap(null);
		for (var i = 0; i < markersArray.length; i++ ) {
    		markersArray[i].setMap(null);
  		}
  		markersArray = [];
  		map.panTo(myLatlng); 
		map.setZoom(13);
	}

	/*function nuevaPosicion(){
		if (localStorage.idChoferBF) {
			var ll=""+myLatlng; //pasamos latitud y longitud a string?
			var newPos = ll.substr(1, ll.length-2); //sacamos los parentesis
			var input = newPos; //pasamos longitud y latitud a la variable input -000,000
			var latlngStr = input.split(',', 2);//divido en las comas y guardo en 2 cadena
			var lat = parseFloat(latlngStr[0]);//obtengo la primera cadena
			var lng = parseFloat(latlngStr[1]);//obtengo la segunda cadena
			cliSocket.emit("nuevaPosicion", {'lat': lat, 'long': lng, 'idChofer': localStorage.idChoferBF});
		};
	}*/

	function loader(msg, overlay){
		var $this = $( this ),
	    theme = "b",
	    msgText = msg,
	    textVisible = true,
	    textonly = false,
	    html = $this.jqmData( "html" ) || "";
	    $.mobile.loading( "show", {
	            text: msgText,
	            textVisible: textVisible,
	            theme: theme,
	            textonly: textonly,
	            html: html
	    });
	    if (overlay) {
	    	$(".ui-loader-back").css("display", "block");
	    }else{
	    	$(".ui-loader-back").css("display", "none");
	    }
	};

	function endLoader(){
		$.mobile.loading( "hide" );
		$(".ui-loader-back").css("display", "none");
	};

	//////////////////////////////
	///CARGAMOS EL MAPA EN LA WEB!		
	google.maps.event.addDomListener(window, 'load', load_map);			
	//////////////////////////////////////
