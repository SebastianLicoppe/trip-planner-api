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
router.get('/trips/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const { data, error } = await supabase
      .from('scheduled_activities')
      .select(`
        *,
        activities (*)
      `)
      .eq('trip_id', tripId);

    if (error) throw error;
    
    // If no data found, return empty array instead of error
    res.json(data || []);
    
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;