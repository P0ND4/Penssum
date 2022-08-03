import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  getUser, 
  getProducts, 
  socket,
  getAdminInformation, 
  suspensionControl, 
  userStatusChange,
  getVote
} from './api';
import { getRemainTime, verificationOfInformation } from './components/helpers';

import Nav from './components/partials/Nav';
import Home from './components/layouts/Home';
import Footer from './components/partials/Footer';

import Error404 from './components/layouts/Error404';

import Report from './components/layouts/Report';
import Help from './components/layouts/Help';
import HelpInformation from './components/parts/helpZone/HelpInformation';
import ImprovementComment from './components/layouts/ImprovementComment';

import CompleteInformation from './components/layouts/CompleteInformation';

// login
import Signin from './components/layouts/login/Signin';
import Recovery from './components/layouts/login/Recovery';

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
import EventHandler from './components/layouts/EventHandler';
import TransactionReceipt from './components/layouts/function/TransactionReceipt';

//Admin
import AdminLogin from './components/layouts/admin/AdminLogin';
import Dashboard from './components/layouts/admin/Dashboard';

//Cookies
import Cookies from 'universal-cookie';
import LoadingZone from './components/layouts/LoadingZone';

import Vote from './components/parts/Vote';

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
  const [quoteId,setQuoteId] = useState('');
  const [notifications, setNotifications] = useState(null);
  const [countInNotification, setCountInNotification] = useState(0);
  const [countInMessages, setCountInMessages] = useState(0);
  const [userErrorHandler,setUserErrorHandler] = useState(false);
  const [isTheUserSuspended,setIsTheUserSuspended] = useState(false);
  const [deadline, setDeadline] = useState(null); 
  const [reportProductId,setReportProductId] = useState(null);
  const [votePending,setVotePending] = useState([]);
  const [repeatVote,setRepeatVote] = useState(true);
  const [pendingInformation,setPendingInformation] = useState(false);
  const [reportTransaction,setReportTransaction] = useState(false);
  const [zoneCompleteInformation,setZoneCompleteInformation] = useState('main');

  const [filterNav, setFilterNav] = useState({
    city: 'ciudad',
    classType: 'classType',
    category: 'categoria'
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
      const productsObtained = await getProducts({ blockSearch: cookies.get('id') });
      setProducts(productsObtained);
    };
    searchProducts();
  }, [auth]);

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

  useEffect(() => {
    if (auth) {
      const searchVotePending = async () => {
        const result = await getVote({ from: userInformation._id, voteType: 'pending' });
        if (result.error) return
        else setVotePending(result);
      };
      searchVotePending();
    };
  },[auth,userInformation]);

  useEffect(() => {
    if (!setRepeatVote) {
      setTimeout(() => {
        setRepeatVote(true);
      },1000);
    }
  },[repeatVote]);

  useEffect(() => {
    if (auth && userInformation !== null) {
      if (!verificationOfInformation(userInformation.objetive,userInformation)) setPendingInformation(true)
      else setPendingInformation(false);
    } else setPendingInformation(false);
  },[userInformation,auth]);

  return (
    <div>
      <Router>
        <LoadingZone auth={auth} products={products}>
          <EventHandler setDashboard={setDashboard} setPendingInformation={setPendingInformation} userInformation={userInformation} validated={userInformation.validated} userErrorHandler={userErrorHandler} setRegistration={setRegistration} setSearch={setSearch} obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} setReportProductId={setReportProductId} setReportTransaction={setReportTransaction}>
            {!dashboard && products !== null ? <Nav auth={auth} userInformation={userInformation} setAuth={setAuth} setUserInformation={setUserInformation} search={search} setSearch={setSearch} filterNav={filterNav} setFilterNav={setFilterNav} notifications={notifications} setNotifications={setNotifications} setCountInNotification={setCountInNotification} countInNotification={countInNotification} countInMessages={countInMessages} setCountInMessages={setCountInMessages}/> : <></>}
            {auth && pendingInformation && <Link className="complete-information-card-container" to="/complete/information">Completar Información</Link>}
            <AccountConfirmationCard registration={registration} userInformation={userInformation} setRegistration={setRegistration} setUserInformation={setUserInformation} />
            {votePending.length > 0 && repeatVote && <Vote setVotePending={setVotePending} votePending={votePending} firstUser={votePending[0]} setRepeatVote={setRepeatVote} pending={true}/>}
            <main>
              <Routes>
                <Route path="/" element={<Home userInformation={userInformation} auth={auth} userErrorHandler={userErrorHandler} username={userInformation.username} products={products} productsToPut={productsToPut} isTheUserSuspended={isTheUserSuspended}/>} />
                <Route path="/help" element={<Help obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} auth={auth} />} />
                <Route path="/help/information/:attribute" element={<HelpInformation />} />
                <Route path="/report" element={auth ? <Report reportUsername={reportUsername} setReportUsername={setReportUsername} obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} setProducts={setProducts} setNotifications={setNotifications} setCountInNotification={setCountInNotification} reportProductId={reportProductId} setReportProductId={setReportProductId} setReportTransaction={setReportTransaction} reportTransaction={reportTransaction}/> : <Navigate to="/signin" />} />

                <Route path="/signin" element={!auth ? <Signin setAuth={setAuth} setUserInformation={setUserInformation} setSigninAdmin={setSigninAdmin} setRegistrationProcess={setRegistrationProcess} registrationProcess={registrationProcess} /> : <Navigate to="/" />} />
                <Route path="/signin/recovery" element={!auth ? <Recovery setUserInformation={setUserInformation} setAuth={setAuth} /> : <Navigate to="/" />} />
                
                <Route path="/signup" element={!auth ? <Signup setUserInformation={setUserInformation} setRegistrationProcess={setRegistrationProcess} registrationProcess={registrationProcess} /> : <Navigate to="/" />} />
                <Route path="/signup/selection" element={<Selection setUserInformation={setUserInformation} userInformation={userInformation} setAuth={setAuth} setRegistrationProcess={setRegistrationProcess} registrationProcess={registrationProcess} setRegistration={setRegistration} />} />
                <Route path="/signup/check/email" element={<CheckEmail setRegistration={setRegistration} userInformation={userInformation} setUserInformation={setUserInformation} registrationProcess={registrationProcess} />} />

                <Route path="/complete/information" element={auth ? <CompleteInformation setUserInformation={setUserInformation} userInformation={userInformation} zone={zoneCompleteInformation} setZone={setZoneCompleteInformation}/> : <Navigate to="/signin"/>}/>

                <Route path="/signup/email/verification/:token" element={<TokenVerification setAuth={setAuth} setUserInformation={setUserInformation} setRegistration={setRegistration} />} />

                <Route path="/improvement/comment" element={auth ? <ImprovementComment obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} /> : <Navigate to="/signin" />} />
                <Route path="/search/:profile_provider" element={<Found userInformation={userInformation} filterNav={filterNav} auth={auth}/>} />
                <Route path="/post/activity" element={auth && userInformation && userInformation.objetive !== 'Profesor' && verificationOfInformation(userInformation.objetive,userInformation) ? <PostActivity userInformation={userInformation} obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} isTheUserSuspended={isTheUserSuspended} username={userInformation.username} /> : <Navigate to="/signin" />} />
                <Route path="/post/information/:post_id" element={<PostInformation auth={auth} userInformation={userInformation} isTheUserSuspended={isTheUserSuspended} setMainProducts={setProducts} setProducts={setProducts} setReportUsername={setReportUsername} setQuoteId={setQuoteId} setReportProductId={setReportProductId} setNotifications={setNotifications} setCountInNotification={setCountInNotification} setCountInMessages={setCountInMessages} setReportTransaction={setReportTransaction}/>} />
                <Route path="/post/information/:post_id/transaction/receipt" element={auth ? <TransactionReceipt userInformation={userInformation} /> : <Navigate to="/signin" />} />

                <Route path="/post/information/:post_id/control" element={auth ? <PostControl userInformation={userInformation} setCountInMessages={setCountInMessages} setCountInNotification={setCountInNotification} setNotifications={setNotifications}/> : <Navigate to="/" />} />

                {/*<Route path="/video_call/meeting/:meeting_id" element={auth ? <VideoCall userInformation={userInformation}/> : <Navigate to="/signin" /> } />*/}
                <Route path="/messages" element={auth ? <Messages setProducts={setProducts} setNotifications={setNotifications} setCountInNotification={setCountInNotification} /> : <Navigate to="/signin" />} />
                <Route path="/notifications" element={auth ? <Notifications /> : <Navigate to="/signin" />} />
                <Route path="/preference/:attribute" element={auth ? <Preferences userInformation={userInformation} setUserInformation={setUserInformation} setZoneCompleteInformation={setZoneCompleteInformation}/> : <Navigate to="/signin" />} />
                <Route path="/send/quote" element={auth && userInformation.objetive !== 'Alumno' && verificationOfInformation(userInformation.objetive,userInformation) ? <Quote obtainedFiles={obtainedFiles} setObtainedFiles={setObtainedFiles} isTheUserSuspended={isTheUserSuspended} username={userInformation.username} quoteId={quoteId} setQuoteId={setQuoteId} /> : verificationOfInformation(userInformation.objetive,userInformation) ? <Navigate to="/complete/information" /> : <Navigate to="/signin" />} />

                <Route path="/signin/admin" element={signinAdmin ? <AdminLogin setDashboard={setDashboard} /> : <Navigate to="/signin" />} />

                <Route path="/dashboard/:attribute" element={dashboard ? <Dashboard setProducts={setProducts} /> : <Navigate to="/" />} />
                <Route path="/:username" element={<Profile mainUsername={userInformation.username} userInformation={userInformation} setUserInformation={setUserInformation} auth={auth} setProducts={setProducts} setReportUsername={setReportUsername} setNotifications={setNotifications} setCountInNotification={setCountInNotification} isTheUserSuspended={isTheUserSuspended} deadline={deadline}/>} />
                <Route path="*" element={<Error404 />} />
              </Routes>
            </main>
            {!dashboard && products !== null ? <Footer /> : <></>}
          </EventHandler>
        </LoadingZone>
      </Router>
    </div>
  );
}

export default App;
