const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Create trip with destinations
router.post('/', async (req, res) => {
  try {
    const tripId = uuidv4();
    // 1. Create trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert([{ 
        id: tripId,
        name: req.body.name 
      }])
      .select()
      .single();

    if (tripError) throw tripError;

    // 2. Create destinations
    const destinationsWithTripId = req.body.destinations.map(dest => ({
      ...dest,
      id: uuidv4(),
      trip_id: tripId
    }));

    const { data: destinations, error: destError } = await supabase
      .from('destinations')
      .insert(destinationsWithTripId)
      .select();

    if (destError) throw destError;

    res.json({ trip, destinations });
  } catch (error) {
    console.error('Trip creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single trip with all related data
router.get('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select(`
        *,
        destinations (*),
        activities (*)
      `)
      .eq('id', tripId)
      .single();

    if (tripError) throw tripError;

    res.json(trip || {});
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;