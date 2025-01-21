const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Example payload structure
const scheduleExample = {
  "trip_id": "uuid-here",
  "destination_id": "uuid-here",
  "activity_id": "uuid-here",
  "scheduled_date": "2025-06-01",
  "time_slot": "morning"
};

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

module.exports = router;