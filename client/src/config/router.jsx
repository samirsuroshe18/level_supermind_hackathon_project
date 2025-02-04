import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import NotFound from "../pages/NotFound.jsx";
import Home from "../pages/Home.jsx";

import Dashboard from "../pages/Dashboard.jsx";
import Layout from "./Layout.jsx";
import Team from "../pages/Team.jsx";
import Research from "../pages/Research.jsx";


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route path="" element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="team" element={<Team />} />
        <Route path="research" element={<Research />} />
        {/* <Route path="user/:userid" element={<User />} /> */}
        {/* <Route loader={githubInfoLoader} path="github" element={<Github />} /> */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
);

export default router;
