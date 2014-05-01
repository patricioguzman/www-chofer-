//Conectamos al servidor node
var cliSocket = io.connect('http://54.227.239.22:8000',{
  'auto connect': false
});
var usuario;
var solicitud;
var idChofer = localStorage.getItem('idChofer');
var nomChofer = localStorage.getItem('nombreChofer');
var idUsuario;

$(document).ready(function(){
	ingresarSistema();
  /*if (localStorage.idChoferBF) {
    cliSocket.socket.reconnect();
    ingresarSistema();
  }else{
    alert("Acceso Restringido!.");
    window.history.go(-1);
  }*/
});//fin document ready

function btnEstado(){
	$("#btnEstado").attr('disabled', true)
	if ($("#btnEstado").text() == "Fuera de linea") {
		cliSocket.socket.reconnect();
		cliSocket.emit('idChofer', {idChofer: idChofer, estado: 1}, function(datos){
			$("#footerMap").css("background", "rgb(4, 180, 21)");
			$("#btnEstado").css("background", "rgb(4, 180, 21)").text("En linea");
			$("#btnEstado").attr('disabled', false);
		});//mandar lat y long actual del jofer
	}else{
		cliSocket.emit('estadoChofer', {idChofer: idChofer, estado: 0}, function(datos){
			cliSocket.disconnect();
			$("#footerMap").css("background", "rgb(210, 32, 4)");
			$("#btnEstado").css("background", "rgb(210, 32, 4)").text("Fuera de linea");
			$("#btnEstado").attr('disabled', false);
		});
	}
	/*setTimeout(function(){
		$("#btnEstado").attr('disabled', false);
	},3000);*/
	
};

function verSolicitud(data){
    //Llenamos campos:
    $('#direccion').val(data.origen);
    $('#destino').val(data.destino);
    $('#kms').text(data.kms);
    $('#tiempo').text(data.tiempo);
    if (data.cargar == "Si") {$("#cargar").addClass("ui-icon-check")}else{$("#cargar").addClass("ui-icon-delete")};
    if (data.descargar == "Si") {$("#descargar").addClass("ui-icon-check")}else{$("#descargar").addClass("ui-icon-delete")};
    $('#informacion').text(data.comentario);
    verFotos(data.fotos);
};

function verFotos(fotos){
    for (var i = 0; i < fotos.length; i++) {
    	//$('#imagenes').append('<img src="' + fotos[i] + '" class="img-thumbnail" />');
    	$("#minFoto"+i).attr("src", fotos[i]);
    	$("#foto"+i+" img").attr("src", fotos[i]);
    };  
};

