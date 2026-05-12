// src/Saludo.jsx
function Saludo(props) {
  return (
    <div style={{ padding: '20px', borderRadius: '8px' }}>
      <h2>¡Buenos días {props.nombre}!</h2>
      <p>Bienvenido a la sesión de hoy de Aplicaciones Distribuidas.</p>
    </div>
  );
}

export default Saludo;