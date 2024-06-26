import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

import useMediaQuery from "@mui/material/useMediaQuery";

import { useUserContext } from "../../hooks/UserContext";
import LoadingPage from "../LoadingPage";
import { BASE_URL, LOGIN_STATUS_ROUTE } from "../../constants";
import LoginPage from "../LoginPage";
import { useTheme } from "@emotion/react";
import Badge from "@mui/material/Badge";

import logo from "../../assets/images/logo.png";
import {
  AccountBalanceWalletOutlined,
  AccountBalanceWalletRounded,
  AddLocationOutlined,
  AddLocationRounded,
  AirportShuttleOutlined,
  AirportShuttleRounded,
  DepartureBoardOutlined,
  DepartureBoardRounded,
  ExitToApp,
  HomeOutlined,
  HomeRounded,
  MenuRounded,
  NotificationsOutlined,
  NotificationsRounded,
  Person,
  PersonOutline,
  RouteOutlined,
  RouteRounded,
} from "@mui/icons-material";
import { Button, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import io from "socket.io-client";

const generalNavList = [
  {
    icon: HomeOutlined,
    hoverIcon: HomeRounded,
    color: "blue",
    link: "/",
    label: "Home",
  },
  {
    icon: DepartureBoardOutlined,
    hoverIcon: DepartureBoardRounded,
    color: "blue",
    link: "/schedule",
    label: "Transport Schedule",
  },
  {
    icon: AccountBalanceWalletOutlined,
    hoverIcon: AccountBalanceWalletRounded,
    color: "blue",
    link: "/wallet",
    label: "Wallet",
  },
  {
    icon: PersonOutline,
    hoverIcon: Person,
    color: "blue",
    link: "/profile",
    label: "Profile",
  },
];

const adminNavList = [
  {
    icon: HomeOutlined,
    hoverIcon: HomeRounded,
    color: "blue",
    link: "/",
    label: "Home",
  },
  {
    icon: DepartureBoardOutlined,
    hoverIcon: DepartureBoardRounded,
    color: "blue",
    link: "/schedule",
    label: "Transport Schedule",
  },
  {
    icon: RouteOutlined,
    hoverIcon: RouteRounded,
    color: "blue",
    link: "/routes",
    label: "Routes",
  },
  {
    icon: AddLocationOutlined,
    hoverIcon: AddLocationRounded,
    color: "blue",
    link: "/stops",
    label: "Stops",
  },
  {
    icon: AirportShuttleOutlined,
    hoverIcon: AirportShuttleRounded,
    color: "blue",
    link: "/vehicles",
    label: "Vehicles",
  },
  {
    icon: PersonOutline,
    hoverIcon: Person,
    color: "blue",
    link: "/profile",
    label: "Profile",
  },
];

const Notifications = ({ user }) => {
  // const [notificationIds, setNotificationIds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Connect to the socket server on component mount
    if (user) {
      // console.log(user._id)
      var socket = io(BASE_URL, {
        transports: ["websocket"],
        query: {
          userId: user._id,
        },
      });

      socket.connect();

      // Listen for 'notification' events from the server
      socket.on("notification", (data) => {
        console.log(data.notifId);
        fetchAllNotifications();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const fetchAllNotifications = async () => {
    axios
      .get(`${BASE_URL}/api/v1/notification/all`, {
        withCredentials: true,
      })
      .then((res) => {
        setNotifications(res.data);

        let count = 0;
        for (let notification of res.data) {
          if (notification.seen) {
            continue;
          }
          ++count;
        }
        console.log(count);
        setUnseenCount(count);
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const ChangeAllToSeen = async () => {
    await axios
      .post(
        `${BASE_URL}/api/v1/userNotification/markseen`,
        { userId: user._id },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        fetchAllNotifications();
      });
  };

  const handleToggleNotifications = async (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    // if(anchorEl) { return ;}
    if (user && user._id) {
      try {
        console.log("here");
        ChangeAllToSeen();
      } catch (error) {
        console.log(`error marking notifications seen`, error);
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton onClick={handleToggleNotifications}>
        <Badge badgeContent={unseenCount} color="secondary">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          style: {
            height: "400px",
            width: "400px", // Adjust width as needed
          },
        }}
      >
        {[...notifications].reverse().map((notification) => (
          <MenuItem key={notification.id}>{notification.notif.message}</MenuItem>
        ))}
      </Menu>
    </div>
  );
};

const NavMenuElement = ({ item }) => {
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);

  const pathname = window.location.pathname;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: "pointer",
        backgroundColor: isHovered ? "lightgray" : "white",
        display: "flex",
        alignItems: "center",
        fontSize: "0.8rem",
        minWidth: "5rem",
        padding: "5px 5px 5px 10px",
      }}
      onClick={() => navigate(item.link)}
    >
      {pathname === item.link ? (
        <item.hoverIcon style={{ color: "#387ADF", fontSize: "1.1rem" }} />
      ) : isHovered ? (
        <item.hoverIcon style={{ color: "#50C4ED", fontSize: "1.1rem" }} />
      ) : (
        <item.icon style={{ color: "#50C4ED", fontSize: "1.1rem" }} />
      )}
      &nbsp;
      {item.label}
    </div>
  );
};

const NavElement = ({ item }) => {
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);

  const pathname = window.location.pathname;

  return (
    <Tooltip title={item.label} placement="right">
      <IconButton
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: "pointer" }}
        onClick={() => navigate(item.link)}
      >
        {pathname === item.link ? (
          <item.hoverIcon style={{ color: "#387ADF" }} />
        ) : isHovered ? (
          <item.hoverIcon style={{ color: "#50C4ED" }} />
        ) : (
          <item.icon style={{ color: "#50C4ED" }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

const NavMenu = ({ navList }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MenuRounded />
      </IconButton>

      <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
        {navList.map((el, index) => (
          <NavMenuElement item={el} key={"nav-item-" + index} handleClose={handleClose} />
        ))}
      </Menu>
    </div>
  );
};

const Wrapper = () => {
  const { user, loading, logout, fetchUser } = useUserContext();

  const navigate = useNavigate();

  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingPage width="100px" height="100px" />
      </div>
    );

  if (!user) return <LoginPage />;

  const navList = user.role === "admin" ? adminNavList : generalNavList;

  if (isMd)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <nav
          style={{
            height: "100vh",
            width: "3rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{ height: "2rem", padding: "10px", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Zui Logo" style={{ height: "100%" }} />
          </div>

          <div style={{ marginTop: "2rem", flex: 1 }}>
            {navList.map((el, index) => (
              <NavElement item={el} key={"nav-item-" + index} />
            ))}
          </div>

          <Notifications user={user} />

          <IconButton onClick={logout}>
            <ExitToApp color="warning" />
          </IconButton>
        </nav>

        <div
          style={{
            overflow: "auto",
            padding: "2rem",
            width: "calc(100vw - 7rem)",
            height: "calc(100vh - 4rem)",
            flex: 1,
            minHeight: 0,
          }}
        >
          <Outlet />
        </div>
      </div>
    );

  return (
    <div
      style={{
        dispaly: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <nav
        style={{
          height: "4rem",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{ height: "2rem", padding: "10px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Zui Logo" style={{ height: "100%" }} />
        </div>

        <NavMenu navList={navList} />

        {/* <div style={{ marginTop: "2rem", flex: 1 }}>
          {navList.map((el, index) => (
            <NavElement item={el} key={"nav-item-" + index} />
          ))} */}
        {/* </div> */}
      </nav>
      <div
        style={{
          height: "calc(100vh - 4rem)",
          overflow: "auto",
          boxSizing: "border-box",
          padding: "2rem",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Wrapper;
