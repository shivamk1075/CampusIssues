import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem.jsx';

export default function Home() {
  const [escalatedIssues, setEscalatedIssues] = useState([]);
  const [commonAreaIssues, setCommonAreaIssues] = useState([]);
  const [privateRoomIssues, setPrivateRoomIssues] = useState([]);
  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchEscalatedIssues = async () => {
      try {
        const res = await fetch('/api/listing/get?statusFlagThree=true&limit=4');
        const data = await res.json();
        setEscalatedIssues(data);
        fetchPrivateRoomIssues();
      } catch (error) {
        console.log(error);
      }
    };
    
    const fetchPrivateRoomIssues = async () => {
      try {
        const res = await fetch('/api/listing/get?category=individual&limit=4');
        const data = await res.json();
        setPrivateRoomIssues(data);
        fetchCommonAreaIssues();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchCommonAreaIssues = async () => {
      try {
        const res = await fetch('/api/listing/get?category=shared&limit=4');
        const data = await res.json();
        setCommonAreaIssues(data);
      } catch (error) {
        console.log(error);
      }
    };
    
    fetchEscalatedIssues();
  }, []);

  return (
    <div>
      {/* top */}
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
          Track and resolve <span className='text-slate-500'>hostel</span>
          <br />
          maintenance issues
        </h1>
        <div className='text-gray-400 text-xs sm:text-sm'>
          Campus Issue Tracker is the centralized platform to report, track, and escalate problems.
          <br />
          Ensure our living spaces remain safe and functional for everyone.
        </div>
        <Link
          to={'/search'}
          className='text-xs sm:text-sm text-blue-800 font-bold hover:underline'
        >
          Browse reported issues...
        </Link>
      </div>

      {/* swiper */}
      <Swiper navigation>
        {escalatedIssues &&
          escalatedIssues.length > 0 &&
          escalatedIssues.map((listing) => {
            const firstMedia =
              listing.mediaUrls?.[0] ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw2We7XUMHHnWDYCLn06OOr57Rf5Kab51MjxFQS50hSg&s=10';

            return (
              <SwiperSlide key={listing._id}>
                <div
                  style={{
                    background: `url(${firstMedia}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                  className='h-[500px]'
                ></div>
              </SwiperSlide>
            );
          })}
      </Swiper>

      {/* listing results for Escalated, Private Room, and Common Area */}
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
        
        {escalatedIssues && escalatedIssues.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent Escalated Issues</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?statusFlagThree=true'}>Show more escalated issues</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {escalatedIssues.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {privateRoomIssues && privateRoomIssues.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent Private Room Issues</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?category=individual'}>Show more room issues</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {privateRoomIssues.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {commonAreaIssues && commonAreaIssues.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent Common Area Issues</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?category=shared'}>Show more common area issues</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {commonAreaIssues.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}