import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Login() {

  const onSuccess = async (credentialResponse) => {

    await axios.post("/auth/google", {
      credential: credentialResponse.credential
    });

  };

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={() => console.log("Login Failed")}
    />
  );

}