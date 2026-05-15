const Card = ({ children }) => {
  return (
    <div className="bg-white rounded-none shadow-sm border p-5">
      {children}
    </div>
  );
};

export default Card;
