const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

router.post('/', async (req, res) => {
  try {
    const { trip_id, activities, destination_id } = req.body;
    
    if (!trip_id || !destination_id || !Array.isArray(activities)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Filter activities by destination and map properties
    const activitiesToInsert = activities.filter(activity =>
      activity.destination === destination_id || !activity.destination
    ).map(activity => ({
      name: activity.name,
      description: activity.description,
      type: activity.type || 'local',
      trip_id,
      destination_id,
      // Add new fields
      sub_genre: activity.sub_genre,
      duration: activity.duration,
      best_time: activity.best_time,
      insider_tip: activity.insider_tip,
      location: activity.location,
      location_details: activity.locationDetails || activity.location_details,
      small_description: activity.small_description,
      detailed_description: activity.detailed_description
    }));

    const { data, error } = await supabase
      .from('activities')
      .insert(activitiesToInsert)
      .select();

    if (error) throw error;
    res.json(data);

  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: error.details || 'No additional details'
    });
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