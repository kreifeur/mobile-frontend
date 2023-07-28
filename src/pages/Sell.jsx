import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const Sell = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState("");
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [oneproduct, setOneProduct] = useState({});
  const [qte2, setQte] = useState("");
  const [sum, setSum] = useState(0);
  const [versement, setVersement] = useState(0);
  const [client, setClient] = useState("");
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [vendeur, setVendeur] = useState("");
  const [seuil, setSeuil] = useState(0);
  const [benefits, setBenefits] = useState(0);

  useEffect(() => {
    axios.get("http://127.0.0.1:3000/products").then((res) => {
      const productNames = res.data.map((product) => product.name);
      setProductSuggestions(productNames);
    });

    axios.get("http://127.0.0.1:3000/customers").then((res) => {
      const clientNames = res.data.map((client) => client.name);
      setClientSuggestions(clientNames);
    });
  }, []);

  useEffect(() => {
    const initialSum = products.reduce(
      (total, product) => total + product.qte2 * product.price3,
      0
    );
    setSum(initialSum);

    // Recalculate benefits sum whenever products or quantities change
    calculateBenefitsSum(products);
  }, [products]);

  const addproduct = async () => {
    await axios
      .get(`http://127.0.0.1:3000/charge/${product}/${vendeur}`)
      .then((res) => {
        const seuil = res.data[0].qterestant;
        if ( +qte2 <= +seuil) {
          axios.get(`http://127.0.0.1:3000/product/${product}`).then((res) => {
            const newProduct = { ...res.data[0], qte2: qte2 };
            setOneProduct(newProduct);
            setProducts((prevProducts) => {
              const updatedProducts =
                prevProducts.length === 0
                  ? [newProduct]
                  : [...prevProducts, newProduct];
              const newSum = updatedProducts.reduce(
                (total, product) => total + product.qte2 * product.price3,
                0
              );
              setSum(newSum);
              return updatedProducts;
            });
          });
        } else {
          alert("كمية غير كافية");
        }
      });
  };

  const deleteProduct = (index) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      const deletedProduct = updatedProducts.splice(index, 1)[0];
      const newSum = sum - deletedProduct.qte2 * deletedProduct.price3;
      setSum(newSum);
      return updatedProducts;
    });
  };

 

  const enregistrer = () => {
    products.map((e) => {
      axios
        .put(`http://127.0.0.1:3000/${e.id}`, {
          ...e,
          ...{ qte: e.qte - e.qte2 },
        })
        .then((res) => console.log(res));

      axios
        .get(`http://127.0.0.1:3000/charge/${e.name}/${vendeur}`)
        .then((res) => {
          axios
            .put(`http://127.0.0.1:3000/charge/${res.data[0].id}`, {
              ...res.data[0],
              ...{
                qteacheter: +res.data[0].qteacheter + +e.qte2,
                qterestant: res.data[0].qterestant - e.qte2,
              },
            })
            .then((res) => console.log(res));
        });
    });
    axios
      .post("http://127.0.0.1:3000/addvente", {
        vendeur: vendeur,
        client: client,
        total: sum,
        versement: versement,
        diff: sum - versement,
        total_benefit: benefits,
      })
      .then((res) => console.log(res));

    axios
      .get(`http://127.0.0.1:3000/customer/${client}`)
      .then((res) =>
        axios
          .put(`http://127.0.0.1:3000/customer/${res.data[0].id}`, {
            ...res.data[0],
            ...{ gain: +res.data[0].gain + +(sum - versement) },
          })
          .then((x) => console.log(x))
      );

      axios.post('http://127.0.0.1:3000/facture',
      
      {'products':products ,'total':sum , 'versement':versement , 'vendeur':vendeur , 'client':client},{
        responseType: 'blob', // Set response type to blob
      }).then((response) =>{
        // Create a Blob from the response data
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

        // Create a URL for the Blob
        const url = window.URL.createObjectURL(pdfBlob);

        // Create an anchor element and set its attributes to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'receipt.pdf';
        document.body.appendChild(a);
        a.click();

        // Remove the anchor element and revoke the URL
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error('Error generating receipt:', error));


      
  };

  // Function to calculate benefits for each product and update the state
  const calculateBenefitsSum = (productList) => {
    const newBenefits = productList.reduce((totalBenefits, product) => {
      const benefit = product.qte2 * (product.price3 - product.date); // You might need to change this calculation based on your actual data structure.
      return totalBenefits + benefit;
    }, 0);
    setBenefits(newBenefits);
  };

  const productPlaceholder = { label: "المنتج", value: null };
  const clientPlaceholder = { label: "الزبون", value: null };

  return (
    <div className="flex flex-col justify-center gap-2 items-center h-[100%]">
      <input
        placeholder="البائع"
        className="border p-2 w-[90%] outline-none"
        onChange={(e) => setVendeur(e.target.value)}
        type="text"
      />

      <Select
        options={[
          productPlaceholder,
          ...productSuggestions.map((productName) => ({
            label: productName,
            value: productName,
          })),
        ]}
        value={
          product ? { label: product, value: product } : productPlaceholder
        }
        onChange={(selectedOption) =>
          setProduct(selectedOption ? selectedOption.value : "")
        }
        styles={{
          control: (provided) => ({
            ...provided,
            width: "300px", // You can adjust this value as needed
          }),
        }}
      />

      <input
        placeholder="الكمية"
        className="border p-2 w-[90%] outline-none"
        onChange={(e) => setQte(e.target.value)}
        type="text"
      />
      <input
        className="bg-black text-white p-2 outline-none w-[90%] cursor-pointer"
        onClick={addproduct}
        value="اضافة"
        type="submit"
      />

      {products.map((e, index) => {
        return (
          <div className="w-[100%] p-2 flex justify-around" key={index}>
            <div className="w-[10%] text-center">{e.name}</div>
            <div className="w-[10%] text-center">{e.price3}</div>
            <div className="w-[10%] text-center">{e.qte2}</div>
            <div className="w-[10%] text-center">{e.qte2 * e.price3}</div>
            <button
              className="w-[30px] bg-red-600 p-1 rounded text-white cursor-pointer"
              onClick={() => deleteProduct(index)}
            >
              X
            </button>
          </div>
        );
      })}

      <div className="w-[90%] flex flex-col gap-3 items-center p-2 bg-gray-100">
        <div className="font-bold w-[90%] text-center">Total: {sum}</div>


        <Select
          options={[
            clientPlaceholder,
            ...clientSuggestions.map((clientName) => ({
              label: clientName,
              value: clientName,
            })),
          ]}
          value={client ? { label: client, value: client } : clientPlaceholder}
          onChange={(selectedOption) =>
            setClient(selectedOption ? selectedOption.value : "")
          }
          styles={{
            control: (provided) => ({
              ...provided,
              width: "300px", // You can adjust this value as needed
            }),
          }}
        />

        <input
          placeholder="تم دفع"
          className="border p-2 w-[90%] outline-none"
          onChange={(e) => setVersement(e.target.value)}
          type="number"
        />
      </div>

      <input
        className="bg-black text-white p-2 outline-none w-[90%] cursor-pointer"
        onClick={enregistrer}
        type="submit"
        value={"ارسال"}
      />
    </div>
  );
};

export default Sell;
