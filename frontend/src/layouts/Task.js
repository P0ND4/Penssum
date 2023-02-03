import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import Header from "../screens/tasks/Header";
import Buttons from "../screens/tasks/Buttons";
import Products from "../screens/tasks/Products";
import AddPublications from "../screens/tasks/AddPublications";

function Task() {
  const products = useSelector((state) => state.products);

  const [position, setPosition] = useState(0);
  const [productLimit, setProductLimit] = useState(false);

  const productsToPut = useRef([]);

  let productCount = useRef(0).current;

  useEffect(() => (productsToPut.current = []), [products, productsToPut]);

  useEffect(() => {
    const interval =
      products.length > 0
        ? setInterval(() => {
            if (position + 1 === products.length || position + 1 === 9) {
              setPosition(0);
            } else setPosition(position + 1);
          }, 5000)
        : "";

    return () => clearInterval(interval);
  });

  const putPost = useCallback(
    (num) => {
      for (let i = 0; i < num; i++) {
        if (!products[productCount]) {
          setProductLimit(true);
          break;
        }
        productsToPut.current.push(products[productCount]);
        productCount++;
      }
    },
    [productCount, products, productsToPut]
  );

  useEffect(() => putPost(20), [putPost, products]);

  return (
    <>
      <Header position={position} />
      <Buttons />
      <Products productsToPut={productsToPut} />
      <AddPublications productLimit={productLimit} putPost={putPost}/>
    </>
  );
}

export default Task;