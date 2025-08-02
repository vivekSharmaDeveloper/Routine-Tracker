import {
  passwordSchema,
  emailSchema,
  userRegistrationSchema,
  userLoginSchema,
  habitCreationSchema,
  passwordChangeSchema,
  checkPasswordStrength,
  validateInput,
  safeValidateInput,
} from '../lib/validations'

describe('Password Schema', () => {
  it('should validate a strong password', () => {
    const validPassword = 'Test123!@#'
    expect(() => passwordSchema.parse(validPassword)).not.toThrow()
  })

  it('should reject password that is too short', () => {
    const shortPassword = 'Test1!'
    expect(() => passwordSchema.parse(shortPassword)).toThrow('Password must be at least 8 characters long')
  })

  it('should reject password without lowercase letter', () => {
    const noLowercase = 'TEST123!@#'
    expect(() => passwordSchema.parse(noLowercase)).toThrow('Password must contain at least one lowercase letter')
  })

  it('should reject password without uppercase letter', () => {
    const noUppercase = 'test123!@#'
    expect(() => passwordSchema.parse(noUppercase)).toThrow('Password must contain at least one uppercase letter')
  })

  it('should reject password without number', () => {
    const noNumber = 'TestTest!@#'
    expect(() => passwordSchema.parse(noNumber)).toThrow('Password must contain at least one number')
  })

  it('should reject password without special character', () => {
    const noSpecial = 'TestTest123'
    expect(() => passwordSchema.parse(noSpecial)).toThrow('Password must contain at least one special character')
  })

  it('should reject password that is too long', () => {
    const tooLong = 'A'.repeat(129) + '1!'
    expect(() => passwordSchema.parse(tooLong)).toThrow('Password must not exceed 128 characters')
  })
})

describe('Email Schema', () => {
  it('should validate a proper email', () => {
    const validEmail = 'test@example.com'
    expect(() => emailSchema.parse(validEmail)).not.toThrow()
  })

  it('should reject invalid email format', () => {
    const invalidEmail = 'not-an-email'
    expect(() => emailSchema.parse(invalidEmail)).toThrow('Please enter a valid email address')
  })

  it('should reject email that is too short', () => {
    const shortEmail = 'a@b'
    expect(() => emailSchema.parse(shortEmail)).toThrow('Email must be at least 5 characters long')
  })

  it('should convert email to lowercase', () => {
    const mixedCaseEmail = 'Test@Example.COM'
    const result = emailSchema.parse(mixedCaseEmail)
    expect(result).toBe('test@example.com')
  })

  it('should handle email validation and transformation', () => {
    // Test that valid emails are processed correctly
    const validEmail = 'test@example.com'
    const result = emailSchema.parse(validEmail)
    expect(result).toBe('test@example.com')
  })
})

describe('User Registration Schema', () => {
  const validRegistration = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#',
    age: 25,
  }

  it('should validate a complete registration', () => {
    expect(() => userRegistrationSchema.parse(validRegistration)).not.toThrow()
  })

  it('should reject when passwords do not match', () => {
    const mismatchedPasswords = {
      ...validRegistration,
      confirmPassword: 'Different123!',
    }
    expect(() => userRegistrationSchema.parse(mismatchedPasswords)).toThrow('Passwords do not match')
  })

  it('should reject username that is too short', () => {
    const shortUsername = {
      ...validRegistration,
      username: 'ab',
    }
    expect(() => userRegistrationSchema.parse(shortUsername)).toThrow('Username must be at least 3 characters long')
  })

  it('should reject invalid username characters', () => {
    const invalidUsername = {
      ...validRegistration,
      username: 'test user!',
    }
    expect(() => userRegistrationSchema.parse(invalidUsername)).toThrow('Username can only contain letters, numbers, underscores, and hyphens')
  })

  it('should reject age under 13', () => {
    const youngAge = {
      ...validRegistration,
      age: 12,
    }
    expect(() => userRegistrationSchema.parse(youngAge)).toThrow('You must be at least 13 years old')
  })

  it('should reject unrealistic age', () => {
    const unrealisticAge = {
      ...validRegistration,
      age: 150,
    }
    expect(() => userRegistrationSchema.parse(unrealisticAge)).toThrow('Age must be realistic')
  })
})

describe('User Login Schema', () => {
  it('should validate proper login credentials', () => {
    const validLogin = {
      email: 'test@example.com',
      password: 'anypassword',
    }
    expect(() => userLoginSchema.parse(validLogin)).not.toThrow()
  })

  it('should reject empty password', () => {
    const emptyPassword = {
      email: 'test@example.com',
      password: '',
    }
    expect(() => userLoginSchema.parse(emptyPassword)).toThrow('Password is required')
  })
})

