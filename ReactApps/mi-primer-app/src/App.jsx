import Saludo from './Saludo.jsx' // Importante traer el import

function App() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Hola mundo esto es una prueba</h1>
      <h2>Mendoza Sánchez Javier Alberto</h2>
      <p>2022640167</p>
      <Saludo nombre='Noe Sierra' tipo='Noches'/>
    </div>
  )
}

export default App