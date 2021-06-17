import { registerApplication, start } from "single-spa";

// function showWhenAnyOf(routes) {
//   return (location) => routes.some((route) => location.pathname === route);
// }

function showWhenPrefix(routes) {
  return (location) =>
    routes.some((route) => location.pathname.startsWith(route));
}

// function showExcept(routes) {
//   return (location) => routes.every((route) => location.pathname !== route);
// }

registerApplication({
  name: "@brito/header",
  app: () => System.import("@brito/header"),
  activeWhen: showWhenPrefix(["/"]),
});

start({
  urlRerouteOnly: true,
});
