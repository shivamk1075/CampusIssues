import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  
  // Clean, domain-agnostic state mapping exactly to your new Mongoose schema
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    category: 'all',
    statusFlagTwo: false,   // Safety Hazard
    statusFlagOne: false,   // Urgent/Emergency
    statusFlagThree: false, // Escalated
    sort: 'createdAt',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const searchTermFromUrl = urlParams.get('searchTerm');
    const categoryFromUrl = urlParams.get('category');
    const statusFlagTwoFromUrl = urlParams.get('statusFlagTwo');
    const statusFlagOneFromUrl = urlParams.get('statusFlagOne');
    const statusFlagThreeFromUrl = urlParams.get('statusFlagThree');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      categoryFromUrl ||
      statusFlagTwoFromUrl ||
      statusFlagOneFromUrl ||
      statusFlagThreeFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        category: categoryFromUrl || 'all',
        statusFlagTwo: statusFlagTwoFromUrl === 'true',
        statusFlagOne: statusFlagOneFromUrl === 'true',
        statusFlagThree: statusFlagThreeFromUrl === 'true',
        sort: sortFromUrl || 'createdAt',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);

      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();

      setListings(Array.isArray(data) ? data : []);
      setShowMore(Array.isArray(data) && data.length > 8);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    if (
      e.target.id === 'all' ||
      e.target.id === 'individual' ||
      e.target.id === 'shared'
    ) {
      setSidebardata({ ...sidebardata, category: e.target.id });
    }

    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (
      e.target.id === 'statusFlagTwo' ||
      e.target.id === 'statusFlagOne' ||
      e.target.id === 'statusFlagThree'
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]: e.target.checked || e.target.checked === 'true',
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'createdAt';
      const order = e.target.value.split('_')[1] || 'desc';

      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();

    urlParams.set('searchTerm', sidebardata.searchTerm || '');
    urlParams.set('category', sidebardata.category || 'all');
    urlParams.set('statusFlagTwo', String(sidebardata.statusFlagTwo));
    urlParams.set('statusFlagOne', String(sidebardata.statusFlagOne));
    urlParams.set('statusFlagThree', String(sidebardata.statusFlagThree));
    urlParams.set('sort', sidebardata.sort || 'createdAt');
    urlParams.set('order', sidebardata.order || 'desc');

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };

  return (
    <div className='flex flex-col md:flex-row'>
      <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          <div className='flex items-center gap-2'>
            <label className='whitespace-nowrap font-semibold'>
              Search Term:
            </label>
            <input
              type='text'
              id='searchTerm'
              placeholder='Search issues...'
              className='border rounded-lg p-3 w-full'
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Issue Area:</label>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='all'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.category === 'all'}
              />
              <span>All Areas</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='shared'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.category === 'shared'}
              />
              <span>Common Area</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='individual'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.category === 'individual'}
              />
              <span>Private Room</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='statusFlagThree'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.statusFlagThree}
              />
              <span>Escalated</span>
            </div>
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Filters:</label>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='statusFlagTwo'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.statusFlagTwo}
              />
              <span>Safety Hazard</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='statusFlagOne'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.statusFlagOne}
              />
              <span>Urgent / Emergency</span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Sort:</label>
            <select
              onChange={handleChange}
              defaultValue={'createdAt_desc'}
              id='sort_order'
              className='border rounded-lg p-3'
            >
              <option value='primaryMetric_desc'>Severity: High to Low</option>
              <option value='primaryMetric_asc'>Severity: Low to High</option>
              <option value='createdAt_desc'>Newest First</option>
              <option value='createdAt_asc'>Oldest First</option>
            </select>
          </div>
          <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
            Search Issues
          </button>
        </form>
      </div>
      <div className='flex-1'>
        <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>
          Issue Reports:
        </h1>
        <div className='p-7 flex flex-wrap gap-4'>
          {!loading && listings.length === 0 && (
            <p className='text-xl text-slate-700'>No issues found.</p>
          )}
          {loading && (
            <p className='text-xl text-slate-700 text-center w-full'>
              Loading...
            </p>
          )}

          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className='text-green-700 hover:underline p-7 text-center w-full'
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}