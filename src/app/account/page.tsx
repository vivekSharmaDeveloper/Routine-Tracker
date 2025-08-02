'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Mail, Edit2, Save, X, Clock, Edit, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { useToast } from '@/src/components/ui/Toast'
import { useTheme } from '@/src/contexts/ThemeContext'
import { useSession } from 'next-auth/react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/src/app/lib/store'
import { setStreakGoal } from '@/src/app/lib/habitSlice'
import { isHabitDueToday } from '@/src/utils/habitUtils'
import ProtectedRoute from '@/src/components/ProtectedRoute'

interface UserData {
  name: string
  email: string
  joinedDate: string
  totalHabits: number
  completedHabits: number
  streak: number
  profileImage: string | null
  id?: string
  lastLogin?: string | null
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const dispatch = useDispatch<AppDispatch>()
  const habits = useSelector((state: RootState) => state.habit.habits)
  const streakGoal = useSelector((state: RootState) => state.habit.streakGoal)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [lastLogin, setLastLogin] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showStreakGoalModal, setShowStreakGoalModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error } = useToast()
  useTheme() // Remove unused theme

  // Real user data from database
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    joinedDate: '',
    totalHabits: 0,
    completedHabits: 0,
    streak: 0,
    profileImage: null
  })

  const [editData, setEditData] = useState({
    name: '',
    email: ''
  })

  // Fetch user data from database when session is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'loading') return;
      
      if (status === 'authenticated' && session?.user) {
        setIsLoadingData(true);
        try {
          // Fetch user profile data
          const userResponse = await fetch('/api/user');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Set user data (statistics are now calculated from Redux habits in real-time)
            const updatedUserData = {
              name: userData.name || session.user.name || '',
              email: userData.email || session.user.email || '',
              joinedDate: userData.joinedDate || new Date().toISOString(),
              totalHabits: 0, // Will be calculated from habits state
              completedHabits: 0, // Will be calculated from habits state
              streak: 0, // Will be calculated from habits state
              profileImage: userData.profileImage || userData.image || session.user.image || null,
              id: userData.id,
              lastLogin: userData.lastLogin
            };

            setUserData(updatedUserData);
            setEditData({
              name: updatedUserData.name,
              email: updatedUserData.email
            });
            setProfileImage(updatedUserData.profileImage);
            setLastLogin(updatedUserData.lastLogin);
          } else {
            // Fallback to session data if API fails
            const fallbackData = {
              name: session.user.name || '',
              email: session.user.email || '',
              joinedDate: new Date().toISOString(),
              totalHabits: 0,
              completedHabits: 0,
              streak: 0,
              profileImage: session.user.image || null
            };
            setUserData(fallbackData);
            setEditData({
              name: fallbackData.name,
              email: fallbackData.email
            });
            setProfileImage(fallbackData.profileImage);
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          error('Data Load Failed', 'Failed to load profile data. Please refresh the page.');
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchUserData();
  }, [session, status, error])

  // Real-time statistics calculation based on habits state
  const calculateStatistics = () => {
    const todayIso = new Date().toISOString().split('T')[0];
    
    const totalDueToday = habits.filter(habit => 
      !habit.isCompleted && isHabitDueToday(habit, todayIso)
    ).length;
    
    const completedToday = habits.filter(habit => 
      !habit.isCompleted && 
      isHabitDueToday(habit, todayIso) && 
      habit.statusByDate?.[todayIso] === 'done'
    ).length;
    
    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateIso = checkDate.toISOString().split('T')[0];
      
      const dueHabits = habits.filter(habit => 
        !habit.isCompleted && isHabitDueToday(habit, dateIso)
      );
      
      if (dueHabits.length === 0) continue;
      
      const completedHabits = dueHabits.filter(habit => 
        habit.statusByDate?.[dateIso] === 'done'
      );
      
      const completionRate = (completedHabits.length / dueHabits.length) * 100;
      
      if (completionRate >= streakGoal) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return {
      totalHabits: totalDueToday,
      completedHabits: completedToday,
      streak: currentStreak
    };
  };

  // Format last login date
  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editData.name,
          email: editData.email
        })
      })
      
      if (response.ok) {
        const updatedUser = await response.json()
        setUserData(prev => ({
          ...prev,
          name: updatedUser.name,
          email: updatedUser.email
        }))
        setIsEditing(false)
        success('Profile Updated', 'Your profile has been successfully updated')
      } else {
        const errorData = await response.json()
        error('Update Failed', errorData.error || 'Failed to update profile. Please try again.')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      error('Update Failed', 'Network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: userData.name,
      email: userData.email
    })
    setIsEditing(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Invalid File', 'Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('File Too Large', 'Please select an image smaller than 5MB')
      return
    }

    setIsUploadingImage(true)
    
    try {
      const formData = new FormData()
      formData.append('profileImage', file)
      
      // Upload to backend
      const response = await fetch('/api/user/upload-profile-image', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserData(prev => ({ ...prev, profileImage: data.imageUrl }))
        setProfileImage(data.imageUrl)
        success('Profile Image Updated', 'Your profile image has been updated successfully')
      } else {
        const errorData = await response.json()
        error('Upload Failed', errorData.message || 'Failed to upload image')
      }
    } catch (err) {
      console.error('Upload error:', err)
      error('Upload Failed', 'Network error occurred while uploading image')
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Get real-time statistics
  const stats = calculateStatistics();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {/* Profile Image or Initials */}
                  {userData.profileImage || profileImage ? (
                    <img
                      src={userData.profileImage || profileImage || ''}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  
                  {/* Edit Pen Icon - Only show when editing */}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleImageClick}
                      disabled={isUploadingImage}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 rounded-full flex items-center justify-center text-white shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Upload profile image"
                    >
                      {isUploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Edit className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{userData.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">Member since {new Date(userData.joinedDate).toLocaleDateString()}</p>
                  {isEditing && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Click the pen icon to change your profile picture</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>{userData.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>{userData.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Login
                  </label>
                  <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>{lastLogin ? formatLastLogin(lastLogin) : 'Loading...'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-4/5"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Statistics</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Habits</span>
                <span className="text-2xl font-bold text-blue-600">
                  {(() => {
                    const todayIso = new Date().toISOString().split('T')[0];
                    return habits.filter(habit => !habit.isCompleted && isHabitDueToday(habit, todayIso)).length;
                  })()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="text-2xl font-bold text-green-600">
                  {(() => {
                    const todayIso = new Date().toISOString().split('T')[0];
                    return habits.filter(habit => 
                      !habit.isCompleted && 
                      isHabitDueToday(habit, todayIso) && 
                      habit.statusByDate?.[todayIso] === 'done'
                    ).length;
                  })()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                <span className="text-2xl font-bold text-orange-600">
                  {(() => {
                    // Calculate daily consistency streak
                    let streak = 0;
                    const today = new Date();
                    
                    for (let i = 0; i < 365; i++) {
                      const checkDate = new Date(today);
                      checkDate.setDate(today.getDate() - i);
                      const dateIso = checkDate.toISOString().split('T')[0];
                      
                      const dueHabits = habits.filter(habit => 
                        !habit.isCompleted && isHabitDueToday(habit, dateIso)
                      );
                      
                      if (dueHabits.length === 0) continue;
                      
                      const completedHabits = dueHabits.filter(habit => 
                        habit.statusByDate?.[dateIso] === 'done'
                      );
                      
                      const completionRate = (completedHabits.length / dueHabits.length) * 100;
                      
                      if (completionRate >= streakGoal) {
                        streak++;
                      } else {
                        break;
                      }
                    }
                    
                    return streak;
                  })()} days
                </span>
              </div>
            </div>

            {/* Dynamic Completion Rate Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Today's Completion Rate</span>
                <span>
                  {(() => {
                    const todayIso = new Date().toISOString().split('T')[0];
                    const dueHabits = habits.filter(habit => 
                      !habit.isCompleted && isHabitDueToday(habit, todayIso)
                    );
                    const completedHabits = dueHabits.filter(habit => 
                      habit.statusByDate?.[todayIso] === 'done'
                    );
                    return dueHabits.length > 0 
                      ? Math.round((completedHabits.length / dueHabits.length) * 100)
                      : 0;
                  })()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    (() => {
                      const todayIso = new Date().toISOString().split('T')[0];
                      const dueHabits = habits.filter(habit => 
                        !habit.isCompleted && isHabitDueToday(habit, todayIso)
                      );
                      const completedHabits = dueHabits.filter(habit => 
                        habit.statusByDate?.[todayIso] === 'done'
                      );
                      const rate = dueHabits.length > 0 
                        ? (completedHabits.length / dueHabits.length) * 100
                        : 0;
                      
                      if (rate >= 80) return 'bg-gradient-to-r from-green-400 to-green-600';
                      if (rate >= 60) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
                      return 'bg-gradient-to-r from-red-400 to-red-600';
                    })()
                  }`}
                  style={{ 
                    width: `${(() => {
                      const todayIso = new Date().toISOString().split('T')[0];
                      const dueHabits = habits.filter(habit => 
                        !habit.isCompleted && isHabitDueToday(habit, todayIso)
                      );
                      const completedHabits = dueHabits.filter(habit => 
                        habit.statusByDate?.[todayIso] === 'done'
                      );
                      return dueHabits.length > 0 
                        ? (completedHabits.length / dueHabits.length) * 100
                        : 0;
                    })()}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Set Streak Goal Button and Slider */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 dark:text-gray-400">Streak Goal</span>
                <Button 
                  onClick={() => setShowStreakGoalModal(!showStreakGoalModal)}
                  variant="outline"
                  size="sm"
                >
                  <Target className="w-4 h-4 mr-2" />
                  {streakGoal}%
                </Button>
              </div>
              
              {showStreakGoalModal && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="10"
                      value={streakGoal}
                      onChange={(e) => dispatch(setStreakGoal(Number(e.target.value)))}
                      className="flex-1 h-2 bg-gradient-to-r from-red-300 via-yellow-300 to-green-400 rounded-lg appearance-none slider"
                    />
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={streakGoal}
                      onChange={(e) => dispatch(setStreakGoal(Number(e.target.value)))}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Set your daily completion rate goal (50-100%). Your streak counts consecutive days meeting this goal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
