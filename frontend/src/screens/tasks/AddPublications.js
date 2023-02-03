import { useSelector } from "react-redux";

function AddPublications({ productLimit, putPost }) {
  const block = useSelector((state) => state.block);
  const products = useSelector((state) => state.products);

  return (
    !block &&
    !productLimit &&
    products.length > 0 && (
      <div className="show-more-products-container">
        <button className="show-more-products" onClick={() => putPost(20)}>
          MOSTRAR MÁS
        </button>
      </div>
    )
  );
}

export default AddPublications;
