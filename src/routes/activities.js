const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Example payload structure
const activitiesExample = {
  "destination_id": "uuid-here",
  "trip_id": "uuid-here",
  "activities": [
    {
      "name": "Eiffel Tower Visit",
      "description": "Visit the iconic tower",
      "type": "iconic"
    },
    {
      "name": "Local Market Tour",
      "description": "Explore local markets",
      "type": "local"
    }
  ]
};

router.post('/', async (req, res) => {
  try {
    const activitiesWithIds = req.body.activities.map(activity => ({
      ...activity,
      trip_id: req.body.trip_id,
      destination_id: req.body.destination_id
    }));

    const { data, error } = await supabase
      .from('activities')
      .insert(activitiesWithIds)
      .select();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new GET route to fetch activities by trip_id
router.get('/trips/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('trip_id', tripId.toString());

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