import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { change } from "../../../features/product/informationSlice";

function Left() {
  const user = useSelector((state) => state.user);
  const { productFound, offer } = useSelector((state) => state.postInformation);
  const [position, setPosition] = useState(0);

  const { post_id } = useParams();
  const dispatch = useDispatch();

  return (
    <section>
      <div className="post-information-photos-container">
        {position !== 0 && (
          <i
            className="fa-solid fa-circle-arrow-left"
            id="fa-circle-arrow-left-post-information-photos"
            onClick={() => setPosition(position - 1)}
          ></i>
        )}
        <div
          className="post-information-photos"
          style={{ width: `${productFound.files.length}00%` }}
        >
          {productFound.files.map((file) => {
            return (
              <div
                className="post-photo"
                key={file.uniqueId}
                style={{ transform: `translateX(-${position}00%)` }}
              >
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <img
                    src={
                      /pdf|epub|azw|ibook|doc|docx/.test(file.extname)
                        ? file.extname === ".pdf"
                          ? "/img/pdf_image.svg"
                          : file.extname === ".docx" || file.extname === ".doc"
                          ? "/img/word_image.svg"
                          : "/img/document_image.svg"
                        : file.url
                    }
                    alt="lamborghini"
                  />
                </a>
              </div>
            );
          })}
        </div>
        {position + 1 !== productFound.files.length && (
          <i
            className="fa-solid fa-circle-arrow-right"
            id="fa-circle-arrow-right-post-information-photos"
            onClick={() => setPosition(position + 1)}
          ></i>
        )}
      </div>
      <div
        id="post_id"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>ID: {productFound === null ? "Cargando..." : productFound._id}</p>
        <div className="option-post-video_call">
          <CopyToClipboard
            text={productFound._id}
            onCopy={() => dispatch(change({ copied: true }))}
          >
            <i className="fa-solid fa-copy" title="Copiar id del producto"></i>
          </CopyToClipboard>
        </div>
      </div>
      {!productFound.takenBy &&
      productFound.owner === user._id &&
      productFound.stateActivated && (
        <Link
          className="service-offer-post-information"
          to={`/post/information/${post_id}/control`}
        >
          Panel de control{" "}
          {offer !== null ? <span id="count-offers">{offer.length}</span> : ""}
        </Link>
      )}
    </section>
  );
}

export default Left;
