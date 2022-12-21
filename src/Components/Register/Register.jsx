import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { registerUser } from "../../redux/apiRequest/authRequest";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import toastConfig from "../../utils/toastifyConfig";

const Register = () => {
  const avaUrls = [
    "https://preview.redd.it/fc9k38jwfwv51.png?auto=webp&s=9ce3d4c488091bb21969fd0fad7a6d89e4bfc50d",
    "https://preview.redd.it/se39g98mljw51.png?auto=webp&s=758dfe2b0a2df439b06b68533e763f413d58b46c",
    "https://preview.redd.it/5es1lne1du261.png?width=640&crop=smart&auto=webp&s=e6eb0ee5710710000e4fbace119112de63324a38",
    "https://preview.redd.it/cpwkbke13vv51.png?auto=webp&s=9158e49b35ad2581d840efd2a013a9ead06abbc7",
    "https://preview.redd.it/26s9eejm8vz51.png?auto=webp&s=e38d32ee0ffa0666fade2abd62ed59037c119990",
  ];

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  const register = useSelector((state) => state.auth.register);

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      username: username,
      email: email,
      password: password,
      avatarUrl: avatarUrl,
    };
    console.log(data);
    registerUser(data, dispatch);
  };

  useEffect(() => {
    if (register.result?.statusbar === "error") {
      toast.error(register.result.message, toastConfig);
    }
    if (register.result?.statusbar === "success") {
      toast.success("register success, please login", toastConfig);
    }
  }, [register.result]);

  const handleAvatarClick = (e) => {
    let oldActive = document.getElementsByClassName("bg-green-300");
    for (let i = 0; i < oldActive.length; i++) {
      oldActive[i].classList.remove("bg-green-300");
    }
    e.target.classList.add("bg-green-300");
    setAvatarUrl(e.target.src);
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex flex-col items-center min-h-screen pt-6 sm:justify-center sm:pt-0 bg-gray-50">
        <div>
          <h3 className="text-4xl font-bold text-purple-600">Create Account</h3>
        </div>
        <div className="w-full px-6 py-4 mt-6 overflow-hidden bg-white shadow-md sm:max-w-lg sm:rounded-lg">
          <form onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm mt-6 font-medium text-gray-700 undefined"
              >
                Username
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="text"
                  name="username"
                  placeholder="username"
                  required
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full h-10 pl-3 mt-1 border border-gray-300 rounded-md shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="email"
                className="block text-sm mt-6 font-medium text-gray-700 undefined"
              >
                Email
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="email"
                  name="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your email address"
                  className="block w-full pl-3 h-10 mt-1 border border-gray-300 rounded-md shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="password"
                className="block text-sm mt-6 font-medium text-gray-700 undefined"
              >
                Password
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="password"
                  name="password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="your password"
                  className="block w-full h-10 pl-3 mt-1 border border-gray-300 rounded-md shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="password"
                className="block text-sm mt-6 mb-2 font-medium text-gray-700 undefined"
              >
                Avatar: Chose One
              </label>
              <div className="flex flex-row items-start">
                {avaUrls.map((url, index) => {
                  return (
                    <div key={index}>
                      <img
                        className="w-20 ml-3 rounded-full h-24 object-cover hover:bg-green-200"
                        src={url}
                        alt=""
                        onClick={handleAvatarClick}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center mt-14 mb-10">
              <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
                {register.isFetching ? "Loading ..." : "Register"}
              </button>
            </div>
          </form>
          <div className="mt-4 text-grey-600">
            Already have an account?{" "}
            <span>
              <Link className="text-purple-600 hover:underline" to="/login">
                Log in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
