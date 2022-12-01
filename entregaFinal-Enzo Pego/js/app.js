const carrito = document.querySelector("#carrito")
const contenedorCarrito = document.querySelector("#lista-carrito tbody")
const vaciarCarritoBtn = document.querySelector("#vaciar-carrito")
const listaCursos = document.querySelector("#lista-cursos")
const pagarBtn = document.querySelector("#pagar")

let articulosCarrito = []

fetch("./data/cursos.json")
  .then((cursos) => cursos.json())
  .then((cursos) => {

    let bodyCursos = document.querySelector("#lista-cursos")
    let contador = 1

    let cards = '<div class="row">'

    for(let curso of cursos){
                      
        cards += 
        `<div class="four columns">
            <div class="card">
                <img src="${curso.imagen}" class="imagen-curso u-full-width">
                <div class="info-card">
                    <h4>${curso.nombre}</h4>
                    <p>${curso.autor}</p>
                    <img src="${curso.calificacion}">
                    <p class="precio">$${curso.precio}  <span class="u-pull-right ">$${curso.precioOferta}</span></p>
                    <a href="#" class="u-full-width button-primary button input agregar-carrito" data-id="${curso.id}">Agregar Al Carrito</a>
                </div>
            </div>
        </div>`  
        
        if(contador % 3 == 0 ){
            cards += '</div>'      
            cards += '<div class="row">'     
        } 

        contador++
    }    
    bodyCursos.innerHTML += cards   
  })
  .catch((error)=> alert("Algo salió mal"))

registrarEventListeners();
function registrarEventListeners() {
  //Cuando agregas un curso presionado "Agregar al Carrito"
  listaCursos.addEventListener("click", agregarCurso)

  // Pago total
  pagarBtn.addEventListener("click", pagoTotal)

  //Elimina articulos del carrito
  carrito.addEventListener("click", borarCurso)

  // Vaciar el carrito
  vaciarCarritoBtn.addEventListener("click", () => {
    articulosCarrito = [];
    localStorage.setItem("carrito", []);
    limpiarHTML();
  });

  // Muestra cursos de localStorage
  document.addEventListener("DOMContentLoaded", () => {

    if(localStorage.getItem("carrito").length > 0){
        articulosCarrito = JSON.parse(localStorage.getItem("carrito"))
        carritoHTML();
    }    
  });
}

function agregarCurso(evento) {
  evento.preventDefault();

  if (evento.target.classList.contains("agregar-carrito")) {
    const cursoElejido = evento.target.parentElement.parentElement
    datosCurso(cursoElejido);
  }
}

// Elimina cursos del carrito
function borarCurso(evento) {
  if (evento.target.classList.contains("borrar-curso")) {
    const cursoElejidoId = evento.target.getAttribute("data-id")

    articulosCarrito.forEach((cursoElejido) => {
      if (cursoElejido.id == cursoElejidoId) {
        if (cursoElejido.cantidad > 1) {
          cursoElejido.cantidad--;

          // Muestra la nueva cantidad en el HTML
          carritoHTML();
        } else {
          articulosCarrito = articulosCarrito.filter(
            (cursoElejido) => cursoElejido.id !== cursoElejidoId
          );

          // Llamamos de nuevo la función para que cuando cantidad sea menor a 1  muestre el carrito vacio
          carritoHTML();
        }
      }
    });
  }
}

//Lee el contenido del HTML al que le damos click y extrae la información del curso

function datosCurso(cursoElejido) {
  //Crear un objeto con el contenido del curso actual
  const infoCurso = {
    imagen: cursoElejido.querySelector("img").src,
    titulo: cursoElejido.querySelector("h4").textContent,
    precio: parseFloat(
      cursoElejido.querySelector("span").textContent.replace("$", "")
    ),
    id: cursoElejido.querySelector("a").getAttribute("data-id"),
    cantidad: 1,
  };

 
  // Notifica que el producto fue agregado al carrito

  const Toast = Swal.mixin({
    toast: false,
    position: "center",
    width: "25%",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: "success",
    title: "<strong>Producto agregado al carrito</strong>",
  });

  // Revisa si el articulo ya existe en el carrito
  let articuloExiste = false;

  if (articulosCarrito != null) {
    articuloExiste = articulosCarrito.some(
      (cursoElejido) => cursoElejido.id == infoCurso.id
    );
  }

  if (articuloExiste) {
    const curosElejidos = articulosCarrito.map((cursoElejido) => {
      if (cursoElejido.id == infoCurso.id) {
        cursoElejido.cantidad++;
        return cursoElejido;
      } else {
        return cursoElejido;
      }
    });
    articulosCarrito = [...curosElejidos];
  } else {
    articulosCarrito = [...articulosCarrito, infoCurso];
  }

  carritoHTML();
}

function limpiarCarrito() {
  localStorage.setItem("carrito", [])
  articulosCarrito = []
}

// Muestra el carrito de compras en el HTML

function carritoHTML() {
  // Limpiar el HTML
  limpiarHTML();

  // Recorre el carrito y genera el HTML
  articulosCarrito.forEach((cursoElejido) => {
    const row = document.createElement("tr")
    row.innerHTML = `

            <td>
               <img src = ${cursoElejido.imagen} width = 120 >
            </td>

            <td>
                ${cursoElejido.titulo}
            </td>

            <td>
                ${cursoElejido.precio}
            </td>

            <td>
                ${cursoElejido.cantidad} 
            </td>

            <td>
               <a href = "#" class = "borrar-curso" data-id= ${cursoElejido.id}> x </a>
            </td>
   
        `;

    //  Agrega el HTML del carrito en el tbody
    contenedorCarrito.appendChild(row)
  });

  sincronizarStorage();
  // Agrega productos al storage
  function sincronizarStorage() {
    localStorage.setItem("carrito", JSON.stringify(articulosCarrito))
  }
}

// Calcula el total a pagar
function pagoTotal() {
  const total = articulosCarrito.reduce(
    (acc, el) => acc + el.precio * el.cantidad,
    0
  );

  if (total > 0) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: `<strong>El total de su compra es de $ ${total} <br> Desea continuar?<br/>`,
        icon: "info",
        width: "35%",
        showCancelButton: true,
        confirmButtonText: "ACEPTAR!!",
        cancelButtonText: "CANCELAR",
        reverseButtons: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          swalWithBootstrapButtons.fire(
            "Listo! Pago realizado con éxito",
            "",
            "success"
          );

          // Si se confirma el pago se vacia el carrito
          limpiarHTML();
          limpiarCarrito();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire("Pago cancelado", "", "error");
        }
      });
  }
}

// Elimina los cursos del tbody
function limpiarHTML() {
  contenedorCarrito.innerHTML = "";
}
