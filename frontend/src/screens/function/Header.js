import { useSelector } from "react-redux";

function Header() {
  const user = useSelector(state => state.user);

  return (
    <div className="transactionReceipt-title">
      <div style={{ display: "flex", alignItems: "center" }}>
        <i
          className="fa fa-check"
          style={{
            color: "#3282B8",
            fontSize: "40px",
            margin: "0 10px",
          }}
        ></i>
        <h1>
          Estimad@ {user.firstName === "" ? user.username : user.firstName}
        </h1>
      </div>
      <p>
        A continuación aparecen los datos del adelanto de la publicación. !
        FELICIDADES !
      </p>
      <div className="transactionReceipt-title-logo">
        <img src="/img/penssum-transparent.png" alt="icon-logo" />
        <h1>PENSSUM</h1>
      </div>
    </div>
  );
}

export default Header;
