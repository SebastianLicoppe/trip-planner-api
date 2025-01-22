const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

router.get('/trips/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { data, error } = await supabase
      .from('destinations')
      .select(`
        id,
        name,
        country,
        start_date,
        end_date,
        image_path,
        trip_id
      `)
      .eq('trip_id', tripId);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: error.details || 'No additional details'
    });
  }
});

module.exports = router;