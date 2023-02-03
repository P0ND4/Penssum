import Header from "../../screens/user/profile/Header"; // Image of profile, information etc
import Handlers from "../../screens/user/profile/Handlers"; // Is suspended, pending money, etc
import DaysInProfile from "../../components/DaysInProfile"; // days avilable
import Filter from "../../screens/user/profile/Filter"; // Create products, send quote, or phone number. (BUTTONS)
import Products from "../../screens/user/profile/Products"; // Main content
import Advertising from "../../screens/user/profile/Advertising"; // Extra information

import ProfileController from "../../controllers/Profile"; // load information

// COMPRIMIR MAS LOS SCREEN DE ESTA VENTANA PARA REDUCIRLO LO MAS POSIBLE
// REFACTORIZAR LO MAS POSIBLE ESTA PARTE

// REFACTORIZAR TODOS LOS COMPONENTES LO MAYOR POSIBLE

function Profile() {
  return (
    <ProfileController>
      <div className="profile-container">
        <Header />
        <Handlers />
        <DaysInProfile mobile />
        <div className="profile-development-container">
          <Filter />
          <Products />
          <Advertising />
        </div>
      </div>
    </ProfileController>
  );
}

export default Profile;
