import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import ViewBoard from '../views/ViewBoard.vue';

// Define your routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/board/:id',
    name: 'View Board',
    component: ViewBoard,
  },
  // Add more routes as needed
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(), // Use HTML5 History API
  routes,
});

export default router; // Export the router instance
