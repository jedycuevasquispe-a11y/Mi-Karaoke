$(document).ready(function () {

    // 1. NAVEGACIÓN ENTRE PANTALLAS
    function cambiarPantalla(destino) {

        const pantalla = $('.page[data-page="' + destino + '"]');

        if (!pantalla.length) {
            console.error("No existe la pantalla:", destino);
            return;
        }

        $(".page").removeClass("active").hide();

        pantalla.addClass("active").fadeIn(300);

        $(".nav-link").removeClass("active");

        $('.nav-link[data-page="' + destino + '"]')
            .addClass("active");

        if (window.innerWidth <= 600) {
            $("#menu").stop(true, true).slideUp(200);
        }

        window.scrollTo(0, 0);
    }

    // Botones del menú y tarjetas
    $(document).on("click", "[data-page]", function (e) {

        if ($(this).is(".page")) return;

        e.preventDefault();

        cambiarPantalla($(this).attr("data-page"));

    });

    // Mostrar inicio al cargar
    $(".page").hide();
    cambiarPantalla("inicio");


    // 2. MENÚ MÓVIL
    $("#menuBtn").on("click", function () {
        $("#menu").stop(true, true).slideToggle(300);
    });


    // 3. MODO OSCURO
    function aplicarTema(oscuro) {

        $("body").toggleClass("dark", oscuro);

        $("#themeToggle").text(oscuro ? "☀" : "☾");

        localStorage.setItem(
            "tema",
            oscuro ? "oscuro" : "claro"
        );
    }

    aplicarTema(localStorage.getItem("tema") === "oscuro");

    $("#themeToggle").on("click", function () {
        aplicarTema(!$("body").hasClass("dark"));
    });


    // 4. CARRUSEL
    let indice = 0;
    const slides = $(".carousel-slide");
    const cantidad = slides.length;

    function mostrarSlide(n) {

        if (!cantidad) return;

        indice = (n + cantidad) % cantidad;

        slides.removeClass("active")
            .eq(indice).addClass("active");

        $("#carouselDots button")
            .removeClass("active")
            .eq(indice).addClass("active");
    }

    $("#carouselDots").empty();

    slides.each(function (i) {
        $("#carouselDots").append(
            $("<button>", {
                type: "button",
                "aria-label": "Imagen " + (i + 1)
            })
        );
    });

    mostrarSlide(0);

    $("#nextSlide").on("click", function () {
        mostrarSlide(indice + 1);
    });

    $("#prevSlide").on("click", function () {
        mostrarSlide(indice - 1);
    });

    $("#carouselDots").on("click", "button", function () {
        mostrarSlide($(this).index());
    });

    setInterval(function () {
        if ($("#inicio").hasClass("active")) {
            mostrarSlide(indice + 1);
        }
    }, 5000);


    // 5. FILTRO DE CANCIONES
    let categoria = "Todas";

    function filtrarCanciones() {

        let texto = $("#searchSong").val().toLowerCase();
        let encontrados = 0;

        $(".song").each(function () {

            let nombre = String($(this).data("search")).toLowerCase();
            let tipo = $(this).data("category");

            let coincideTexto = nombre.includes(texto);

            let coincideTipo =
                categoria === "Todas" || categoria === tipo;

            if (coincideTexto && coincideTipo) {
                $(this).stop(true, true).fadeIn(200);
                encontrados++;
            } else {
                $(this).hide();
            }
        });

        $("#noSongs").prop("hidden", encontrados !== 0);
    }

    $("#searchSong").on("input", filtrarCanciones);

    $(".filter").on("click", function () {

        $(".filter").removeClass("active");
        $(this).addClass("active");

        categoria = $(this).data("filter");

        filtrarCanciones();
    });


    // 6. SELECCIÓN DE CABINAS
    $(".choose").on("click", function () {

        if ($(this).prop("disabled")) return;

        let precio = $(this).data("price");
        let nombre = $(this).data("name");

        $("#cabin").val(precio);

        cambiarPantalla("reservas");

        $("#cabin option:selected").text(
            nombre + " - Bs " + precio
        );

        calcularTotal();
    });


    // 7. CALCULAR PRECIO
    function calcularTotal() {

        let precio = Number($("#cabin").val()) || 0;
        let horas = Number($("#hours").val()) || 0;

        let total = precio * horas;

        $("#total").text(total);

        return total;
    }

    $("#cabin, #hours").on("input change", calcularTotal);


    // 8. VALIDAR FORMULARIO
    function validarFormulario() {

        let correcto = true;

        let nombre = $("#name").val().trim();
        let celular = $("#phone").val().trim();
        let cabina = $("#cabin").val();
        let horas = Number($("#hours").val());

        function error(id, mensaje) {

            $(id).addClass("invalid");

            $(id + "Error").text(mensaje);

            correcto = false;
        }

        $(".error").text("");
        $(".invalid").removeClass("invalid");

        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,60}$/.test(nombre)) {
            error("#name", "Escribe un nombre válido.");
        }

        if (!/^[67][0-9]{7}$/.test(celular)) {
            error("#phone", "Ingresa un celular boliviano de 8 dígitos.");
        }

        if (cabina !== "40" && cabina !== "60") {
            error("#cabin", "Selecciona una cabina disponible.");
        }

        if (!Number.isInteger(horas) || horas < 1 || horas > 6) {
            error("#hours", "Selecciona entre 1 y 6 horas.");
        }

        return correcto;
    }

    $("#name, #phone, #cabin, #hours").on("input change", function () {
        $(this).removeClass("invalid");
        $("#" + this.id + "Error").text("");
        calcularTotal();
    });


    // 9. CONFIRMACIÓN DE RESERVA
    let contador;
    let segundos = 30;

    $("#bookingForm").on("submit", function (e) {

        e.preventDefault();

        if (!validarFormulario()) {
            mostrarMensaje("Revisa los datos del formulario.");
            return;
        }

        $("#resName").text($("#name").val());
        $("#resCabin").text($("#cabin option:selected").text());
        $("#resHours").text($("#hours").val());
        $("#resTotal").text(calcularTotal());

        $("#modal").css("display", "grid").hide().fadeIn(300);

        iniciarTemporizador();
    });


    // 10. TEMPORIZADOR
    function iniciarTemporizador() {

        clearInterval(contador);

        segundos = 30;
        $("#timer").text("00:30");

        contador = setInterval(function () {

            segundos--;

            $("#timer").text(
                "00:" + String(segundos).padStart(2, "0")
            );

            if (segundos <= 0) {
                cerrarModal();
                mostrarMensaje("El tiempo de confirmación terminó.");
            }

        }, 1000);
    }


    // 11. CERRAR MODAL
    function cerrarModal() {

        clearInterval(contador);
        $("#modal").fadeOut(300);
    }

    $("#closeModal, #cancelBtn").on("click", cerrarModal);


    // 12. CONFIRMAR
    $("#confirmBtn").on("click", function () {

        cerrarModal();

        mostrarMensaje("¡Reserva de demostración confirmada!");

        $("#bookingForm")[0].reset();

        $(".error").text("");
        $(".invalid").removeClass("invalid");

        calcularTotal();
    });


    // 13. MENSAJE EMERGENTE
    function mostrarMensaje(mensaje) {

        $("#toast")
            .stop(true, true)
            .text(mensaje)
            .slideDown(300)
            .delay(3000)
            .fadeOut(500);
    }

    calcularTotal();

});