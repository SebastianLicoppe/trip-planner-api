const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Create trip with destinations
router.post('/', async (req, res) => {
  try {
    const tripId = uuidv4();
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert([{ 
        id: tripId,
        name: req.body.name 
      }])
      .select()
      .single();

    if (tripError) throw tripError;

    const destinationsWithTripId = req.body.destinations.map(dest => ({
      ...dest,
      id: uuidv4(),
      trip_id: tripId,
      image_url: dest.image_url // Add this field
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

router.post('/map-activities/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { activities } = req.body;
 
    const { data: destinations, error: destError } = await supabase
      .from('destinations') 
      .select('id, name')
      .eq('trip_id', tripId);
 
    if (destError) throw destError;
    if (!destinations?.length) {
      return res.status(404).json({ error: 'No destinations found for trip' });
    }
 
    console.log('Destinations:', destinations);
 
    const allActivities = [];
 
    for (const activity of activities) {
      console.log('Checking activity:', activity.title);
      console.log('Location:', activity.locationDetails?.city);
      
      const matchingDest = destinations.find(dest => {
        const cityMatch = activity.locationDetails?.city?.toLowerCase().includes(dest.name.toLowerCase());
        const locationMatch = activity.location?.toLowerCase().includes(dest.name.toLowerCase());
        console.log('Destination:', dest.name, 'Matches:', cityMatch || locationMatch);
        return cityMatch || locationMatch;
      });
 
      if (matchingDest) {
        allActivities.push({
          id: uuidv4(),
          trip_id: tripId,
          destination_id: matchingDest.id,
          name: activity.title,
          description: activity.small_description, // Changed this line
          type: activity.genre.toLowerCase(),
          sub_genre: activity.sub_genre,
          duration: activity.duration,
          best_time: activity.best_time,
          insider_tip: activity.insider_tip,
          location: activity.location,
          location_details: activity.locationDetails
        });
      }
    }
 
    const { data, error } = await supabase
      .from('activities')
      .insert(allActivities)
      .select();
 
    if (error) throw error;
    res.json({ activities: data });
 
  } catch (error) {
    console.error('Error:', error);
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

router.delete('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) throw error;
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;