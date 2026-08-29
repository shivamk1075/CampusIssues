import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
  FaMapMarkerAlt,
  FaClock,
  FaUserFriends,
  FaExclamationTriangle,
  FaFire,
  FaInfoCircle
} from 'react-icons/fa';
import Contact from '../components/Contact';

export default function Listing() {
  SwiperCore.use([Navigation]);
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [contact, setContact] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/listing/get/${params.listingId}`);
            const data = await res.json();

            if (data.success === false) {
              setError(true);
              setLoading(false);
              return;
            }

            // Clean direct assignment - no legacy fallbacks needed
            setListing(data);
            setLoading(false);
            setError(false);
            
        } catch (error) {
            setError(true);
            setLoading(false);
        }
    }
    fetchListing();
  }, [params.listingId]);

  return (
    <main>
      {loading && <p className='text-center my-7 text-2xl '>Loading...</p>}
      {error && <p className='text-center my-7 text-2xl '>Issue not found!</p>}
      {listing && !loading && !error && 
      <div>
      <Swiper navigation>
        {listing.mediaUrls.map((url) => (
          <SwiperSlide key={url}>
            <div className='h-[550px]' style={{background: `url(${url}) center no-repeat` ,backgroundSize: 'cover'}}></div>
          </SwiperSlide>
        ))}
      </Swiper>

        <div className='flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4'>
              <p className='text-2xl font-semibold'>
                {listing.title}
              </p>
        
        <p className='flex items-center mt-2 gap-2 text-slate-600 text-sm'>
          <FaMapMarkerAlt className='text-green-700' />
          {listing.locationContext}
        </p>
        
        <div className='flex gap-4 mt-2'>
            <p className='bg-slate-800 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
              {listing.category === 'shared' ? 'Common Area' : 'Private Room'}
            </p>
            {listing.statusFlagThree && (
              <p className='bg-red-700 w-full max-w-[250px] text-white text-center p-1 rounded-md'>
                Escalated (Priority: {listing.quaternaryMetric})
              </p>
            )}
        </div>
          <p className='text-slate-800 mt-4'>
            <span className='font-semibold text-black'>Description - </span>
            {listing.description}
          </p>
          <ul className='text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6 mt-4'>
            
            <li className='flex items-center gap-1 whitespace-nowrap'>
              <FaInfoCircle className='text-lg' />
              Severity Score: {listing.primaryMetric}/10
            </li>

            <li className='flex items-center gap-1 whitespace-nowrap'>
              <FaClock className='text-lg' />
              {listing.tertiaryMetric > 1 
                ? `${listing.tertiaryMetric} Days Noticed` 
                : `${listing.tertiaryMetric} Day Noticed`}
            </li>

            <li className='flex items-center gap-1 whitespace-nowrap'>
              <FaUserFriends className='text-lg' />
              {listing.secondaryMetric > 1 
                ? `${listing.secondaryMetric} Students Affected` 
                : `${listing.secondaryMetric} Student Affected`}
            </li>

            {listing.statusFlagTwo && (
                <li className='flex items-center gap-1 whitespace-nowrap text-red-600'>
                <FaExclamationTriangle className='text-lg' />
                Safety Hazard
                </li>
            )}

            {listing.statusFlagOne && (
                <li className='flex items-center gap-1 whitespace-nowrap text-red-600'>
                <FaFire className='text-lg' />
                Urgent / Emergency
                </li>
            )}
          </ul>
          
          {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3 mt-6'
              >
                Contact Reporter
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
      </div>}
    </main>
  )
}