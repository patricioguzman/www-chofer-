$('li.consulta').click(function(e){
	loader("Cargando...", true);
	var tipoConsulta = $(this).attr('name');
	var id = localStorage.getItem('idChofer');
	archivoConsulta = "http://192.168.1.38/webservices/buscaflete/consultas.php?jsoncallback=?"
	$.getJSON( archivoConsulta, { idChofer:id, consulta:tipoConsulta})
		.done(function(respuestaServer) {
			67
			if(respuestaServer.validacion == "ok"){
				if (tipoConsulta == "perfil") {
	                getPerfil(respuestaServer);
	            }
	            if (tipoConsulta == "vehiculo") {
	                getVehiculo(respuestaServer);
	            }
	            if (tipoConsulta == "historial") {
	                getHistorial(respuestaServer);
	            }
	            if (tipoConsulta == "cerrar") {
	                setCerrar(respuestaServer);
	            }
	        endLoader();
			}
			if (respuestaServer.validacion == "605") {
			 	endLoader();
				alert("Error 605: Imposible obtener datos.");				
			}
			if(respuestaServer.validacion == "603"){
				endLoader();
			    alert("Error 603: Sistema no disponible.");
			}
			if(respuestaServer.validacion == "sin datos"){
				endLoader();
			}
		});
});
function getPerfil(datos){
	$('#miRut').val(datos.rut);
	$('#miCorreo').val(datos.correo);
	$('#miNombre').val(datos.nombre);
	$('#miTelefono').val(datos.telefono);
	$('#misViajes').text(datos.viajes);
	$('#promedio').text(datos.rating);
	$('#plan').text(datos.plan);
};
function getVehiculo(datos){
	$('#matricula').text(datos.matricula);
	$('#marca').text(datos.marca);
	$('#modelo').text(datos.modelo);
	$('#capacidad').text(datos.capacidad);
};
function getHistorial(datos){

};
function setCerrar(datos){
	localStorage.removeItem('idChofer');
	localStorage.removeItem('nombreChofer');
	window.location = "index.html";
};