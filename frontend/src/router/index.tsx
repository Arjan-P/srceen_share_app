import { createBrowserRouter } from "react-router-dom"
import App from '../App'
import { Home } from "../pages/Home";
import { Room } from "../pages/Room";
import { RoomGuard } from "../pages/RoomGuard";
import { Offline } from "../pages/Offline";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      {
        path: "room/:roomId", element:
          < RoomGuard >
            <Room />
          </RoomGuard >
      },
      { path: "offline", element: <Offline />}
    ],
  },
]);
