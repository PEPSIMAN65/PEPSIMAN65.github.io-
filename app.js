    // --- 1. DATOS DE PRODUCTOS DE EJEMPLO ---
    const productos = [
      { id: 1, nombre: "Reloj Minimalista Steel", categoria: "Accesorios", precio: 149.00, imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" },
      { id: 2, nombre: "Auriculares Inalámbricos", categoria: "Tecnología", precio: 199.50, imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
      { id: 3, nombre: "Teclado Mecánico Compacto", categoria: "Tecnología", precio: 120.00, imagen: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80" },
      { id: 4, nombre: "Taza Cerámica Artesanal", categoria: "Hogar", precio: 28.00, imagen: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80" },
      { id: 5, nombre: "Billetera de Cuero Slim", categoria: "Accesorios", precio: 45.00, imagen: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80" },
      { id: 6, nombre: "Tapete de Escritorio Premium", categoria: "Hogar", precio: 35.00, imagen: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80" }
    ];

    // Estado global de la aplicación
    let carrito = [];
    let categoriaActual = "Todos";
    let busquedaTexto = "";
    let temporizadorAviso;

    // --- 2. FUNCIONES BASE DEL CÓDIGO PROPORCIONADO ---

    // Notificaciones emergentes
    function notificar(mensaje) {
      const caja = document.querySelector("#notificacion");
      if (!caja) return;
      caja.textContent = mensaje;
      caja.classList.add("visible");
      clearTimeout(temporizadorAviso);
      temporizadorAviso = setTimeout(() => caja.classList.remove("visible"), 2400);
    }

    // Sintetizador de sonido por Web Audio API
    function sonido(frecuencia = 660) {
      const AudioContexto = window.AudioContext || window.webkitAudioContext;
      if (!AudioContexto) return;
      try {
        const contexto = new AudioContexto();
        const oscilador = contexto.createOscillator();
        const volumen = contexto.createGain();

        oscilador.type = "sine";
        oscilador.frequency.value = frecuencia;
        volumen.gain.setValueAtTime(0.07, contexto.currentTime);
        volumen.gain.exponentialRampToValueAtTime(0.001, contexto.currentTime + 0.15);

        oscilador.connect(volumen);
        volumen.connect(contexto.destination);

        oscilador.start();
        oscilador.stop(contexto.currentTime + 0.15);
        oscilador.onended = () => contexto.close();
      } catch (e) {
        console.warn("Audio Context bloqueado por política de navegador hasta interacción.");
      }
    }

    // Persistencia en LocalStorage
    function guardarCarrito() {
      localStorage.setItem("carritoTienda", JSON.stringify(carrito));
      actualizarContador();
    }

    function recuperarCarrito() {
      try {
        const datos = JSON.parse(localStorage.getItem("carritoTienda") || "[]");
        carrito = Array.isArray(datos) ? datos.filter(item => productos.some(producto => producto.id === item.id)) : [];
      } catch (error) {
        carrito = [];
        console.warn("Carrito guardado no válido", error);
      }
    }

    function actualizarContador() {
      const elContador = document.querySelector("#contador");
      if (elContador) {
        const totalItems = carrito.reduce((acc, curr) => acc + curr.cantidad, 0);
        elContador.textContent = totalItems;
      }
    }

    // --- 3. LÓGICA Y RENDERIZADO DEL CATÁLOGO ---

    function renderizarCategorias() {
      const contenedor = document.querySelector("#contenedorCategorias");
      const categorias = ["Todos", ...new Set(productos.map(p => p.categoria))];

      contenedor.innerHTML = categorias.map(cat => `
        <button 
          onclick="filtrarPorCategoria('${cat}')" 
          class="px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${categoriaActual === cat ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'}"
        >
          ${cat}
        </button>
      `).join('');
    }

    function filtrarPorCategoria(cat) {
      categoriaActual = cat;
      renderizarCategorias();
      renderizarProductos();
    }

    function renderizarProductos() {
      const grid = document.querySelector("#gridProductos");
      const sinResultados = document.querySelector("#sinResultados");

      // Filtrado por categoría y búsqueda
      const filtrados = productos.filter(p => {
        const coincideCat = categoriaActual === "Todos" || p.categoria === categoriaActual;
        const coincideText = p.nombre.toLowerCase().includes(busquedaTexto.toLowerCase()) || 
                             p.categoria.toLowerCase().includes(busquedaTexto.toLowerCase());
        return coincideCat && coincideText;
      });

      if (filtrados.length === 0) {
        grid.innerHTML = "";
        sinResultados.classList.remove("hidden");
        return;
      }

      sinResultados.classList.add("hidden");

      // Generar HTML de productos usando las etiquetas <article> especificadas
      grid.innerHTML = filtrados.map(p => `
        <article class="bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div class="h-56 overflow-hidden bg-zinc-100 relative">
              <img src="${p.imagen}" alt="${p.nombre}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" onerror="this.src='https://placehold.co/500x500/f4f4f5/a1a1aa?text=Producto'">
              <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] uppercase font-semibold text-zinc-600 tracking-wider">
                ${p.categoria}
              </span>
            </div>
            <div class="p-5">
              <h3 class="text-base font-medium text-zinc-900">${p.nombre}</h3>
              <p class="text-zinc-500 text-sm mt-1">$${p.precio.toFixed(2)}</p>
            </div>
          </div>
          <div class="px-5 pb-5 pt-0">
            <button 
              onclick="agregarAlCarrito(${p.id})" 
              type="button" 
              class="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium uppercase tracking-wider rounded-lg flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Agregar al carrito
            </button>
          </div>
        </article>
      `).join('');
    }

    // --- 4. ACCIONES DEL CARRITO ---

    function agregarAlCarrito(idProducto) {
      const prod = productos.find(p => p.id === idProducto);
      if (!prod) return;

      const itemExistente = carrito.find(item => item.id === idProducto);
      if (itemExistente) {
        itemExistente.cantidad++;
      } else {
        carrito.push({ ...prod, cantidad: 1 });
      }

      guardarCarrito();
      sonido(780);
      notificar("Producto agregado al carrito");
      renderizarCarrito();
    }

    function cambiarCantidad(idProducto, cambio) {
      const item = carrito.find(i => i.id === idProducto);
      if (!item) return;

      item.cantidad += cambio;
      if (item.cantidad <= 0) {
        removerDelCarrito(idProducto);
        return;
      }

      guardarCarrito();
      renderizarCarrito();
    }

    function removerDelCarrito(idProducto) {
      carrito = carrito.filter(item => item.id !== idProducto);
      guardarCarrito();
      sonido(420);
      notificar("Producto retirado");
      renderizarCarrito();
    }

    function vaciarCarrito() {
      if (carrito.length === 0) return;
      carrito = [];
      guardarCarrito();
      sonido(330);
      notificar("Carrito vaciado");
      renderizarCarrito();
    }

    function renderizarCarrito() {
      const lista = document.querySelector("#listaCarrito");
      const subtotalEl = document.querySelector("#subtotalCarrito");
      const totalEl = document.querySelector("#totalCarrito");

      if (carrito.length === 0) {
        lista.innerHTML = `
          <div class="text-center py-12 text-zinc-400">
            <svg class="w-12 h-12 mx-auto stroke-1 mb-3 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <p class="text-sm">Tu carrito está vacío</p>
          </div>
        `;
        subtotalEl.textContent = "$0.00";
        totalEl.textContent = "$0.00";
        return;
      }

      let subtotal = 0;
      lista.innerHTML = carrito.map(item => {
        const itemSubtotal = item.precio * item.cantidad;
        subtotal += itemSubtotal;
        return `
          <div class="flex items-center justify-between gap-4 p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
            <div class="flex items-center gap-3">
              <img src="${item.imagen}" alt="${item.nombre}" class="w-12 h-12 object-cover rounded-md bg-zinc-200">
              <div>
                <h4 class="text-xs font-medium text-zinc-800 line-clamp-1">${item.nombre}</h4>
                <p class="text-xs text-zinc-500 mt-0.5">$${item.precio.toFixed(2)}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center border border-zinc-200 rounded-md bg-white">
                <button onclick="cambiarCantidad(${item.id}, -1)" class="px-2 py-0.5 text-zinc-600 hover:bg-zinc-100 text-xs font-bold">-</button>
                <span class="px-2 text-xs font-medium text-zinc-800">${item.cantidad}</span>
                <button onclick="cambiarCantidad(${item.id}, 1)" class="px-2 py-0.5 text-zinc-600 hover:bg-zinc-100 text-xs font-bold">+</button>
              </div>
              <button onclick="removerDelCarrito(${item.id})" class="text-zinc-400 hover:text-red-500 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        `;
      }).join('');

      subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      totalEl.textContent = `$${subtotal.toFixed(2)}`;
    }

    // --- 5. CONTROL DEL PANEL CARRITO Y VIDEO MULTIMEDIA ---

    const overlay = document.querySelector("#overlayCarrito");
    const panelCarrito = document.querySelector("#panelCarrito");

    function abrirCarrito() {
      overlay.classList.remove("opacity-0", "pointer-events-none");
      panelCarrito.classList.remove("translate-x-full");
    }

    function cerrarCarrito() {
      overlay.classList.add("opacity-0", "pointer-events-none");
      panelCarrito.classList.add("translate-x-full");
    }

    // --- INITIALIZATION & EVENT LISTENERS ---
    window.addEventListener("DOMContentLoaded", () => {
      // Cargar persistencia
      recuperarCarrito();
      actualizarContador();

      // Renderizar catálogo
      renderizarCategorias();
      renderizarProductos();
      renderizarCarrito();

      // Escuchar eventos de Búsqueda
      document.querySelector("#inputBusqueda").addEventListener("input", (e) => {
        busquedaTexto = e.target.value;
        renderizarProductos();
      });

      // Apertura/Cierre de Carrito
      document.querySelector("#btnAbrirCarrito").addEventListener("click", abrirCarrito);
      document.querySelector("#btnCerrarCarrito").addEventListener("click", cerrarCarrito);
      overlay.addEventListener("click", cerrarCarrito);

      // Botón Vaciar
      document.querySelector("#btnVaciarCarrito").addEventListener("click", vaciarCarrito);

      // Checkout Simulación
      document.querySelector("#btnCheckout").addEventListener("click", () => {
        if (carrito.length === 0) {
          notificar("El carrito está vacío");
          return;
        }
        carrito = [];
        guardarCarrito();
        sonido(880);
        notificar("¡Compra realizada con éxito!");
        renderizarCarrito();
        cerrarCarrito();
      });

      // Control del Video Demonstrativo (según código del usuario)
      const video = document.querySelector("#videoTienda");
      document.querySelector("#reproducirVideo").addEventListener("click", () => {
        video.play().catch(() => notificar("Video no disponible localmente"));
      });
      document.querySelector("#pausarVideo").addEventListener("click", () => video.pause());
    });
