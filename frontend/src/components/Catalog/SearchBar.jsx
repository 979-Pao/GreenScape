export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSubmit?.(); }} className="search-bar">
      <input
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder="Buscar por nombre/categoría..."
      />
      <button type="submit" className="btn">Buscar</button>
    </form>
  );
}
