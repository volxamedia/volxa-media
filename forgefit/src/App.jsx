import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { ProfileSetup } from './components/ProfileSetup'
import { FoodLog } from './components/FoodLog'
import { WorkoutLog } from './components/WorkoutLog'
import { StepsTracker } from './components/StepsTracker'
import { Progress } from './components/Progress'
import { ProfileTab } from './components/ProfileTab'
import { storage } from './utils/storage'
import { getDateKey } from './utils/dateUtils'
import { sumMacros } from './utils/calculations'

export default function App() {
  const [profile, setProfile] = useState(() => storage.get('forgefit_profile'))
  const [activeTab, setActiveTab] = useState('food')
  const [foodLogs, setFoodLogs] = useState(() => storage.get('forgefit_food_logs') || {})
  const [workoutLogs, setWorkoutLogs] = useState(() => storage.get('forgefit_workout_logs') || {})
  const [stepsLogs, setStepsLogs] = useState(() => storage.get('forgefit_steps_logs') || {})

  const today = getDateKey()

  useEffect(() => { storage.set('forgefit_food_logs', foodLogs) }, [foodLogs])
  useEffect(() => { storage.set('forgefit_workout_logs', workoutLogs) }, [workoutLogs])
  useEffect(() => { storage.set('forgefit_steps_logs', stepsLogs) }, [stepsLogs])

  const todayFoodLog = foodLogs[today] || []
  const todayWorkoutLog = workoutLogs[today] || []
  const todaySteps = stepsLogs[today] || 0
  const macroTotals = sumMacros(todayFoodLog)

  function addFoodEntry(entry) {
    setFoodLogs(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), entry],
    }))
  }

  function removeFoodEntry(id) {
    setFoodLogs(prev => ({
      ...prev,
      [today]: (prev[today] || []).filter(e => e.id !== id),
    }))
  }

  function saveWorkoutEntry(entry) {
    setWorkoutLogs(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), entry],
    }))
  }

  function setSteps(steps) {
    setStepsLogs(prev => ({ ...prev, [today]: Math.max(0, steps) }))
  }

  function handleProfileSave(data) {
    storage.set('forgefit_profile', data)
    setProfile(data)
  }

  if (!profile) {
    return <ProfileSetup onComplete={handleProfileSave} />
  }

  return (
    <div className="app">
      <Header profile={profile} macroTotals={macroTotals} />
      <main className="main-content">
        {activeTab === 'food' && (
          <FoodLog
            foodLog={todayFoodLog}
            onAdd={addFoodEntry}
            onRemove={removeFoodEntry}
            profile={profile}
            macroTotals={macroTotals}
          />
        )}
        {activeTab === 'workout' && (
          <WorkoutLog
            workoutLog={todayWorkoutLog}
            allWorkoutLogs={workoutLogs}
            onSave={saveWorkoutEntry}
            profile={profile}
          />
        )}
        {activeTab === 'steps' && (
          <StepsTracker
            todaySteps={todaySteps}
            stepsLogs={stepsLogs}
            onUpdate={setSteps}
            profile={profile}
          />
        )}
        {activeTab === 'progress' && (
          <Progress
            foodLogs={foodLogs}
            workoutLogs={workoutLogs}
            stepsLogs={stepsLogs}
            profile={profile}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileTab profile={profile} onUpdate={handleProfileSave} />
        )}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
