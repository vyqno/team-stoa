import { useEffect } from "react";
import LoginPage from "@/components/ui/animated-characters-login-page";

const Login = () => {
  useEffect(() => {
    document.title = "Login — Stoa";
  }, []);

  return <LoginPage />;
};

export default Login;
