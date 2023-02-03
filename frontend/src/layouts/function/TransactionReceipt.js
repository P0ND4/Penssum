import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { saveTransaction, socket } from "../../api";
import Loading from "../../components/Loading";
import swal from "sweetalert";
import Result from "../../screens/function/Result";
import Header from "../../screens/function/Header";
import Options from "../../screens/function/Options";

function TransactionReceipt() {
  const user = useSelector((state) => state.user);

  const [information, setInformation] = useState(null);

  const { post_id } = useParams();
  const transactionDocument = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const getData = window.location.search;
    const urlParams = new URLSearchParams(getData);
    const entries = urlParams.entries();

    let informationObtained = {};

    for (const value of entries)
      informationObtained = { ...informationObtained, [value[0]]: value[1] };

    if (Object.keys(informationObtained).length !== 0)
      setInformation(informationObtained);
  }, [post_id]);

  useEffect(() => {
    if (information !== null) {
      const updateTransaction = async () => {
        const result = await saveTransaction({
          userId: user._id,
          productId: post_id,
          amount: Math.round(parseInt(information.TX_VALUE)),
          transactionId: information.transactionId,
          paymentType: "PSE",
          paymentNetwork: information.pseBank,
        });

        if (result.error) {
          if (result.type === "Product not exists") {
            swal({
              title: "PRODUCTO NO EXISTENTE",
              text: "El producto no existe",
              icon: "error",
              button: "Ok",
            }).then(() => navigate("/"));
          }
        } else socket.emit("received event", user._id);
      };
      updateTransaction();
    }
  }, [information, post_id, navigate, user]);

  return (
    <div className="transactionReceipt-container">
      {information !== null && post_id !== undefined && user !== null ? (
        <div>
          <div ref={transactionDocument}>
            <Header />
            <Result information={information} post_id={post_id} />
          </div>
          <Options
            information={information}
            transactionDocument={transactionDocument}
          />
        </div>
      ) : (
        <Loading margin="auto" />
      )}
    </div>
  );
}

export default TransactionReceipt;