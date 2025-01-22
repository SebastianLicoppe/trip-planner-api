const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

router.post('/', async (req, res) => {
  try {
    const { trip_id, activities, destination_id } = req.body;
    console.log('Received activities:', activities);
    console.log('For destination:', destination_id);

    // No filtering, just map all activities to the destination
    const activitiesToInsert = activities.map(activity => ({
      name: activity.name,
      description: activity.description,
      type: activity.type || 'local',
      trip_id,
      destination_id,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('activities')
      .insert(activitiesToInsert)
      .select();

    if (error) throw error;
    res.json(data);

  } catch (error) {
    console.error('Activity insert error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/trips/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { destinationId } = req.query;

    let query = supabase
      .from('activities')
      .select('*')
      .eq('trip_id', tripId);
    
    if (destinationId) {
      query = query.eq('destination_id', destinationId);
    }

    const { data, error } = await query;
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