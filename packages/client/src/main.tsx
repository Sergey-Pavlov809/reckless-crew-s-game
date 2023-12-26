import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Main, Profile, GamePage } from './pages'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from './routes'
import { AppLayout, RootBoundary } from './components'
import 'antd/dist/reset.css'
import './index.css'
import { store } from './store'
import { Provider } from 'react-redux'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: routes.app(),
        element: <App />,
      },

      {
        path: routes.profile(),
        element: <Profile />,
      },
      {
        path: routes.main(),
        element: <Main />,
      },
      {
        path: routes.game(),
        element: <GamePage />,
      },
      {
        path: routes.leaderboard(),
        element: <div>/leaderboard</div>,
      },
      {
        path: routes.forum(),
        element: <div>/chat</div>,
      },
      {
        path: routes.topic(),
        element: <div>/topic</div>,
      },
      {
        path: '*',
        element: <div>*</div>,
      },
    ],
  },
  {
    element: <AppLayout disableHeader />,
    children: [
      {
        path: routes.signin(),
        element: <div>/sign-in</div>,
      },
      {
        path: routes.signup(),
        element: <div>/sign-up</div>,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} fallbackElement={<RootBoundary />} />
    </Provider>
  </React.StrictMode>
)
