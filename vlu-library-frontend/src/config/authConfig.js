import { LogLevel } from "@azure/msal-browser";
// require("dotenv").config();

export const msalConfig = {
  auth: {
    // clientId: "70b3d6de-90c4-4c53-a45c-316ad7661dee", // Application (client) ID từ Azure
    // authority: "https://login.microsoftonline.com/common", // "common" cho phép cả mail trường và mail cá nhân
    // redirectUri: "http://localhost:3000", // port chạy react
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
    authority: process.env.REACT_APP_AZURE_AUTHORITY,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage", // Hoặc "localStorage"
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            // console.info(message);
            return;
          case LogLevel.Verbose:
            // console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"], // KHÔNG thêm User.Read hay Files.Read
  prompt: "select_account",
};
