export default function TablePreview({ columns, rows }) {
  if (!columns || !rows) return null;
  return (
    <table border="1" cellPadding="6" style={{ marginTop: 10, borderCollapse: "collapse" }}>
      <thead>
        <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{columns.map((c) => <td key={c}>{r[c]}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}
