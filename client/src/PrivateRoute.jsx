// PrivateRoute.jsx
import React, { useContext } from "react";
import { Route } from "react-router-dom";
import { AuthContext } from "../AuthContext.jsx";
import { useHistory } from "react-router-dom";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const history = useHistory();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Component {...props} /> : history.push("/login")
      }
    />
  );
};

export default PrivateRoute;
