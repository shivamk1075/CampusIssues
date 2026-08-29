import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    locationContext: {
      type: String,
      required: true,
    },
    primaryMetric: {
      type: Number,
      required: true,
    },
    quaternaryMetric: {
      type: Number,
      required: true,
    },
    secondaryMetric: {
      type: Number,
      required: true,
    },
    tertiaryMetric: {
      type: Number,
      required: true,
    },
    statusFlagOne: {
      type: Boolean,
      required: true,
    },
    statusFlagTwo: {
      type: Boolean,
      required: true,
    },
    statusFlagThree: {
      type: Boolean,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    mediaUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;