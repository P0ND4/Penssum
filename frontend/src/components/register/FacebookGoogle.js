import { useRef, useEffect, useState } from "react";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

function FacebookGoogle({ title, responseFacebook, responseGoogle }) {
  const [errorGoogle, setErrorGoogle] = useState(false);
  const buttonGoogle = useRef();

  useEffect(() => {
    const google = document.getElementById("google-handler");

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_ID,
        callback: responseGoogle,
      });
      window.google.accounts.id.renderButton(buttonGoogle.current, {
        theme: "outline",
        text: "signup",
      });
    }

    if (google) google.addEventListener("load", () => setErrorGoogle(true));

    return () => setErrorGoogle(false);
  }, [responseGoogle, errorGoogle]);

  return (
    <div className="form-control">
      <h2 className="registerFormTitle">{title}</h2>
      <div className="registration-options">
        <FacebookLogin
          appId={process.env.REACT_APP_FACEBOOK_ID}
          autoLoad={false}
          fields="name,email,picture"
          callback={responseFacebook}
          disableMobileRedirect={true}
          render={(renderProps) => (
            <button id="signup-with-facebook" onClick={renderProps.onClick}>
              <img
                src="/img/icon/facebook_icon.svg"
                alt="facebook"
                className="facebook_icon"
              />{" "}
              FACEBOOK
            </button>
          )}
        />
        <div className="google-zone-form">
          <div ref={buttonGoogle}></div>
        </div>
      </div>
    </div>
  );
}

export default FacebookGoogle;
