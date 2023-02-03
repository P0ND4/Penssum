import Form from "./Form";
import Coupon from "./Coupon";

function Right() {
  return (
    <section className="post-form-container">
      <div>
        <h1 className="post-form-containert-title">CREA UNA PUBLICACIÓN</h1>
      </div>
      <Form />
      <Coupon />
    </section>
  );
}

export default Right;
