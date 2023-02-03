import PreferenceToggle from '../../components/user/PreferenceToggle';

function Rules() {
  return (
    <div className="commomStylePadding dashboard-rules">
      <PreferenceToggle
        h4="Permitir revicion de productos"
        p="Permite la revicion de productos, si esta desactivado los productos se publicaran sin necesidad de revicion"
        idContainer="allowProductReview"
        idButton="buttonAllowProductReview"
      />
      <PreferenceToggle
        h4="Permitir videollamadas"
        p="Bloquea las reuniones por videollamadas en la plataforma"
        idContainer="allowVideoCall"
        idButton="buttonAllowVideoCall"
      />
    </div>
  );
}

export default Rules;
