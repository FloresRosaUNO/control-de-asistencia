const form = document.getElementById("asistencia-form");
const tabla = document.querySelector("#registros tbody");
const btnExportar = document.getElementById("exportar");

document.addEventListener("DOMContentLoaded", cargarRegistros);

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const tipo = document.getElementById("tipo").value;
  const observaciones = document.getElementById("observaciones").value.trim();
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString();
  const hora = ahora.toLocaleTimeString();

  let registros = JSON.parse(localStorage.getItem("asistencias")) || [];

  if (tipo === "Entrada") {
    // Guardar entrada como registro nuevo sin salida aún
    registros.push({
      nombre,
      fecha,
      entrada: hora,
      salida: "",
      tiempo: "",
      observaciones
    });
  } else if (tipo === "Salida") {
    // Buscar última entrada sin salida
    const entradaPendiente = [...registros]
      .reverse()
      .find(r => r.nombre === nombre && r.fecha === fecha && !r.salida);

    if (entradaPendiente) {
      entradaPendiente.salida = hora;

      // Calcular tiempo trabajado
      const hEntrada = new Date(`${fecha} ${entradaPendiente.entrada}`);
      const hSalida = new Date(`${fecha} ${hora}`);
      const diffMs = hSalida - hEntrada;

      const minutos = Math.floor(diffMs / 60000);
      const horas = Math.floor(minutos / 60);
      const minutosFinal = minutos % 60;
      entradaPendiente.tiempo = `${horas}h ${minutosFinal}min`;
    } else {
      alert("⚠️ No se encontró una entrada sin salida para esta persona hoy.");
      return;
    }
  }

  localStorage.setItem("asistencias", JSON.stringify(registros));
  renderizarTabla(registros);
  form.reset();
});

function cargarRegistros() {
  const registros = JSON.parse(localStorage.getItem("asistencias")) || [];
  renderizarTabla(registros);
}

function renderizarTabla(registros) {
  tabla.innerHTML = "";
  registros.forEach(r => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${r.nombre}</td>
      <td>${r.fecha}</td>
      <td>${r.entrada || "-"}</td>
      <td>${r.salida || "-"}</td>
      <td>${r.tiempo || "-"}</td>
      <td>${r.observaciones || "-"}</td>
    `;
    tabla.appendChild(fila);
  });
}

btnExportar.addEventListener("click", () => {
  const registros = JSON.parse(localStorage.getItem("asistencias")) || [];
  if (registros.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(registros);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias");

  XLSX.writeFile(workbook, "asistencias.xlsx");
});
