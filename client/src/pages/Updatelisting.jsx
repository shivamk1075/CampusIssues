import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

export default function UpdateListing() {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const params = useParams();
    const [files, setFiles] = useState([]);
    
    // Clean, domain-agnostic state mapping exactly to your new Mongoose schema
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        locationContext: '',
        primaryMetric: 0,
        quaternaryMetric: 0,
        secondaryMetric: 1,
        tertiaryMetric: 1,
        statusFlagOne: false,
        statusFlagTwo: false,
        statusFlagThree: false,
        category: 'individual',
        mediaUrls: [],
    });
    
    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            const listingId = params.listingId;
            const res = await fetch(`/api/listing/get/${listingId}`);
            const data = await res.json();

            if (data.success === false) {
                console.log(data.message);
                return;
            }

            // Since the backend is completely clean, we just set the data directly.
            setFormData(data);
        };

        fetchListing();
    }, [params.listingId]);

    const handleImageSubmit = async () => {
        if (files.length > 0 && files.length + formData.mediaUrls.length < 7) {
            setUploading(true);
            setImageUploadError(false);

            try {
                const promises = Array.from(files).map(storeImage);
                const urls = await Promise.all(promises);

                setFormData((prev) => ({
                    ...prev,
                    mediaUrls: [...prev.mediaUrls, ...urls],
                }));
                setUploading(false);
            } catch (error) {
                setImageUploadError('Image upload failed (2 mb max per image)');
                setUploading(false);
            }
        } else {
            setImageUploadError('You can only upload a maximum of 6 images');
            setUploading(false);
        }
    };

    const storeImage = async (file) => {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        data.append('folder', 'sde-project/media'); 

        const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST', 
            body: data
        });

        const json = await res.json();
        if (!json.secure_url) throw new Error("Image upload failed");
        return json.secure_url; 
    };

    const handleRemoveImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            mediaUrls: prev.mediaUrls.filter((_, i) => i !== index),
        }));
    };

    const handleChange = (e) => {
        if (e.target.id === 'shared' || e.target.id === 'individual') {
            setFormData({
                ...formData,
                category: e.target.id,
            });
        }

        if (e.target.id === 'statusFlagTwo' || e.target.id === 'statusFlagOne' || e.target.id === 'statusFlagThree') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked,
            });
        }

        if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (formData.mediaUrls.length === 0) return setError('Please upload at least one image/proof.');
            
            if (+formData.primaryMetric < +formData.quaternaryMetric) {
                return setError('Escalation priority cannot exceed base severity score.');
            }

            setLoading(true);
            setError(false);

            const res = await fetch(`/api/listing/update/${params.listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, userRef: currentUser._id }),
            });

            const data = await res.json();
            setLoading(false);

            if (data.success === false) {
                setError(data.message);
                return;
            }

            navigate(`/listing/${data._id}`);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <main className='p-3 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-semibold text-center my-7'>Update Issue Report</h1>
            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
                <div className="flex flex-col gap-4 flex-1">
                    <input type="text" placeholder='Issue Title (e.g., Leaking Tap)' id='title' className='border p-3 rounded-lg' maxLength='62' minLength='5' required 
                    onChange={handleChange} 
                    value={formData.title} />

                    <textarea placeholder='Describe the issue in detail...' id='description' className='border p-3 rounded-lg' maxLength='500' minLength='10' required 
                    onChange={handleChange} 
                    value={formData.description} />

                    <input type="text" placeholder='Hostel Name & Room (e.g., Rajputana, Rm 42)' id='locationContext' className='border p-3 rounded-lg' maxLength='100' minLength='5' required 
                    onChange={handleChange} 
                    value={formData.locationContext} />

                    <div className="flex gap-6 flex-wrap">
                        <div className="flex gap-2">
                            <input type="checkbox" id='shared' className='w-5'
                            onChange={handleChange}
                            checked={formData.category === 'shared'}
                            />
                            <span>Common Area Issue</span>
                        </div>

                        <div className="flex gap-2">
                            <input type="checkbox" id='individual' className='w-5'
                            onChange={handleChange}
                            checked={formData.category === 'individual'}
                            />
                            <span>Private Room Issue</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <input type="checkbox" id='statusFlagTwo' className='w-5'
                            onChange={handleChange}
                            checked={formData.statusFlagTwo}
                            />
                            <span>Safety Hazard</span>
                        </div>

                        <div className="flex gap-2">
                            <input type="checkbox" id='statusFlagOne' className='w-5'
                            onChange={handleChange}
                            checked={formData.statusFlagOne}
                            />
                            <span>Urgent / Emergency</span>
                        </div>

                        <div className="flex gap-2">
                            <input type="checkbox" id='statusFlagThree' className='w-5'
                            onChange={handleChange}
                            checked={formData.statusFlagThree}
                            />
                            <span>Escalate to Warden</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <input type="number"  
                            id='tertiaryMetric' min='1' max='30' required className='border border-gray-300 p-3 rounded-lg'
                            onChange={handleChange}
                            value={formData.tertiaryMetric}
                            />
                            <p>Days Noticed</p>   
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="number"  
                            id='secondaryMetric' min='1' max='500' required className='border border-gray-300 p-3 rounded-lg'
                            onChange={handleChange}
                            value={formData.secondaryMetric}
                            />
                            <p>Students Affected</p>   
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="number"  
                            id='primaryMetric' min='1' max='10' required className='border border-gray-300 p-3 rounded-lg'
                            onChange={handleChange}
                            value={formData.primaryMetric}
                            />
                            <div className="flex flex-col items-center">
                                <p>Severity Score</p> 
                                <span className='text-xs'>(1-10 scale)</span>  
                            </div>
                        </div>
                        
                        {formData.statusFlagThree && (
                            <div className="flex items-center gap-2">
                                <input type="number"  
                                id='quaternaryMetric' min='1' max='5' required className='border border-gray-300 p-3 rounded-lg'
                                onChange={handleChange}
                                value={formData.quaternaryMetric}
                                />
                                <div className="flex flex-col items-center">
                                    <p>Escalation Priority</p> 
                                    <span className='text-xs'>(1-5 scale)</span>  
                                </div>
                            </div> 
                        )}

                        </div>
                </div>
                <div className="flex flex-col flex-1 gap-4">
                    <p className='font-semibold'>Proof of Damage:
                    <span className='font-normal text-gray-600 ml-2'>First image will be the cover photo (max 6)</span>
                    </p>
                    <div className="flex gap-4">
                        <input onChange={(e) => setFiles(e.target.files)} className='p-3 border border-gray-300 rounded w-full' type='file' id='media' accept='image/*' multiple />
                        <button type="button" onClick={handleImageSubmit} className='p-3 text-green-700 border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>{uploading ? 'Uploading...' : 'Attach Photos'}</button>
                    </div>
                <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>
                {
                    formData.mediaUrls.length > 0 && formData.mediaUrls.map((url, index) => (
                        <div key={url} className="flex justify-between p-3 border items-center">
                            <img src={url} alt="proof of issue" className='w-20 h-20 object-contained rounded-lg' />
                            <button onClick={(e) => handleRemoveImage(index)} type="button" className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75' >Delete</button>
                        </div>
                    ))
                }
                <button disabled={loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>{loading ? 'Updating...' : 'Update Issue Report'}</button>
                {error && <p className='text-red-700 text-sm'>{error}</p>}
                </div>
            </form>
        </main>
    )
}