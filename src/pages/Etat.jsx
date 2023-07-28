import axios from "axios";
import { useState } from "react";

const Etat = () => {
  const [data, setData] = useState();
  const [camion, setCamion] = useState();
  const senddata = (e) => {
    e.preventDefault();
    axios.get(`http://127.0.0.1:3000/charge/${camion}`).then((res) => {
      setData(res.data);
    });
  };
  return (
    <div className="h-screen w-[100%] flex flex-col gap-2 p-3">
      <div className="w-[100%] flex justify-between ">
        <input
        className="p-2 w-[30%] border outline-none"
        placeholder="البائع"
          onChange={(e) => setCamion(e.target.value)}
          type="text"
          name=""
          id=""
        />
        <input className="p-2 w-[30%] bg-green-200 cursor-pointer"
         onClick={senddata} type="submit" value={'عرض'} />
      </div>

      <table className="w-full text-sm text-left text-gray-500 ">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-3">
              المنتج
            </th>
            <th scope="col" className="px-4 py-3">
              الكمية
            </th>
            <th scope="col" className="px-4 py-3">
              الكمية المتبقية
            </th>
            <th scope="col" className="px-4 py-3">
              الكمية المباعة
            </th>
          </tr>
        </thead>
        <tbody>
          {data
            ? data.map((e) => {
                return (
                  <tr key={e.id} className="bg-white border-b ">
                    <td className="px-6 py-4">{e.produit}</td>
                    <td className="px-6 py-4">{e.qte}</td>
                    <td className="px-6 py-4">{e.qterestant}</td>
                    <td className="px-6 py-4">{e.qteacheter}</td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
    </div>
  );
};

export default Etat;
