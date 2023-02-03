import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changeEvent } from "../../../features/product/activitySlice";
import { clean } from "../../../features/function/filesSlice";
import { productCreate, couponControl } from "../../../api";
import PayForPenssum from "./PayForPenssum";
import PayuForm from "../../../components/PayuForm";
import Information from "../../../components/Information";
import SubjectBackground from "../../../components/SubjectBackground";

function Handlers() {
  const user = useSelector((state) => state.user);
  const files = useSelector((state) => state.files);
  const {
    activateInformation,
    activatePayment,
    coupon,
    value,
    data,
    isSubjectsOpen,
    subjects,
    subjectsSelected,
    paymentHandler,
  } = useSelector((state) => state.activity);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const saveProduct = useCallback(
    async (advancePayment) => {
      const activityData = {
        owner: user._id,
        creatorUsername: user.username,
        category: data.category,
        subCategory: data.subCategory,
        customCategory: data.customCategory.trimEnd(),
        title: data.title.trimEnd(),
        description: data.description.trimEnd(),
        value: !value ? 0 : value,
        advancePayment,
        paymentTOKEN:
          advancePayment === undefined ? paymentHandler.token : null,
        paymentLink: advancePayment === undefined ? paymentHandler.URL : null,
        paymentType: paymentHandler.paymentType
          ? paymentHandler.paymentType
          : null,
        dateOfDelivery: data.dateOfDelivery,
        videoCall: data.videoCallActivated,
        paymentMethod: data.paymentMethod,
        city: user.city === "city" || !user.city ? null : user.city,
        files,
        subjects: subjectsSelected,
      };

      dispatch(changeEvent({ sendingInformation: true }));
      if (files !== null) await productCreate(activityData);
      if (coupon)
        await couponControl({
          id_coupon: coupon._id,
          username: user.username,
        });
      dispatch(changeEvent({ sendingInformation: false }));
      dispatch(clean());
      navigate(`/${user.username}`);
    },
    [
      data,
      coupon,
      dispatch,
      navigate,
      paymentHandler,
      user,
      subjectsSelected,
      files,
      value,
    ]
  );

  useEffect(() => {
    if (paymentHandler.response || paymentHandler.response === "pendding") {
      saveProduct(
        paymentHandler.response === true
          ? true
          : paymentHandler.response === "pendding"
          ? undefined
          : false
      );
    }
  }, [paymentHandler, saveProduct]);

  return (
    <>
      {activatePayment && (
        <PayuForm
          title={coupon ? "DIFERENCIA DEL PAGO" : "PAGO ADELANTADO"}
          amount={coupon ? value - coupon.amount : value}
          userInformation={user}
          productTitle={data.title}
          paymentHandler={(data) =>
            dispatch(changeEvent({ paymentHandler: data }))
          }
          setActivatePayment={() =>
            dispatch(changeEvent({ activatePayment: false }))
          }
          payment={
            coupon
              ? { card: true, pse: false, bank: false, cash: false }
              : { card: true, pse: true, bank: true, cash: true }
          }
        />
      )}
      {activateInformation && (
        <Information
          callback={
            data.advancePayment || (coupon !== null && value > coupon.amount)
              ? (data) => dispatch(changeEvent({ activatePayment: data }))
              : saveProduct
          }
          callbackValue={data.advancePayment || coupon !== null ? true : false}
          controller={() =>
            dispatch(changeEvent({ activateInformation: false }))
          }
        />
      )}
      <PayForPenssum />
      {isSubjectsOpen && (
        <SubjectBackground
          title="Materias"
          description="Seleccione las meterías en que necesitará apoyo."
          subjects={subjects}
          setOpen={() => dispatch(changeEvent({ isSubjectsOpen: false }))}
          setInformation={(selected) =>
            dispatch(changeEvent({ subjectsSelected: selected }))
          }
          information={subjectsSelected}
        />
      )}
    </>
  );
}

export default Handlers;
