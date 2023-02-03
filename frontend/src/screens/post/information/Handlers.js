import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { change } from "../../../features/product/informationSlice";
import { save } from "../../../features/product/productsSlice";
import { takePost, socket, getProducts } from "../../../api";
import swal from "sweetalert";
import Vote from "../../../components/Vote";
import Information from "../../../components/Information";

function Handlers() {
  const user = useSelector((state) => state.user);
  const {
    activeVote,
    copied,
    scoreUpdated,
    activateInformation,
    productFound,
    userToVote,
  } = useSelector((state) => state.postInformation);

  const dispatch = useDispatch();
  const { post_id } = useParams();

  const engage = () => {
    swal({
      title: "¿Quieres postular a la publicación?",
      text: "¿Te comprometes a culminar la publicación en el tiempo solicitado, teniendo en cuenta la calidad del trabajo?, de eso dependerá su experiencia y su calificación, para que más estudiantes lo recomienden.",
      icon: "warning",
      buttons: ["No estoy seguro", "Me comprometo"],
    }).then(async (res) => {
      if (res) {
        dispatch(change({ sendingInformation: true }));
        const result = await takePost({
          post_id,
          teacher_id: user._id,
        });
        dispatch(change({ sendingInformation: false }));

        if (result.error) {
          if (result.type === "this post has been taken") {
            swal({
              title: "ERROR",
              text: "La publicación ya lo tomo un profesor",
              icon: "error",
              button: "ok",
            });
            dispatch(change({ productFound: result.productFound }));
          }
          if (result.type === "maximum products taken") {
            swal({
              title: "ERROR",
              text: `Alcanzaste el límite de publicaciones, resuelve las publicaciones que seleccionaste para poder tomar una publicación.`,
              icon: "error",
              button: "ok",
            });
          }
        } else {
          socket.emit("received event", productFound.owner);
          socket.emit("product changed", {
            owner: productFound.owner,
            userID: user._id,
          });
          socket.emit("product updated", {
            userID: productFound.owner,
            post_id,
            globalProductUpdate: true,
          });
          swal({
            title: "!ÉXITO!",
            text: `Excelente te has comprometido con la publicación.`,
            icon: "success",
            button: "!Gracias!",
          });
          dispatch(change({ productFound: result }));
        }
        const newProductsCollection = await getProducts({
          blockSearch: user._id,
        });
        dispatch(save(newProductsCollection));
      }
    });
  };

  return (
    <>
      {activeVote && (
        <Vote
          required={true}
          setActiveVote={() => dispatch(change({ activeVote: false }))}
          setHandlerVote={() => dispatch(change({ handlerVote: true }))}
          setVote={(score) => dispatch(change({ score }))}
          postInformation={true}
          userToVote={userToVote}
        />
      )}
      {copied && <span className="copied-span">Copiado</span>}
      {scoreUpdated && (
        <span className="scoreUpdated-span">Voto actualizado</span>
      )}
      {activateInformation && (
        <Information
          user={user}
          callback={engage}
          controller={() => dispatch(change({ activateInformation: false }))}
        />
      )}
    </>
  );
}

export default Handlers;
