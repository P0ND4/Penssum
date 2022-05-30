import { useEffect, Fragment, useCallback } from 'react';
import { removeFiles } from '../../api';
import { useLocation, useNavigate } from 'react-router-dom';

function ScrollToTop({ children, setDashboard, validated, setRegistration, setSearch, obtainedFiles, setObtainedFiles, userErrorHandler }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        (userErrorHandler) && navigate('/');
    }, [location.pathname,navigate,userErrorHandler]);

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
    }, [location.pathname, memorizedTheRegistration, setDashboard]);

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