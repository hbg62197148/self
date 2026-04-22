import { createRouter, createWebHistory } from "vue-router";
import AdminPage from "../views/AdminPage.vue";
import ProfilePage from "../views/ProfilePage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "profile",
      component: ProfilePage
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminPage
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth"
      };
    }

    return {
      top: 0
    };
  }
});

export default router;
