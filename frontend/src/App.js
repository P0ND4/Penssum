import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getUser, getProducts, socket, getAdminInformation } from './api';

import Loading from './components/parts/Loading';

import Signin from './components/layouts/Signin';
import Error404 from './components/layouts/Error404';

import Report from './components/layouts/Report';
import Help from './components/layouts/Help';
import HelpInformation from './components/parts/helpZone/HelpInformation';
import ImprovementComment from './components/layouts/ImprovementComment';

// Register
import Signup from './components/layouts/register/Signup';
import Selection from './components/layouts/register/Selection';
import AccountConfirmationCard from './components/parts/AccountConfirmationCard';

// User
import Profile from './components/layouts/user/Profile';
import Messages from './components/layouts/user/Messages';
import Notifications from './components/layouts/user/Notifications';
import Preferences from './components/layouts/user/Preference';
import TokenVerification from './components/layouts/user/TokenVerification';
import CheckEmail from './components/layouts/user/CheckEmail';

//Post
import PostActivity from './components/layouts/post/PostActivity';
import PostInformation from './components/layouts/post/PostInformation';
import Quote from './components/layouts/post/Quote';
import PostControl from './components/layouts/post/PostControl';

//Functionalities
//import VideoCall from './components/layouts/function/VideoCall';
import Found from './components/layouts/function/Found';
import ScrollToTop from './components/layouts/ScrollToTop';

//Admin
import AdminLogin from './components/layouts/admin/AdminLogin';
import Dashboard from './components/layouts/admin/Dashboard';

//Cookies
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const Nav = lazy(() => import('./components/partials/Nav'));
const Home = lazy(() => import('./components/layouts/Home'));
const Footer = lazy(() => import('./components/partials/Footer'));

function App() {
  const [obtainedFiles, setObtainedFiles] = useState(null);
  const [auth, setAuth] = useState(false);
  const [signinAdmin,setSigninAdmin] = useState(false);
  const [userInformation, setUserInformation] = useState({});
  const [dashboard, setDashboard] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState(null);
  const [reportUsername,setReportUsername] = useState('');
  
  const [filterNav,setFilterNav] = useState({
    city: 'ciudad',
    user: 'usuario'
  });

  const [registration, setRegistration] = useState(false);

  const [registrationProcess, setRegistrationProcess] = useState({
    validated: null,
    selection: null
  });

  const changeRegistrationProcess = (validated, selection) => {
    setRegistrationProcess({ validated, selection });
  };

  const productsToPut = useRef([]);

  useEffect(() => {
    const connectWithUser = async () => {
      const id = cookies.get('id');
      if (id !== undefined) {
        const user = await getUser({ id });
        if (user !== '') {
          setUserInformation(user);
          
          if (user.validated) { 
            setAuth(true); 
            socket.emit('connected', id);
          } else setRegistration(true);

          return changeRegistrationProcess(user.validated, user.objetive === '' ? false : true);
        } else cookies.remove('id');
      };
      return changeRegistrationProcess(true, true);;
    };
    connectWithUser();
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      const productsObtained = await getProducts({ blockSearch: userInformation._id });
      setProducts(productsObtained);
    };
    searchProducts();
  }, [auth,userInformation]);

  useEffect(() => {
    const getInformation = async () => { await getAdminInformation() };
    getInformation();
  },[]);

  useEffect(() => {
    const body = document.querySelector('body');
    dashboard ? body.style.padding = '0' : body.style.paddingTop = '65px';
  });

  return (
    <div>
      <Router>
        <Suspense fallback={<Loading center={true} />}>
          <ScrollToTop setDashboard={setDashboard} validated={userInformation.validated} setRegistration={setRegistration} setSearch={setSearch} obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles}>
            {!dashboard ? <Nav auth={auth} userInformation={userInformation} setAuth={setAuth} setUserInformation={setUserInformation} search={search} setSearch={setSearch} filterNav={filterNav} setFilterNav={setFilterNav}/> : <></>}
            <AccountConfirmationCard registration={registration} userInformation={userInformation} setRegistration={setRegistration} setUserInformation={setUserInformation} />
            <Routes>
              <Route path="/" element={<Home auth={auth} username={userInformation.username} products={products} productsToPut={productsToPut} />} />
              <Route path="/help" element={<Help />} />
              <Route path="/help/information/:attribute" element={<HelpInformation />} />
              <Route path="/report" element={auth ? <Report reportUsername={reportUsername} setReportUsername={setReportUsername} obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} setProducts={setProducts}/> : <Navigate to="/signin" />} />

              <Route path="/signin" element={!auth ? <Signin setAuth={setAuth} setUserInformation={setUserInformation} setSigninAdmin={setSigninAdmin}/> : <Navigate to="/" />} />
              <Route path="/signup" element={!auth ? <Signup setUserInformation={setUserInformation} setRegistrationProcess={setRegistrationProcess} registrationProcess={registrationProcess} /> : <Navigate to="/" />} />

              <Route path="/signup/selection" element={<Selection setUserInformation={setUserInformation} userInformation={userInformation} setAuth={setAuth} setRegistrationProcess={setRegistrationProcess} registrationProcess={registrationProcess} setRegistration={setRegistration} />} />
              <Route path="/signup/check/email" element={<CheckEmail setRegistration={setRegistration} userInformation={userInformation} setUserInformation={setUserInformation} registrationProcess={registrationProcess} />} />

              <Route path="/signup/email/verification/:token" element={<TokenVerification setAuth={setAuth} setUserInformation={setUserInformation} setRegistration={setRegistration} />} />

              <Route path="/improvement/comment" element={auth ? <ImprovementComment /> : <Navigate to="/signin" />} />
              <Route path="/search/:profile_provider" element={<Found filterNav={filterNav} />} />
              <Route path="/post/activity" element={auth ? <PostActivity userInformation={userInformation} obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} /> : <Navigate to="/signin" />} />
              <Route path="/post/information/:post_id" element={<PostInformation auth={auth} userInformation={userInformation} />} />

              <Route path="/post/information/:post_id/control" element={auth ? <PostControl userInformation={userInformation} /> : <Navigate to="/" />} />

              {/*<Route path="/video_call/meeting/:meeting_id"*/} {/*element=*/}{/*auth ? <VideoCall userInformation={userInformation}/> : <Navigate to="/signin" /> */} {/*/>*/}
              <Route path="/messages" element={auth ? <Messages /> : <Navigate to="/signin" />} />
              <Route path="/notifications" element={auth ? <Notifications/> : <Navigate to="/signin" />} />
              <Route path="/preference/:attribute" element={auth ? <Preferences userInformation={userInformation} setUserInformation={setUserInformation} /> : <Navigate to="/signin" />} />
              <Route path="/send/quote" element={auth ? <Quote obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} /> : <Navigate to="/signin" />} />

              <Route path="/signin/admin" element={signinAdmin ? <AdminLogin setDashboard={setDashboard} /> : <Navigate to="/signin" />} />

              <Route path="/dashboard/:attribute" element={dashboard ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/:username" element={<Profile mainUsername={userInformation.username} userInformation={userInformation} setUserInformation={setUserInformation} auth={auth} setProducts={setProducts} setReportUsername={setReportUsername}/>} />
              <Route path="*" element={<Error404 />} />
            </Routes>
            {!dashboard ? <Footer /> : <></>}
          </ScrollToTop>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
