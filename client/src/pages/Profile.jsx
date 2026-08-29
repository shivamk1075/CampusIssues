import { useSelector } from "react-redux"
import {useRef,useState, useEffect} from 'react'
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signoutUserStart, signoutUserFailure, signoutUserSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

// import {getDownloadURL, getStorage,ref, uploadBytesResumable} from 'firebase/storage'
// import { app } from "../firebase";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file,setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  console.log(formData);
  useEffect(() => {
    if(file){
      handleFileUpload(file);
    }
  }, [file]);


  //Simpler Cloudinary Image Upload
  const handleFileUpload = async (file) => {
    try {
      setFilePerc("Uploading...");
      setFileUploadError(false);

      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      data.append('folder', 'real-estate/avatars');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST', body: data
      });
      
      const json = await res.json();
      
      // If Cloudinary didn't give us a URL, immediately jump to the catch block
      if (!json.secure_url) throw new Error(); 

      setFormData((prev) => ({ ...prev, avatar: json.secure_url }));
      setFilePerc("Done!");
      
    } catch (error) {
      setFileUploadError(true);
      setFilePerc(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if(data.success == false){
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if(data.success == false){
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess());

    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignout = async () => {
    try {
      dispatch(signoutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if(data.success === false){
        dispatch(signoutUserFailure(data.message));
        return ;
      }
      dispatch(signoutUserSuccess());
    } catch (error) {
      dispatch(signoutUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if(data.success === false){
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if(data.success === false){
        console.log(data.message);
        return;
      }

      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));

    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} className='hidden' accept="image/*"/>

        <img onClick={() => fileRef.current?.click()} src={formData.avatar || currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' referrerPolicy="no-referrer"/>
        <p className='text-sm self-center'>
          {fileUploadError ?
          (<span className='text-red-700'>Error Image upload</span>) :
          filePerc > 0 && filePerc < 100 ?(
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>)
            :
            filePerc === 100 ?(
              <span className='text-green-700'>Image Successfully Uploaded</span>) :
              ""
          }
        </p>

        <input type="text" placeholder='username' defaultValue={currentUser.username} id='username' className='border p-3 rounded-lg' onChange={handleChange}/>
        <input type="text" placeholder='email' defaultValue={currentUser.email} id='email' className='border p-3 rounded-lg' onChange={handleChange}/>

        <input type="password" placeholder='password' id='password' className='border p-3 rounded-lg' onChange={handleChange}/>

        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>{loading ? 'Loading...' : 'Update'}</button>
        <Link className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opactiy-95' to={"/createlisting"}>
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleSignout} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>

      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? 'User is updated successfully!' : ''}</p>
      <button onClick={handleShowListings} className='text-green-700 w-full' >Show Listings</button>
      <p className='text-red-700 mt-5'>{showListingsError ? 'Error occurred while fetching listings!' : ''}</p>

      {userListings && userListings.length > 0 && 

      <div className="flex flex-col gap-4">
        <h1 className="text-center mt-7 text-2xl font-semibold">Your Listings</h1>
          {userListings.map((listing) => (
            <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={
                    listing.mediaUrls[0] || 
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw2We7XUMHHnWDYCLn06OOr57Rf5Kab51MjxFQS50hSg&s=10'
                  }
                  alt='Issue cover'
                  className="w-16 h-16 object-contain"
                />
              </Link>

              <Link className="flex-1 text-slate-700 font-semibold hover:underline truncate" to={`/listing/${listing._id}`}>
                <p>{listing.title}</p>
              </Link>

              <div className="flex flex-col items-center">
                <button onClick={() => handleListingDelete(listing._id)} className='text-red-700 uppercase'>
                  Delete
                </button>

                <Link to={`/updatelisting/${listing._id}`}>
                  <button className='text-green-700 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
      </div>
      }
    </div>
  )
}
