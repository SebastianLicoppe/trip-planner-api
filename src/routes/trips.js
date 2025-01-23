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

// POST /api/trips/map-activities/:tripId
router.post('/map-activities/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { activities } = req.body;

    // Get destinations for this trip
    const { data: destinations, error: destError } = await supabase
      .from('destinations')
      .select('id, name')
      .eq('trip_id', tripId);

    if (destError) throw destError;

    // Group activities by city
    const activitiesByCity = {};
    activities.forEach(activity => {
      const city = activity.locationDetails?.city || activity.location;
      if (!activitiesByCity[city]) {
        activitiesByCity[city] = [];
      }
      activitiesByCity[city].push(activity);
    });

    const allActivities = [];
    
    // Map activities to destinations
    for (const destination of destinations) {
      const cityActivities = activitiesByCity[destination.name] || [];
      
      const formattedActivities = cityActivities.map(activity => ({
        id: uuidv4(),
        trip_id: tripId,
        destination_id: destination.id,
        name: activity.title,
        description: activity.detailed_description,
        type: activity.genre.toLowerCase(),
        sub_genre: activity.sub_genre,
        duration: activity.duration,
        best_time: activity.best_time,
        insider_tip: activity.insider_tip,
        location: activity.location,
        location_details: activity.locationDetails,
        small_description: activity.small_description
      }));

      const { data: inserted, error: activityError } = await supabase
        .from('activities')
        .insert(formattedActivities)
        .select();

      if (activityError) throw activityError;
      allActivities.push(...inserted);
    }

    res.json({ activities: allActivities });

  } catch (error) {
    console.error('Error mapping activities:', error);
    res.status(500).json({ error: error.message });
  }
});


// Get all trips
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        destinations (*),
        activities (*)
      `);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
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