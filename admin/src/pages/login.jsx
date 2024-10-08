import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { login } from '../api/authenticateApi';
import Loading from '../components/system-feedback/Loading';

import "../styles/common.css";
import "../styles/login.css";

export default function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [loginFail, setLoginFail] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
            navigate("/dashboard");
        }
    }, [navigate]);


    const handleLogin = async (e) => {
        e.preventDefault()

        let isValid = true;

        setEmailError('');
        setPasswordError('');

        if (!email) {
            setEmailError("Hãy nhập email của bạn!");
            isValid = false;
        }

        if (!password) {
            setPasswordError("Hãy nhập mật khẩu của bạn!");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const admin_login = {
            email: email,
            pwd: password
        };
        console.log("admin_login: ", admin_login);

        setLoading(true);
        try {
            const result = await login(admin_login);
            console.log("result:", result)
            if (result?.status === 200) {
                setLoading(false);
                localStorage.setItem('admin', JSON.stringify(result.data));

                setLoginSuccess(true);
                setTimeout(() => {
                    setLoginSuccess(false); 
                    navigate("/dashboard");
                }, 3000); 
            } else {
                setLoading(false);
                setLoginFail(true);
                setTimeout(() => {
                    setLoginFail(false); 
                    navigate("/");
                }, 3000); 
            }
        } catch (error) {
            console.log("error", error.message);
        }
        
    }
      
    return (
        <div className="login-container">
            <div className="login-form">
                {loading ? (
                    <Loading/>
                ):(
                    <>
                        <div>
                            <div className="navbar-brand-login">
                                <img src="/images/logo-dark.png" alt="logo" width="113.82px" height="60px" className="align-self-center"/>
                            </div>
                            
                            <h5>Đăng nhập</h5>
                        </div>
                        
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Nhập email" value={email} onChange={e => setEmail(e.target.value)}/>
                                {emailError && <div className="error-message" style={{ textAlign: "left", color: "red", fontStyle: "italic", fontSize: "14px", marginTop:"5px" }}>{emailError}</div>}
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
                                {passwordError && <div className="error-message" style={{ textAlign: "left", color: "red", fontStyle: "italic", fontSize: "14px", marginTop:"5px" }}>{passwordError}</div>}
                            </div>

                            <div className="form-row">
                                <div className="checkbox">
                                    <input type="checkbox" id="remember" />
                                    <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                                </div>

                                <div className="forgot-password"><a href="#">Quên mật khẩu?</a></div>
                            </div>

                            <button type="submit" className="btn-sign-in">Đăng nhập</button>
                        </form>
                        <button type="button" className="btn-sign-in-google">
                            <img src="https://res.cloudinary.com/dklt21uks/image/upload/v1725705052/dldlrna0zoe3qqkdehib.png" alt="google"/>
                            Đăng nhập bằng Google
                        </button>

                        {loginSuccess && <div style={{ color: "var(--feedback-success)", fontStyle: "italic", fontFamily: "medium-font", marginTop: "10px" }}>Đăng nhập thành công!</div>}
                        {loginFail && <div style={{ color: "var(--feedback-error)", fontStyle: "italic", fontFamily: "medium-font", marginTop: "10px" }}>Email hoặc mật khẩu sai!</div>}

                    </>
                )} 
            </div>
        </div>
    );
};