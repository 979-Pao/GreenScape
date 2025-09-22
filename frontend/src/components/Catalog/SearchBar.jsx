export default function SearchBar({ value, onChange, onSubmit, placeholder }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}
      className="search-bar" style={{ display: "flex", alignItems: "center",  gap: 8,  }}  >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Buscar por nombre/categoría..."}
        style={{ flex: 1, minWidth: 280, width: "auto",  }}  />
      <button
        type="submit" className="btn"  style={{ width: "auto", whiteSpace: "nowrap", padding: "10px 16px", }} >
        Buscar
      </button>
    </form>
  );
}
