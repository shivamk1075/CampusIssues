import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';

export default function ListingItem({ listing }) {
  return (
    <div className='bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]'>
      <Link to={`/listing/${listing._id}`}>
        <img
          src={
            listing.mediaUrls[0] ||
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw2We7XUMHHnWDYCLn06OOr57Rf5Kab51MjxFQS50hSg&s=10'
          }
          alt='issue cover'
          className='h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300'
        />
        <div className='p-3 flex flex-col gap-2 w-full'>
          <p className='truncate text-lg font-semibold text-slate-700'>
            {listing.title}
          </p>

          <div className='flex items-center gap-1'>
            <MdLocationOn className='h-4 w-4 text-green-700' />
            <p className='text-sm text-gray-600 truncate w-full'>
              {listing.locationContext}
            </p>
          </div>

          <p className='text-sm text-gray-600 line-clamp-2'>
            {listing.description}
          </p>

          <p className='text-slate-500 mt-2 font-semibold'>
            Severity Score: <span className={listing.primaryMetric >= 7 ? 'text-red-600' : 'text-slate-700'}>{listing.primaryMetric}/10</span>
            {listing.statusFlagThree && <span className='text-red-600 text-xs ml-2'>(Escalated)</span>}
          </p>

          <div className='text-slate-700 flex gap-4 mt-1'>
            <div className='font-bold text-xs'>
              {listing.tertiaryMetric > 1 ? `${listing.tertiaryMetric} Days` : `${listing.tertiaryMetric} Day`} Noticed
            </div>
            <div className='font-bold text-xs'>
              {listing.secondaryMetric > 1 ? `${listing.secondaryMetric} Students` : `${listing.secondaryMetric} Student`} Affected
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}