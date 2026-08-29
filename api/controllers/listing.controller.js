import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
    try {
        const listing = await Listing.create(req.body);
        return res.status(201).json(listing);

    } catch (error) {
        next(error);
    }
}

export const deleteListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if(!listing){
        return next(errorHandler(404,'Listing not found!'));
    }

    if(req.user.id !== listing.userRef){
        return next(errorHandler(401,'You can delete only your own listing!'));
    }

    try {
        await Listing.findByIdAndDelete(req.params.id);
        return res.status(200).json('Listing deleted successfully!');
    } catch (error) {
        return next(error);
    }
};

export const updateListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if(!listing){
        return next(errorHandler(404,'Listing not found!'));
    }

    if(req.user.id !== listing.userRef){
        return next(errorHandler(401,'You can update only your own listing!'));
    }

    try {
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json(updatedListing);
    } catch (error) {
        return next(error);
    }
};

export const getListing = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return next(errorHandler(404, 'Listing not found!'));
        }
        return res.status(200).json(listing);
    } catch (error) {
        return next(error);
    }
};

export const getListings = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 9;
        const startIndex = parseInt(req.query.startIndex) || 0;

        let statusFlagThree = req.query.statusFlagThree;
        if (statusFlagThree === undefined || statusFlagThree === 'false') {
            statusFlagThree = { $in: [true, false] };
        }

        let statusFlagOne = req.query.statusFlagOne;
        if (statusFlagOne === undefined || statusFlagOne === 'false') {
            statusFlagOne = { $in: [true, false] };
        }

        let statusFlagTwo = req.query.statusFlagTwo;
        if (statusFlagTwo === undefined || statusFlagTwo === 'false') {
            statusFlagTwo = { $in: [true, false] };
        }

        let category = req.query.category;
        if (category === undefined || category === 'all') {
            // Updated to match your new generic categories
            category = { $in: ['individual', 'shared', 'general'] }; 
        }

        const searchTerm = req.query.searchTerm || '';
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;

        // Clean, direct query against the new schema fields
        const listings = await Listing.find({
            title: { $regex: searchTerm, $options: 'i' },
            statusFlagThree,
            statusFlagOne,
            statusFlagTwo,
            category
        })
            .sort({ [sort]: order })
            .limit(limit)
            .skip(startIndex);

        return res.status(200).json(listings);

    } catch (error) {
        return next(error);
    }
};