import "./App.css";
import {
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WithAuthRoute from "./hoc/WithAuthRoute";
import Dashboard from "./pages/dashboard";
import SignInForm from "./pages/login/login";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className='App'>
          <Routes>
            <Route
              path='/'
              exact
              element={
                <WithAuthRoute>
                  <Dashboard />
                </WithAuthRoute>
              }
            />
            <Route
              path='/'
              exact
              element={
                <WithAuthRoute>
                  <Dashboard />
                </WithAuthRoute>
              }
            />
            <Route path='/login' element={<SignInForm />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
