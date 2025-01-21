const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Example payload structure (keep as comment for reference)
const tripExample = {
  "name": "European Adventure",
  "destinations": [
    {
      "name": "Paris",
      "country": "France",
      "start_date": "2025-06-01",
      "end_date": "2025-06-05",
      "image_path": "/destinations/paris.jpg"
    },
    {
      "name": "Rome",
      "country": "Italy",
      "start_date": "2025-06-06",
      "end_date": "2025-06-10",
      "image_path": "/destinations/rome.jpg"
    }
  ]
};

// Create trip with destinations
router.post('/', async (req, res) => {
  try {
    // 1. Create trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert([{ name: req.body.name }])
      .select()
      .single();

    if (tripError) throw tripError;

    // 2. Create destinations
    const destinationsWithTripId = req.body.destinations.map(dest => ({
      ...dest,
      trip_id: trip.id
    }));

    const { data: destinations, error: destError } = await supabase
      .from('destinations')
      .insert(destinationsWithTripId)
      .select();

    if (destError) throw destError;

    res.json({ trip, destinations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single trip with all related data
router.get('/:tripId', async (req, res) => {
  try {
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select(`
        *,
        destinations (*),
        activities (*),
        scheduled_activities (*)
      `)
      .eq('id', req.params.tripId)
      .single();

    if (tripError) throw tripError;
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;