import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="h-[90%] flex items-center justify-around flex-col">
      <Link className="bg-blue-500 w-[70%] h-[10%] flex items-center justify-center" to={'/etat'}>Etat</Link>
      <Link className="bg-blue-500 w-[70%] h-[10%] flex items-center justify-center" to={'/sell'}>sell</Link>
    </div>
  );
};

export default Home;
