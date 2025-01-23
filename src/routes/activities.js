const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
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

    // 3. Create activities for each destination
    const activitiesToInsert = req.body.destinations.flatMap(dest =>
      dest.activities.map(activity => ({
        ...activity,
        id: uuidv4(),
        trip_id: tripId,
        destination_id: dest.id // Associate activity with the destination
      }))
    );

    // Log activities to insert
    console.log('Activities to insert:', JSON.stringify(activitiesToInsert, null, 2));

    const { data: activities, error: activityError } = await supabase
      .from('activities')
      .insert(activitiesToInsert)
      .select();

    if (activityError) {
      console.error('Supabase activities insertion error:', activityError);
      throw activityError;
    }

    res.json({ trip, destinations, activities });

  } catch (error) {
    console.error('Trip creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/trip/:tripId/activities', async (req, res) => {
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