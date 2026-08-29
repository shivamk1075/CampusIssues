import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import About from './pages/About';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/Createlisting.jsx';
import UpdateListing from './pages/Updatelisting.jsx';
import Listing from './pages/Listing.jsx';
import Search from './pages/search.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/listing/:listingId' element={<Listing />} />
        <Route path='/search' element={<Search />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/createlisting" element={<CreateListing />} />
          <Route path="/updatelisting/:listingId" element={<UpdateListing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
