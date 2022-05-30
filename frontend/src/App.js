import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  getUser, 
  getProducts, 
  socket,
  getAdminInformation, 
  suspensionControl, 
  userStatusChange, 
  getNotifications,
  getUncheckedMessages
} from './api';
import { getRemainTime } from './components/helpers';

import Nav from './components/partials/Nav';
import Home from './components/layouts/Home';
import Footer from './components/partials/Footer';

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
import VideoCall from './components/layouts/function/VideoCall';
import Found from './components/layouts/function/Found';
import EventHandler from './components/layouts/EventHandler';
import TransactionReceipt from './components/layouts/function/TransactionReceipt';

//Admin
import AdminLogin from './components/layouts/admin/AdminLogin';
import Dashboard from './components/layouts/admin/Dashboard';

//Cookies
import Cookies from 'universal-cookie';
import LoadingZone from './components/layouts/LoadingZone';

const cookies = new Cookies();

function App() {
  const [obtainedFiles, setObtainedFiles] = useState(null);
  const [auth, setAuth] = useState(null);
  const [signinAdmin, setSigninAdmin] = useState(false);
  const [userInformation, setUserInformation] = useState({});
  const [dashboard, setDashboard] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState(null);
  const [reportUsername, setReportUsername] = useState('');
  const [notifications, setNotifications] = useState(null);
  const [countInNotification, setCountInNotification] = useState(0);
  const [countInMessages, setCountInMessages] = useState(0);
  const [userErrorHandler,setUserErrorHandler] = useState(false);
  const [isTheUserSuspended,setIsTheUserSuspended] = useState(false);
  const [deadline, setDeadline] = useState(null); 

  const [filterNav, setFilterNav] = useState({
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
  const timerHelper = useRef();

  useEffect(() => {
    const checkSuspension = async () => {
      if (cookies.get('id')) {
        await suspensionControl({ id: cookies.get('id') });
      };
    };
    checkSuspension();
  },[]);

  useEffect(() => {
    if (auth) {
      socket.on('received event', async () => {
        const briefNotifications = await getNotifications(cookies.get('id'));
        const briefMessages = await getUncheckedMessages(cookies.get('id'));

        setCountInMessages(briefMessages.length);

        const currentNotification = [];
        let count = 0;

        for (let i = 0; i < 3; i++) { if (briefNotifications[i] !== undefined) currentNotification.push(briefNotifications[i]) };
        for (let i = 0; i < briefNotifications.length; i++) { if (!briefNotifications[i].view) count += 1 };

        setCountInNotification(count);
        setNotifications(currentNotification);
      });
    };
  },[auth]);

  useEffect(() => {
    socket.on('suspension-ended', () => setIsTheUserSuspended(false));
    if (auth) {
      socket.on('user_connected', () => {
        socket.emit('save_current_user', { id: cookies.get('id'), socketId: socket.id });
      });
    };
    return () => { socket.off() };
  }, [auth]);

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
    setAuth(false);
    connectWithUser();
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      const productsObtained = await getProducts({ blockSearch: userInformation._id });
      setProducts(productsObtained);
    };
    searchProducts();
  }, [auth, userInformation]);

  useEffect(() => {
    const getInformation = async () => { await getAdminInformation() };
    getInformation();
  }, []);

  useEffect(() => {
    const body = document.querySelector('body');
    dashboard ? body.style.padding = '0' : body.style.paddingTop = '65px';
  });

  useEffect(() => {
    if (Object.keys(userInformation).length !== 0 && userInformation.typeOfUser.user === 'block') {
      setUserErrorHandler(true);
    } else { setUserErrorHandler(false) };

    if (Object.keys(userInformation).length !== 0 && userInformation.typeOfUser.user === 'layoff') {
      setIsTheUserSuspended(true);
    } else { setIsTheUserSuspended(false) };
  },[userInformation]);

  useEffect(() => {
      const dateTimer = async () => {
          if (userInformation !== null && userInformation.typeOfUser && userInformation.typeOfUser.user === 'layoff') {
              if (deadline === null) {
                  setDeadline(getRemainTime(userInformation.typeOfUser.suspension));
                  timerHelper.current = setInterval(() => setDeadline(getRemainTime(userInformation.typeOfUser.suspension)),1000);
              };
              if (deadline !== null && deadline.remainTime <= 1) {
                  clearInterval(timerHelper.current);
                  setIsTheUserSuspended(false);
                  await userStatusChange({ id: cookies.get('id'), typeOfUser: 'free' });
                  socket.emit('suspension-ended', cookies.get('id'));
              };
          };
      };
      dateTimer();
  },[userInformation,deadline,setIsTheUserSuspended]);

  return (
    <div>
      <Router>
        <LoadingZone auth={auth} products={products}>
          <EventHandler setDashboard={setDashboard} validated={userInformation.validated} userErrorHandler={userErrorHandler} setRegistration={setRegistration} setSearch={setSearch} obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles}>
            {!dashboard && products !== null ? <Nav auth={auth} userInformation={userInformation} setAuth={setAuth} setUserInformation={setUserInformation} search={search} setSearch={setSearch} filterNav={filterNav} setFilterNav={setFilterNav} notifications={notifications} setNotifications={setNotifications} setCountInNotification={setCountInNotification} countInNotification={countInNotification} countInMessages={countInMessages} setCountInMessages={setCountInMessages}/> : <></>}
            <AccountConfirmationCard registration={registration} userInformation={userInformation} setRegistration={setRegistration} setUserInformation={setUserInformation} />
            <Routes>
              <Route path="/" element={<Home auth={auth} userErrorHandler={userErrorHandler} username={userInformation.username} products={products} productsToPut={productsToPut} isTheUserSuspended={isTheUserSuspended}/>} />
              <Route path="/help" element={<Help obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} auth={auth} />} />
              <Route path="/help/information/:attribute" element={<HelpInformation />} />
              <Route path="/report" element={auth ? <Report reportUsername={reportUsername} setReportUsername={setReportUsername} obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} setProducts={setProducts} setNotifications={setNotifications} setCountInNotification={setCountInNotification} /> : <Navigate to="/signin" />} />

              <Route path="/signin" element={!auth ? <Signin setAuth={setAuth} setUserInformation={setUserInformation} setSigninAdmin={setSigninAdmin} /> : <Navigate to="/" />} />
              <Route path="/signup" element={!auth ? <Signup setUserInformation={setUserInformation} setRegistrationProcess={setRegistrationProcess} registrationProcess={registrationProcess} /> : <Navigate to="/" />} />

              <Route path="/signup/selection" element={<Selection setUserInformation={setUserInformation} userInformation={userInformation} setAuth={setAuth} setRegistrationProcess={setRegistrationProcess} registrationProcess={registrationProcess} setRegistration={setRegistration} />} />
              <Route path="/signup/check/email" element={<CheckEmail setRegistration={setRegistration} userInformation={userInformation} setUserInformation={setUserInformation} registrationProcess={registrationProcess} />} />

              <Route path="/signup/email/verification/:token" element={<TokenVerification setAuth={setAuth} setUserInformation={setUserInformation} setRegistration={setRegistration} />} />

              <Route path="/improvement/comment" element={auth ? <ImprovementComment obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} /> : <Navigate to="/signin" />} />
              <Route path="/search/:profile_provider" element={<Found filterNav={filterNav} />} />
              <Route path="/post/activity" element={auth ? <PostActivity userInformation={userInformation} obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} isTheUserSuspended={isTheUserSuspended} username={userInformation.username} /> : <Navigate to="/signin" />} />
              <Route path="/post/information/:post_id" element={<PostInformation auth={auth} userInformation={userInformation} isTheUserSuspended={isTheUserSuspended} setMainProducts={setProducts}/>} />
              <Route path="/post/information/:post_id/transaction/receipt" element={auth ? <TransactionReceipt userInformation={userInformation} /> : <Navigate to="/signin" />} />

              <Route path="/post/information/:post_id/control" element={auth ? <PostControl userInformation={userInformation} /> : <Navigate to="/" />} />

              <Route path="/video_call/meeting/:meeting_id" element={auth ? <VideoCall userInformation={userInformation}/> : <Navigate to="/signin" /> } />
              <Route path="/messages" element={auth ? <Messages setProducts={setProducts} setNotifications={setNotifications} setCountInNotification={setCountInNotification} /> : <Navigate to="/signin" />} />
              <Route path="/notifications" element={auth ? <Notifications /> : <Navigate to="/signin" />} />
              <Route path="/preference/:attribute" element={auth ? <Preferences userInformation={userInformation} setUserInformation={setUserInformation} /> : <Navigate to="/signin" />} />
              <Route path="/send/quote" element={auth ? <Quote obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} isTheUserSuspended={isTheUserSuspended} username={userInformation.username} /> : <Navigate to="/signin" />} />

              <Route path="/signin/admin" element={signinAdmin ? <AdminLogin setDashboard={setDashboard} /> : <Navigate to="/signin" />} />

              <Route path="/dashboard/:attribute" element={dashboard ? <Dashboard setProducts={setProducts} /> : <Navigate to="/" />} />
              <Route path="/:username" element={<Profile mainUsername={userInformation.username} userInformation={userInformation} setUserInformation={setUserInformation} auth={auth} setProducts={setProducts} setReportUsername={setReportUsername} setNotifications={setNotifications} setCountInNotification={setCountInNotification} isTheUserSuspended={isTheUserSuspended} deadline={deadline}/>} />
              <Route path="*" element={<Error404 />} />
            </Routes>
            {!dashboard && products !== null ? <Footer /> : <></>}
          </EventHandler>
        </LoadingZone>
      </Router>
    </div>
  );
}

export default App;
