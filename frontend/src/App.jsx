import { useState, useEffect } from "react";
import Landing from "./pages/Landing.jsx";
import Simulation from "./pages/Simulation.jsx";
import Docs from "./pages/Docs.jsx";

// Custom router to avoid npm install freezes
export const navigate = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export function Link({ to, children, className, style }) {
  const onClick = (e) => {
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={onClick} className={className} style={style}>
      {children}
    </a>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onLocationChange);
    return () => window.removeEventListener("popstate", onLocationChange);
  }, []);

  if (currentPath === "/simulation") return <Simulation />;
  if (currentPath === "/docs") return <Docs />;
  return <Landing />;
}
