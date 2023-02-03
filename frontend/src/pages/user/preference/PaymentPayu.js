import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changePreferenceValue } from "../../../api";
import { save } from "../../../features/user/userSlice";
import swal from "sweetalert";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function PaymentPayu() {
  const user = useSelector(state => state.user);

  const [bankData, setBankData] = useState({
    bank: user.bankData.bank,
    accountNumber: user.bankData.accountNumber,
    accountType: user.bankData.accountType,
  });

  const dispatch = useDispatch();

  const bankDataValueChange = async () => {
    const error = document.querySelector(".field_value-error-handler");
    error.classList.remove("showError");
  
    if (
      /^[a-zA-ZÀ-ÿ-0-9\u00f1\u00d1\s|!:,.;?¿$]{0,80}$/.test(bankData.bank) &&
      /^[0-9]{0,50}$/.test(bankData.accountNumber)
    ) {
      await changePreferenceValue({
        id: cookies.get("id"),
        name: "bankData",
        value: bankData,
      });
  
      swal({
        title: "Datos actualizados",
        text: "Los datos han sido actualizados correctamente.",
        icon: "success",
        timer: "2000",
        button: false,
      });
  
      const data = {
        ...user,
        bankData,
      };
      dispatch(save(data))
    } else error.classList.add("showError");
  };

  return (
    <div className="commomStylePadding">
      <form onSubmit={(e) => e.preventDefault()} className="payment_payu-form">
        <div className="form-control">
          <input
            type="text"
            placeholder="Banco"
            value={bankData.bank}
            onChange={(e) => setBankData({ ...bankData, bank: e.target.value })}
          />
        </div>
        <div className="form-control">
          <input
            type="number"
            placeholder="Numero de cuenta"
            value={bankData.accountNumber}
            onChange={(e) =>
              setBankData({
                ...bankData,
                accountNumber: e.target.value,
              })
            }
            maxLength="50"
          />
        </div>
        <div className="form-control">
          <select
            id="selectAccountType-preference"
            defaultValue={bankData.accountType}
            onChange={(e) =>
              setBankData({ ...bankData, accountType: e.target.value })
            }
          >
            <option value="selectAccountType" hidden>
              -- Tipo de cuenta --
            </option>
            <option value="Ahorro">Ahorro</option>
            <option value="Corriente">Corriente</option>
          </select>
        </div>
        <p
          className="field field_value-error-handler"
          style={{
            textAlign: "center",
            background: "#d10b0b",
            padding: "6px",
            borderRadius: "8px",
            color: "#FFFFFF",
          }}
        >
          Rellene los campos de forma correcta.
        </p>
        <div className="form-control">
          <button
            id="typeOfAccound-preference-save"
            onClick={() => bankDataValueChange()}
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default PaymentPayu;
