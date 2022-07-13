import { useEffect, Fragment, useCallback } from 'react';
import { removeFiles } from '../../api';
import { useLocation, useNavigate } from 'react-router-dom';
import { verificationOfInformation } from '../helpers'

function ScrollToTop({ children, userInformation, setDashboard, setPendingInformation, validated, setRegistration, setSearch, obtainedFiles, setObtainedFiles, userErrorHandler, setReportProductId, setReportTransaction }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        (userErrorHandler) && navigate('/');
    }, [location.pathname,navigate,userErrorHandler]);

    const removeAllFiles = async () => {
        await removeFiles({ files: obtainedFiles });
        setObtainedFiles(null);
    };

    useEffect(() => {
        if (obtainedFiles !== null) window.addEventListener("beforeunload", event => event.returnValue = '');
        if (obtainedFiles !== null) window.addEventListener("unload", removeAllFiles);
        return (() => {
            window.removeEventListener("beforeunload", event => event.returnValue = '')
            window.removeEventListener("unload", removeAllFiles);
        });
    });

    const memorizedTheRegistration = useCallback(
        () => {
            if (location.pathname === '/signup/selection' || location.pathname === '/signup/check/email') setRegistration(false)
            else if (validated !== undefined && !validated) setRegistration(true)
            else setRegistration(false);
        }, [location.pathname, validated, setRegistration]
    );

    useEffect(() => {
        memorizedTheRegistration();
        if (location.pathname.slice(0, 15) !== '/dashboard/mod=') setDashboard(false);
        if (location.pathname.slice(0,7) !== '/report') {
            setReportProductId(null);
            setReportTransaction(false);
        };
        
        if (location.pathname.slice (0,21) === '/complete/information') setPendingInformation(false)
        else {
            if (!verificationOfInformation(userInformation.objetive,userInformation)) setPendingInformation(true)
            else setPendingInformation(false);
        };
    }, [location.pathname, memorizedTheRegistration, setDashboard, setReportProductId, setReportTransaction, userInformation, setPendingInformation]);

    useEffect(() => {
        if (location.pathname.slice(0, 8) !== '/search/') setSearch('');
        const listenToObtainedFiles = async () => {
            if (location.pathname.slice(0, 14) !== '/post/activity' 
                && location.pathname.slice(0, 11) !== '/send/quote'
                && location.pathname.slice(0, 7) !== '/report'
                && location.pathname.slice(0, 20) !== '/improvement/comment'
                && location.pathname.slice(0,5) !== '/help') {
                if (obtainedFiles !== null) {
                    await removeFiles({ files: obtainedFiles });
                    setObtainedFiles(null);
                };
            };
        };
        listenToObtainedFiles();
    });

    return <Fragment>{children}</Fragment>
}

export default ScrollToTop;