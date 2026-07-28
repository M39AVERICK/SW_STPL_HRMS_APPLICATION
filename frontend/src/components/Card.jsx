function Card({ title, value, color }) {
  return (
    <div className={`p-4 rounded-xl text-white ${color} shadow-lg`}>
      <h3 className="text-sm">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default Card;