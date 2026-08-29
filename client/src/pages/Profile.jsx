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

  // FIREBASE OLD CODE ::

  // const handleFileUpload = async (file) => {
  //   const storage = getStorage(app);
  //   const fileName = new Date().getTime() + file.name;
  //   const storageRef = ref(storage, fileName);
  //   const uploadTask = uploadBytesResumable(storageRef, file);

  //   uploadTask.on(
  //     "state_changed",
  //     (snapshot) => {
  //       const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //       setFilePerc(Math.round(progress));
  //     },
  //     (error) => {
  //       setFileUploadError(true);
  //     },
  //     ()=>{
  //       getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
  //         setFormData(({ ...formData, avatar: downloadURL }));
  //       });
  //     }
  //   );
  // };

  // CLOUDINARY NEW CODE ::
  // const handleFileUpload = async (file) => {
  //   try {
  //     setFileUploadError(false);
  //     setFilePerc(0);

  //     const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  //     const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  //     const cloudinaryFormData = new FormData();
  //     cloudinaryFormData.append('file', file);
  //     cloudinaryFormData.append('upload_preset', uploadPreset);
  //     cloudinaryFormData.append('folder', 'real-estate/avatars');

  //     const response = await fetch(
  //       `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  //       {
  //         method: 'POST',
  //         body: cloudinaryFormData,
  //       }
  //     );

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error?.message || 'Image upload failed');
  //     }

  //     setFilePerc(100);

  //     setFormData((previousData) => ({
  //       ...previousData,
  //       avatar: data.secure_url,
  //     }));
  //   } catch (error) {
  //     console.error('Cloudinary upload failed:', error);
  //     setFileUploadError(true);
  //   }
  // };



  //CLOUDINARY NEW CODE WITH PROGRESS BAR ::
  
  // Mimics Firebase's uploadBytesResumable
    const uploadToCloudinary = (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'real-estate/avatars'); // Optional folder organization

    const uploadTask = {
      snapshot: {
        bytesTransferred: 0,
        totalBytes: file.size,
        ref: { downloadURL: null }, // Mocking the Firebase ref
      },
      on: (eventName, onProgress, onError, onComplete) => {
        // Handle Progress
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            uploadTask.snapshot.bytesTransferred = e.loaded;
            uploadTask.snapshot.totalBytes = e.total;
            onProgress(uploadTask.snapshot);
          }
        };

        // Handle Success
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            uploadTask.snapshot.ref.downloadURL = data.secure_url;
            onComplete();
          } else {
            onError(new Error("Upload failed"));
          }
        };

        // Handle Error
        xhr.onerror = () => onError(new Error("Network error"));
        
        // Start upload
        xhr.send(formData); 
      },
    };

    return uploadTask;
  };

  // Mimics Firebase's getDownloadURL
  const getCloudinaryDownloadURL = (ref) => {
    return Promise.resolve(ref.downloadURL);
  };

  //SIMILAR TO FIREBASE FUNCTIONS
  const handleFileUpload = async (file) => {
    // 1. Call our Cloudinary wrapper instead of Firebase's ref/uploadBytesResumable
    const uploadTask = uploadToCloudinary(file);

    // 2. This structure is now identical to Firebase!
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        
        // This will show the progress in your browser console!
        console.log(`Upload is ${Math.round(progress)}% done`); 
        
        setFilePerc(Math.round(progress));
      },
      (error) => {
        console.error("Upload error:", error);
        setFileUploadError(true);
      },
      () => {
        // 3. Call our mocked getDownloadURL
        getCloudinaryDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          
          console.log("File available at:", downloadURL); // Shows the final URL in console
          
          setFormData((prevData) => ({ ...prevData, avatar: downloadURL }));
        });
      }
    );
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
          <Link to={`/listing/${listing._id}`} className="">
            <img src={listing.imageUrls[0]} alt='Listing title' className="w-16 h-16 object-contain "/>
          </Link>
          <Link className="flex-1 text-slate-700 font-semibold hover:underline truncate" to ={`/listing/${listing._id}`}>
            <p>{listing.name}</p>
          </Link> 

          <div className="flex flex-col item-center">
          <button onClick={() => handleListingDelete(listing._id)} className='text-red-700 uppercase' >Delete</button>
          
          <Link to={`/updatelisting/${listing._id}`} className="">
          <button className='text-green-700 uppercase' >Edit</button>
          </Link>
          </div>
        </div>
      ))
      }
      </div>
      }
    </div>
  )
}
