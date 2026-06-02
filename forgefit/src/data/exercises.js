// MET values for strength training reference: moderate intensity ~5.0, heavy ~6.0
// Cardio has higher MET values.

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Legs', 'Glutes', 'Core', 'Cardio', 'Full Body',
]

export const EXERCISES = [
  // CHEST
  { name: 'Barbell Bench Press', muscleGroup: 'Chest', met: 5.5 },
  { name: 'Dumbbell Bench Press', muscleGroup: 'Chest', met: 5.0 },
  { name: 'Incline Barbell Press', muscleGroup: 'Chest', met: 5.5 },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', met: 5.0 },
  { name: 'Decline Bench Press', muscleGroup: 'Chest', met: 5.0 },
  { name: 'Dumbbell Flyes', muscleGroup: 'Chest', met: 4.0 },
  { name: 'Cable Flyes', muscleGroup: 'Chest', met: 4.0 },
  { name: 'Push-Ups', muscleGroup: 'Chest', met: 3.8 },
  { name: 'Chest Dips', muscleGroup: 'Chest', met: 5.0 },
  { name: 'Cable Crossover', muscleGroup: 'Chest', met: 4.5 },
  { name: 'Pec Deck Machine', muscleGroup: 'Chest', met: 4.0 },
  { name: 'Landmine Press', muscleGroup: 'Chest', met: 4.5 },

  // BACK
  { name: 'Deadlift', muscleGroup: 'Back', met: 6.0 },
  { name: 'Barbell Row', muscleGroup: 'Back', met: 5.5 },
  { name: 'Dumbbell Row', muscleGroup: 'Back', met: 5.0 },
  { name: 'Lat Pulldown', muscleGroup: 'Back', met: 4.5 },
  { name: 'Pull-Ups', muscleGroup: 'Back', met: 5.0 },
  { name: 'Chin-Ups', muscleGroup: 'Back', met: 5.0 },
  { name: 'Seated Cable Row', muscleGroup: 'Back', met: 4.5 },
  { name: 'T-Bar Row', muscleGroup: 'Back', met: 5.5 },
  { name: 'Face Pulls', muscleGroup: 'Back', met: 3.5 },
  { name: 'Romanian Deadlift', muscleGroup: 'Back', met: 5.5 },
  { name: 'Hyperextensions', muscleGroup: 'Back', met: 3.5 },
  { name: 'Inverted Row', muscleGroup: 'Back', met: 4.5 },
  { name: 'Straight Arm Pulldown', muscleGroup: 'Back', met: 4.0 },

  // SHOULDERS
  { name: 'Overhead Barbell Press', muscleGroup: 'Shoulders', met: 5.0 },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', met: 4.5 },
  { name: 'Arnold Press', muscleGroup: 'Shoulders', met: 4.5 },
  { name: 'Lateral Raises', muscleGroup: 'Shoulders', met: 3.5 },
  { name: 'Front Raises', muscleGroup: 'Shoulders', met: 3.5 },
  { name: 'Rear Delt Flyes', muscleGroup: 'Shoulders', met: 3.5 },
  { name: 'Upright Row', muscleGroup: 'Shoulders', met: 4.0 },
  { name: 'Machine Shoulder Press', muscleGroup: 'Shoulders', met: 4.5 },
  { name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', met: 3.5 },
  { name: 'Shrugs', muscleGroup: 'Shoulders', met: 3.0 },

  // BICEPS
  { name: 'Barbell Curl', muscleGroup: 'Biceps', met: 3.0 },
  { name: 'Dumbbell Curl', muscleGroup: 'Biceps', met: 3.0 },
  { name: 'Hammer Curl', muscleGroup: 'Biceps', met: 3.0 },
  { name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', met: 3.0 },
  { name: 'Concentration Curl', muscleGroup: 'Biceps', met: 3.0 },
  { name: 'Cable Curl', muscleGroup: 'Biceps', met: 3.0 },
  { name: 'Preacher Curl', muscleGroup: 'Biceps', met: 3.0 },
  { name: 'Reverse Curl', muscleGroup: 'Biceps', met: 3.0 },
  { name: 'Zottman Curl', muscleGroup: 'Biceps', met: 3.0 },

  // TRICEPS
  { name: 'Tricep Pushdown (Cable)', muscleGroup: 'Triceps', met: 3.5 },
  { name: 'Skull Crushers', muscleGroup: 'Triceps', met: 3.5 },
  { name: 'Close Grip Bench Press', muscleGroup: 'Triceps', met: 4.5 },
  { name: 'Tricep Dips', muscleGroup: 'Triceps', met: 4.5 },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', met: 3.5 },
  { name: 'Rope Pushdown', muscleGroup: 'Triceps', met: 3.5 },
  { name: 'Diamond Push-Ups', muscleGroup: 'Triceps', met: 3.8 },
  { name: 'Kickbacks', muscleGroup: 'Triceps', met: 3.0 },

  // LEGS
  { name: 'Barbell Back Squat', muscleGroup: 'Legs', met: 6.5 },
  { name: 'Front Squat', muscleGroup: 'Legs', met: 6.0 },
  { name: 'Leg Press', muscleGroup: 'Legs', met: 5.5 },
  { name: 'Bulgarian Split Squat', muscleGroup: 'Legs', met: 5.5 },
  { name: 'Lunges', muscleGroup: 'Legs', met: 5.5 },
  { name: 'Walking Lunges', muscleGroup: 'Legs', met: 5.5 },
  { name: 'Leg Extension', muscleGroup: 'Legs', met: 3.5 },
  { name: 'Leg Curl (Hamstring)', muscleGroup: 'Legs', met: 3.5 },
  { name: 'Standing Calf Raise', muscleGroup: 'Legs', met: 3.0 },
  { name: 'Seated Calf Raise', muscleGroup: 'Legs', met: 3.0 },
  { name: 'Hack Squat', muscleGroup: 'Legs', met: 5.5 },
  { name: 'Step-Ups', muscleGroup: 'Legs', met: 5.0 },
  { name: 'Goblet Squat', muscleGroup: 'Legs', met: 5.5 },
  { name: 'Sumo Squat', muscleGroup: 'Legs', met: 5.5 },

  // GLUTES
  { name: 'Hip Thrust (Barbell)', muscleGroup: 'Glutes', met: 5.0 },
  { name: 'Hip Thrust (Machine)', muscleGroup: 'Glutes', met: 4.5 },
  { name: 'Glute Bridge', muscleGroup: 'Glutes', met: 3.5 },
  { name: 'Cable Kickback', muscleGroup: 'Glutes', met: 3.5 },
  { name: 'Donkey Kick', muscleGroup: 'Glutes', met: 3.5 },
  { name: 'Abduction Machine', muscleGroup: 'Glutes', met: 3.0 },
  { name: 'Sumo Deadlift', muscleGroup: 'Glutes', met: 6.0 },
  { name: 'Banded Hip Abduction', muscleGroup: 'Glutes', met: 3.0 },

  // CORE
  { name: 'Crunches', muscleGroup: 'Core', met: 3.0 },
  { name: 'Bicycle Crunches', muscleGroup: 'Core', met: 3.5 },
  { name: 'Plank', muscleGroup: 'Core', met: 3.5 },
  { name: 'Side Plank', muscleGroup: 'Core', met: 3.0 },
  { name: 'Leg Raises', muscleGroup: 'Core', met: 3.5 },
  { name: 'Hanging Leg Raise', muscleGroup: 'Core', met: 4.0 },
  { name: 'Russian Twists', muscleGroup: 'Core', met: 3.5 },
  { name: 'Cable Crunch', muscleGroup: 'Core', met: 3.5 },
  { name: 'Ab Rollout', muscleGroup: 'Core', met: 4.0 },
  { name: 'Mountain Climbers', muscleGroup: 'Core', met: 8.0 },
  { name: 'V-Ups', muscleGroup: 'Core', met: 4.0 },
  { name: 'Dead Bug', muscleGroup: 'Core', met: 3.0 },

  // CARDIO
  { name: 'Treadmill Running', muscleGroup: 'Cardio', met: 9.8 },
  { name: 'Treadmill Walking', muscleGroup: 'Cardio', met: 3.8 },
  { name: 'Incline Walking', muscleGroup: 'Cardio', met: 5.5 },
  { name: 'Stationary Bike', muscleGroup: 'Cardio', met: 7.0 },
  { name: 'Rowing Machine', muscleGroup: 'Cardio', met: 7.0 },
  { name: 'Elliptical', muscleGroup: 'Cardio', met: 5.0 },
  { name: 'Jump Rope', muscleGroup: 'Cardio', met: 10.0 },
  { name: 'Stair Climber', muscleGroup: 'Cardio', met: 8.0 },
  { name: 'HIIT Intervals', muscleGroup: 'Cardio', met: 10.0 },
  { name: 'Swimming', muscleGroup: 'Cardio', met: 8.0 },
  { name: 'Boxing / Bag Work', muscleGroup: 'Cardio', met: 7.8 },
  { name: 'Battle Ropes', muscleGroup: 'Cardio', met: 10.0 },

  // FULL BODY
  { name: 'Power Clean', muscleGroup: 'Full Body', met: 6.5 },
  { name: 'Kettlebell Swings', muscleGroup: 'Full Body', met: 9.8 },
  { name: 'Burpees', muscleGroup: 'Full Body', met: 8.0 },
  { name: 'Thruster', muscleGroup: 'Full Body', met: 7.0 },
  { name: 'Clean & Press', muscleGroup: 'Full Body', met: 7.0 },
  { name: 'Farmer\'s Walk', muscleGroup: 'Full Body', met: 5.0 },
  { name: 'Tire Flip', muscleGroup: 'Full Body', met: 8.0 },
  { name: 'Sled Push', muscleGroup: 'Full Body', met: 8.5 },
]

export function getExercisesByGroup(group) {
  return EXERCISES.filter(e => e.muscleGroup === group)
}

export function searchExercises(query) {
  if (!query || query.trim().length < 1) return []
  const q = query.toLowerCase()
  return EXERCISES.filter(e => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q))
}