describe('Habit Creation Schema', () => {
  const validHabit = {
    name: 'Exercise',
    goal: 'Exercise for 30 minutes daily',
    frequency: {
      type: 'daily' as const,
    },
  }

  it('should validate a daily habit', () => {
    expect(() => habitCreationSchema.parse(validHabit)).not.toThrow()
  })

  it('should validate a weekly habit with specific days', () => {
    const weeklyHabit = {
      ...validHabit,
      frequency: {
        type: 'weekly' as const,
        days: [1, 3, 5], // Monday, Wednesday, Friday
      },
    }
    expect(() => habitCreationSchema.parse(weeklyHabit)).not.toThrow()
  })

  it('should reject empty habit name', () => {
    const emptyName = {
      ...validHabit,
      name: '',
    }
    expect(() => habitCreationSchema.parse(emptyName)).toThrow('Habit name is required')
  })

  it('should reject habit name that is too long', () => {
    const longName = {
      ...validHabit,
      name: 'A'.repeat(101),
    }
    expect(() => habitCreationSchema.parse(longName)).toThrow('Habit name must not exceed 100 characters')
  })

  it('should reject invalid frequency type', () => {
    const invalidFrequency = {
      ...validHabit,
      frequency: {
        type: 'invalid' as any,
      },
    }
    expect(() => habitCreationSchema.parse(invalidFrequency)).toThrow('Invalid frequency type')
  })
})

describe('Password Change Schema', () => {
  const validPasswordChange = {
    currentPassword: 'OldPass123!',
    newPassword: 'NewPass123!',
    confirmNewPassword: 'NewPass123!',
  }

  it('should validate proper password change', () => {
    expect(() => passwordChangeSchema.parse(validPasswordChange)).not.toThrow()
  })

  it('should reject when new passwords do not match', () => {
    const mismatchedNewPasswords = {
      ...validPasswordChange,
      confirmNewPassword: 'Different123!',
    }
    expect(() => passwordChangeSchema.parse(mismatchedNewPasswords)).toThrow('New passwords do not match')
  })

  it('should reject when new password is same as current', () => {
    const samePassword = {
      ...validPasswordChange,
      newPassword: 'OldPass123!',
      confirmNewPassword: 'OldPass123!',
    }
    expect(() => passwordChangeSchema.parse(samePassword)).toThrow('New password must be different from current password')
  })
})

describe('Password Strength Checker', () => {
  it('should give high score for strong password', () => {
    const strongPassword = 'StrongP@ssw0rd123'
    const result = checkPasswordStrength(strongPassword)
    expect(result.score).toBeGreaterThan(4)
    expect(result.isStrong).toBe(true)
  })

  it('should give low score for weak password', () => {
    const weakPassword = 'weak'
    const result = checkPasswordStrength(weakPassword)
    expect(result.score).toBeLessThan(3)
    expect(result.isStrong).toBe(false)
    expect(result.feedback.length).toBeGreaterThan(0)
  })

  it('should penalize common patterns', () => {
    const commonPassword = 'password123'
    const result = checkPasswordStrength(commonPassword)
    expect(result.feedback).toContain('Avoid common patterns and words')
  })

  it('should penalize repeating characters', () => {
    const repeatingPassword = 'Teeeest123!'
    const result = checkPasswordStrength(repeatingPassword)
    expect(result.feedback).toContain('Avoid repeating characters')
  })

  it('should provide specific feedback for missing requirements', () => {
    const noUppercase = 'test123!'
    const result = checkPasswordStrength(noUppercase)
    expect(result.feedback).toContain('Include uppercase letters')
  })
})

describe('Validation Helper Functions', () => {
  describe('validateInput', () => {
    it('should return parsed data for valid input', () => {
      const validEmail = 'test@example.com'
      const result = validateInput(emailSchema, validEmail)
      expect(result).toBe('test@example.com')
    })

    it('should throw error for invalid input', () => {
      const invalidEmail = 'not-an-email'
      expect(() => validateInput(emailSchema, invalidEmail)).toThrow()
    })
  })

  describe('safeValidateInput', () => {
    it('should return success for valid input', () => {
      const validEmail = 'test@example.com'
      const result = safeValidateInput(emailSchema, validEmail)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('test@example.com')
      }
    })

    it('should return error for invalid input', () => {
      const invalidEmail = 'not-an-email'
      const result = safeValidateInput(emailSchema, invalidEmail)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })
  })
})
