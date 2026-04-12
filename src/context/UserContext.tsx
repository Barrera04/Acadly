import React, { createContext, ReactNode, useState } from "react";

export const UserContext = createContext({
  username: "",
  setUsername: (username: string) => {},
  uid: "",
  setUid: (uid: string) => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState("");
  const [uid, setUid] = useState("");

  return (
    <UserContext.Provider value={{ username, setUsername, uid, setUid }}>
      {children}
    </UserContext.Provider>
  );
};