function refresh(){
	//cuando rechaza la oferta no me manda al index!!!!
	$( ":mobile-pagecontainer" ).pagecontainer( "change", "#", { showLoadMsg: true } );
	$("#direccion").val("");
	$("#destino").val("");
	$("#informacion").text("");
	$("#kms").text("");
	$("#tiempo").text("");
	$("#cargar").removeClass("ui-icon-check");
	$("#descargar").removeClass("ui-icon-check");
	$("#cargar").removeClass("ui-icon-delete");
	$("#descargar").removeClass("ui-icon-delete");
	$(".popphoto").attr('src', 'data:image/jpeg;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
};


function finFlete(){
    //Usuario Finaliza transaccion flete     
 	$('#btnFin').removeClass( "ui-state-disabled" );
    finalizarFlete("","Calificar usuario", true);
};

function finalizarFlete(nombre, myText, key){
    $('#myTextFin').text(nombre+" "+myText);     
    $('#btnSend').unbind("click").click(function(){
        if ($('#rateit9').rateit('value')!=0) {
        	clearMap();
        	$( "#popupDialog" ).popup( "close" );
          	cliSocket.emit('ratingUser', {"tabla": "ratusuario", "idChofer": idChofer, "idUsuario": idUsuario, "rating": $('#rateit9').rateit('value'), "comentario": $('#textareaRat').val()});
          	if (key) {
            	cliSocket.emit("userEnd", {"id": idUsuario, "user": false, "nombre": nomChofer});
          	}
          	cliSocket.emit('estadoChofer', {idChofer: idChofer, estado: 1}, function(data){});
        	$('#textareaRat').val("");
        	$('#rateit').rateit('value', 0);       
       	}else {alert("Debes calificar al usuario!");}
    });      
};

function ingresarSistema(){
	//btnEstado();
	//Espera de una nueva solicitud
	cliSocket.on('nuevaSolicitud', function (data, callback) {
	    //Nueva solicitud
	    //Mostramos ventana notificacion
	    $( "#popupSolicitud" ).popup( "open", {transition: "slidedown"});

	    //No visualiza solicitud devolvemos false
	    $("#cerrar").unbind("click").click(function(){
	    	$("#popupSolicitud" ).popup("close");
	    	callback({"respuesta": false, "motivo": 1});
	    });

	    //Visualiza solicitud
	    $("#verSolicitud").unbind("click").click(function(e){
	   		verSolicitud(data);
	    });

	    //Si cancela solicitud devolvemos false
	    $('#accion').unbind("click").click(function(){
		    //mostrar modal con opciones de porque rechazo
		    //MOTIVOS DEL RECHAZO
		    // 1 = no puede realizar solicitud
		    // 2 = Fotos mal tomadas
		    // 3 = comentario no se entiende
		    // 4 = Direcciones en mal formato
		    refresh();
		    callback({"respuesta": false, "motivo": $("input[name*=radio-choice-w-6]:checked").val()});
	    });

	     //Si acepta solicitud devolvemos true
	    $('#aceptar').unbind("click").click(function(){
	      	if ($('#precio').val()) {//validar numero
	      		$( "#popupPrecio" ).popup("close");
				loader("Esperando decisión...", true);
				//guardamos datos en variable
				usuario = {
			    	nombre: data.usuario,
			        celular: data.telefono,
			        correo: data.correo
			    };
			    solicitud = {
			        origen: data.origen,
			        destino: data.destino,
			        cargar: data.cargar,
			        descargar: data.descargar,
			        comentario: data.comentario,
			        kms: data.kms,
			        tiempo: data.tiempo
			    };
			    //enviar rating!
	        	callback({"respuesta": true, "precio": $('#precio').val(), "posicion": $('#start').val(), "nombreChofer": nomChofer, "latLong": myLatlng.toString()});
	        	//Esperamos respuesta del cliente
	      }else{alert("Debes fijar un precio.")}
	    });
	});



	cliSocket.on('procesarDecision',function(respuesta){
	    //recibimos respuesta del usuario
	    endLoader();
	    if(respuesta['estado'] == true)	{
	    	loader("Usuario acepto oferta!", true);
	    	idUsuario = respuesta['idUsuario'];
	        //Iniciamos traslado de datos
	        verRuta(solicitud, usuario, $('#precio').val());
	        refresh();
	        endLoader();
	    }
	    if (respuesta['estado'] == "rebaja") {
	    	//mostramos popup
	    	$( "#popupOferta" ).popup( "open", {transition: "slidedown"});
	    	//chofer envia nuevo precio
	        $('#rebaja').unbind("click").click(function(){
	        	$("#popupOferta" ).popup("close");
	        	loader("Esperando decisión...", true);
	        	$('#precio').val($('#oferta').val());
	        	cliSocket.emit("nuevaOferta",{"oferta":$('#oferta').val()});                    
	        });
	        //chofer rechaza solicitud
	        $('#rechaza').unbind("click").click(function(){
	        	//$("#popupOferta" ).popup("close");
	        	refresh();
	          	cliSocket.emit("nuevaOferta",{"oferta":false, "motivo": 1});     
	        });      
	    }
	    if(respuesta['estado'] == "nuevo") { 
	    	alert("Usuario rechazo oferta"); refresh();
	    };
	    if(respuesta['estado'] == false) { 
	    	alert("Usuario rechazo oferta"); refresh();
	    };
	});

	cliSocket.on('finalizaFlete', function(data){
	    $( "#popupDialog" ).popup( "open", {transition: "slidedown"});
	    $('#btnFin').addClass('ui-state-disabled');
	    finalizarFlete(data,"Ha finalizado!",false);   
	});
};