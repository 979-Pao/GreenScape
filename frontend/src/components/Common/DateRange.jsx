export default function DateRange({ start, end, setStart, setEnd }) {
return (
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
<label>Desde <input type="date" value={start} onChange={e => setStart(e.target.value)} /></label>
<label>Hasta <input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label>
</div>
);
}