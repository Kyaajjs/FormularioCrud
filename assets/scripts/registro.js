const API = "https://fi.jcaguilar.dev/v1/escuela/persona";


const dlgPersona = document.getElementById("dlg-persona");
const dlgConfirm = document.getElementById("dlg-confirm");
const form = document.getElementById("form-persona");
const tabla = document.getElementById("tabla-personas");
const btnNuevo = document.getElementById("btn-nuevo");


btnNuevo.addEventListener("click", () => abrirDialogoAgregar());
document.getElementById("btn-cancel").addEventListener("click", () => dlgPersona.close());
document.getElementById("btn-no").addEventListener("click", () => dlgConfirm.close());
form.addEventListener("submit", guardarPersona);

cargarPersonas();


async function cargarPersonas() {
  tabla.innerHTML = "<tr><td colspan='7'>Cargando...</td></tr>";
  try {
    const resp = await fetch(API);
    const data = await resp.json();

    tabla.innerHTML = "";

    data.forEach(p => {
      const id = p.id_persona ?? p.id ?? "";
      const rol = rolLabel(p.id_rol);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${id}</td>
        <td>${p.nombre}</td>
        <td>${p.apellido}</td>
        <td>${p.sexo}</td>
        <td>${p.fh_nac}</td>
        <td>${p.rol}</td>
        <td>
          <button class="btn btn-warning btn-sm">Editar</button>
          <button class="btn btn-danger btn-sm">Eliminar</button>
        </td>
      `;

      tr.querySelector(".btn-warning").addEventListener("click", () => abrirDialogoEditar(p));
      tr.querySelector(".btn-danger").addEventListener("click", () => confirmarEliminar(id));

      tabla.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tabla.innerHTML = "<tr><td colspan='7'>Error al cargar datos</td></tr>";
  }
}

function rolLabel(id) {
  switch (Number(id)) {
    case 1: return "Alumno";
    case 2: return "Profesor";
    case 3: return "Administrador";
    case 4: return "Otro";
    default: return "—";
  }
}

function abrirDialogoAgregar() {
  form.reset();
  document.getElementById("id_persona").value = "";
  document.getElementById("dlg-title").textContent = "Agregar Persona";
  dlgPersona.showModal();
}

function abrirDialogoEditar(p) {
  document.getElementById("dlg-title").textContent = "Editar Persona";
  document.getElementById("id_persona").value = p.id_persona ?? p.id ?? "";
  document.getElementById("A1").value = p.nombre ?? "";
  document.getElementById("A2").value = p.apellido ?? "";
  document.getElementById("sexo").value = p.sexo ?? "H";
  document.getElementById("fecha").value = p.fh_nac ?? "";
  document.getElementById("id_rol").value = p.id_rol ?? "1";
  dlgPersona.showModal();
}

async function guardarPersona(e) {
  e.preventDefault();
  const id = document.getElementById("id_persona").value;
  const body = {
    nombre: A1.value.trim(),
    apellido: A2.value.trim(),
    sexo: sexo.value,
    fh_nac: fecha.value,
    id_rol: parseInt(id_rol.value)
  };

  try {
    let resp;
    if (id) {
      body.id_persona = parseInt(id);
      resp = await fetch(API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } else {
      resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }

    if (!resp.ok) throw new Error("HTTP " + resp.status);
    dlgPersona.close();
    await cargarPersonas();
  } catch (err) {
    alert("Error al guardar: " + err);
  }
}

function confirmarEliminar(id) {
  dlgConfirm.showModal();
  const btnOk = document.getElementById("btn-ok");
  btnOk.onclick = async () => {
    try {
      const resp = await fetch(API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_persona: parseInt(id) })
      });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      dlgConfirm.close();
      await cargarPersonas();
    } catch (err) {
      alert("Error al eliminar: " + err);
    }
  };
}
