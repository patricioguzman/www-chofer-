$('#botonLogin').click(function(){
	loader("Cargando...", true);
		var datosRut = $("#rut").val()
		var datosPassword = $("#pass").val()
		archivoValidacion = "http://54.227.239.22/webservices/buscaflete/login_chofer.php?jsoncallback=?"

		$.getJSON( archivoValidacion, { rut:datosRut ,password:datosPassword})
		.done(function(respuestaServer) {
			
			if(respuestaServer.validacion == "ok"){			  

			 	/// si la validacion es correcta, muestra la pantalla "home"
			 	endLoader();
				//$( ":mobile-pagecontainer" ).pagecontainer( "change", "chofer.html", { showLoadMsg: true, transition: "slide"} );
				//$.mobile.pageContainer.pagecontainer( "change", "chofer.html", { showLoadMsg: true, transition: "slide"} );
				localStorage.setItem("idChofer", respuestaServer.idChofer);
				localStorage.setItem("nombreChofer", respuestaServer.nombre);
				//alert("Nombre de usuario: " + localStorage.getItem('nombreChofer') + "ID: " + localStorage.getItem('idChofer') );
				window.location = "chofer.html";	  
			}
			if (respuestaServer.validacion == "603") {
				/// si la validacion es correcta, muestra la pantalla "home"
			 	endLoader();
				alert("Error 602: Sistema no disponible.");
			}
			if(respuestaServer.validacion == "error"){
				endLoader();
			    alert("Usuario y/o contraseña incorrectos.");
			  /// ejecutar una conducta cuando la validacion falla
			}

		})
		return false;
	
});

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

//Funciones Botón Cerrar Sesión
$( "#cerrarsesion" ).click(function() {
		localStorage.removeItem("idChofer");
		localStorage.removeItem("nombreChofer");
		window.location= "index.html";
});

//Funciones botón registro
$("#botonRegistro").click(function(){
	var registroRut = $("#rg-rut").val();
	var registroCorreo = $("#rg-correo").val();
	var registroNombre = $("#rg-nombre").val();
	var registroTelefono = $("#rg-celular").val();
	var registroPassword = $("#rg-pass").val();

	archivoValidacion2 = "http://54.227.239.22/webservices/buscaflete/registro_chofer.php?jsoncallback=?"
	$.getJSON( archivoValidacion2, { rut:registroRut ,
									correo: registroCorreo ,
									nombre: registroNombre ,
									telefono: registroTelefono ,
									password: registroPassword}).done(function(respuestaServer) {
		
		if(respuestaServer.validacion == "ok"){			
			alert("Usuario Registrado con exito");  
		 	/// si la validacion es correcta, muestra la pantalla "home"
			$( ":mobile-pagecontainer" ).pagecontainer( "change", "#login-page", { showLoadMsg: true, transition: "slide"} );
			//$.mobile.pageContainer.pagecontainer( "change", "#login-page", { showLoadMsg: true, transition: "slide"} );  
		}
		if (respuestaServer.validacion == "603") {
			/// si ocurre error 603, es porque existen problemas en la basee de datos
			alert("Error 602: Sistema no disponible. Comuniquese a soporte@cajanerd.cl");
		}
		if(respuestaServer.validacion == "error"){
			/// ejecutar una conducta cuando la validacion falla
		    alert("Error al registrar usuario, verifique que todos los datos sean correctos e intente nuevamente.");
		  
		}

	})
	return false;
});
