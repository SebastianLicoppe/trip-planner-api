const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Example payload structure (keep for reference)
const scheduleExample = {
  "trip_id": "uuid-here",
  "destination_id": "uuid-here",
  "activity_id": "uuid-here",
  "scheduled_date": "2025-06-01",
  "time_slot": "morning"
};

// Existing POST route
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scheduled_activities')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new GET route to fetch schedules by trip_id
router.get('/trips/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    console.log('Fetching activities for trip:', tripId);
    
    const { data, error } = await supabase
      .from('scheduled_activities')
      .select(`
        *,
        activities (*)
      `)
      .eq('trip_id', tripId.toString()); // Convert to string

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Found activities:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('Full error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.details || 'No additional details'
    });
  }
});

module.exports = router;