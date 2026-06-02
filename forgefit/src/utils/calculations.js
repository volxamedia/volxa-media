export function calculateMacroTargets(weightLbs, goal) {
  let calories, protein, fat, carbs

  switch (goal) {
    case 'cut':
      calories = Math.round(weightLbs * 12)
      protein = Math.round(weightLbs * 1.05)
      fat = Math.round(weightLbs * 0.33)
      break
    case 'bulk':
      calories = Math.round(weightLbs * 17)
      protein = Math.round(weightLbs * 0.9)
      fat = Math.round(weightLbs * 0.4)
      break
    case 'maintain':
      calories = Math.round(weightLbs * 15)
      protein = Math.round(weightLbs * 0.85)
      fat = Math.round(weightLbs * 0.35)
      break
    case 'recomp':
    default:
      calories = Math.round(weightLbs * 14)
      protein = Math.round(weightLbs * 1.0)
      fat = Math.round(weightLbs * 0.35)
  }

  carbs = Math.max(50, Math.round((calories - protein * 4 - fat * 9) / 4))
  return { calories, protein, carbs, fat }
}

// Calories burned via MET: (MET × weight_kg × 3.5) / 200 = cal/min
export function calcWorkoutCalories(exercises, weightLbs) {
  const weightKg = weightLbs * 0.453592
  let total = 0
  exercises.forEach(ex => {
    const totalSets = ex.sets.reduce((acc, s) => acc + (s.reps > 0 ? 1 : 0), 0)
    if (totalSets === 0) return
    const durationMin = totalSets * 3.5
    const calPerMin = (ex.met * weightKg * 3.5) / 200
    total += calPerMin * durationMin
  })
  return Math.round(total)
}

export function calcStepsCalories(steps, weightLbs) {
  // ~0.04 cal per step at 150 lbs, scales with weight
  return Math.round(steps * 0.04 * (weightLbs / 150))
}

export function calcExerciseVolumeKg(sets) {
  return sets.reduce((acc, s) => acc + (s.reps || 0) * (s.weight || 0), 0)
}

export function calcExerciseCals(sets, met, weightLbs) {
  const validSets = sets.filter(s => s.reps > 0)
  if (validSets.length === 0) return 0
  const weightKg = weightLbs * 0.453592
  const durationMin = validSets.length * 3.5
  const calPerMin = (met * weightKg * 3.5) / 200
  return Math.round(calPerMin * durationMin)
}

export function calculateHealthScore(food) {
  if (!food.calories || food.calories === 0) return 5
  let score = 5

  const proteinPct = (food.protein * 4) / food.calories
  if (proteinPct >= 0.4) score += 2.5
  else if (proteinPct >= 0.25) score += 1.5
  else if (proteinPct >= 0.15) score += 0.5
  else if (proteinPct < 0.05) score -= 1

  if (food.fiber >= 6) score += 1.5
  else if (food.fiber >= 3) score += 0.75
  else if (food.fiber >= 1) score += 0.25

  if (food.sugar > 25) score -= 2
  else if (food.sugar > 15) score -= 1.5
  else if (food.sugar > 8) score -= 0.75

  if (food.saturatedFat > 12) score -= 1.5
  else if (food.saturatedFat > 6) score -= 0.75

  const wholeFoodCats = ['protein', 'dairy', 'grains', 'fruits', 'vegetables', 'legumes', 'nuts']
  if (wholeFoodCats.some(c => food.category.toLowerCase().includes(c))) score += 0.5

  return Math.max(1, Math.min(10, Math.round(score)))
}

export function calculateGoalFit(food, targets, macroTotals) {
  if (!targets) return 5
  const rem = {
    calories: targets.calories - macroTotals.calories,
    protein: targets.protein - macroTotals.protein,
    carbs: targets.carbs - macroTotals.carbs,
    fat: targets.fat - macroTotals.fat,
  }

  let score = 5

  if (rem.calories <= 0) {
    score -= 3
  } else {
    const calRatio = food.calories / rem.calories
    if (calRatio <= 0.25) score += 1
    else if (calRatio <= 0.5) score += 0.5
    else if (calRatio > 1.0) score -= 2
    else if (calRatio > 0.8) score -= 1
  }

  if (rem.protein > 10 && food.protein > 0) {
    const pRatio = food.protein / rem.protein
    if (pRatio >= 0.2 && pRatio <= 0.6) score += 2
    else if (pRatio > 0) score += 0.5
  }

  if (rem.carbs < -10 && food.carbs > 20) score -= 1
  if (rem.fat < -5 && food.fat > 10) score -= 1

  return Math.max(1, Math.min(10, Math.round(score)))
}

export function getHealthScoreColor(score) {
  if (score >= 8) return '#22c55e'
  if (score >= 6) return '#84cc16'
  if (score >= 4) return '#f59e0b'
  return '#ef4444'
}

export function sumMacros(entries) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
      fiber: acc.fiber + (e.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  )
}
