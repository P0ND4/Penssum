import { useSelector } from "react-redux";
import { changeDate } from '../../helpers';
import ReviewProduct from '../../layouts/admin/ReviewProduct';

function Publications() {
  const review = useSelector((state) => state.review);

  return (
    <div>
      <div className="commomStylePadding">
        {review !== null && review.length > 0 ? (
          review.map((product) => {
            return (
              <div key={product._id + product.title.length * 5}>
                <ReviewProduct
                  data={{
                    id: product._id,
                    onwer: product.owner,
                    product,
                    image: `url(${product.linkMiniature})`,
                    dateOfDelivery:
                      product.dateOfDelivery === null
                        ? "No definido"
                        : changeDate(product.dateOfDelivery),
                    mainCategory: product.category,
                    category: product.subCategory,
                    title: product.title.slice(0, 30) + "...",
                    description: product.description.slice(0, 40) + "...",
                    price: product.value
                  }}
                />
              </div>
            );
          })
        ) : (
          <></>
        )}
      </div>
      {(review === null || review.length === 0) && (
        <h1 className="thereAreNoProductsInDashboard">
          NO HAY PUBLICACIONES A REVISAR
        </h1>
      )}
    </div>
  );
}

export default Publications;
