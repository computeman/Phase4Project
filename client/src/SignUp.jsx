import React, { useState } from "react";
import './SignUp.css'

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send a POST request to the server to register the user
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("User registered successfully");
        // Optionally, you can redirect the user to the login page or perform other actions
      } else {
        const data = await response.json();
        console.error("Error registering user:", data.message);
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div className="center">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
      <div className="txt_field">
       
         
          <input type="text" name="username" value={formData.username} onChange={handleChange}
          />
          <label>    Username
        </label>
        </div>    

        <div className="txt_field">
        <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        <label htmlFor="email">Email Address</label>
</div>     
        <div className="txt_field">
       
          <input type="password" name="password" value={formData.password} onChange={handleChange}
          />
          <label >Password
        </label>
        </div>
       
       
        <input type="submit"value= "Sign Up" />
      </form>
    </div>
  );
};

export default SignUp;
