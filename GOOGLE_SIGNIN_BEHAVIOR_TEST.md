# Google Sign-In Behavior Test

## Test Scenario: Multiple Google Sign-Ins

### Expected Behavior:

- **First Sign-In**: Creates new user account
- **Subsequent Sign-Ins**: Updates existing user account (same user ID)
- **User Activities**: All activities remain associated with the same user

### Test Steps:

1. **First Google Sign-In**

   ```
   User: john@gmail.com
   Action: Sign in with Google
   Result: New user created with ID "user_123"
   ```

2. **Create Some Activities**

   ```
   User creates services, makes bookings, etc.
   All activities linked to user_123
   ```

3. **Sign Out and Sign In Again**

   ```
   User: john@gmail.com (same email)
   Action: Sign in with Google again
   Result: Updates existing user_123 (NOT creates new user)
   ```

4. **Verify Activities**
   ```
   All previous services, bookings, etc. should still be there
   User ID should be the same: "user_123"
   ```

### Backend Logic Verification:

```typescript
// 1. Find existing user by email
const existingUser = await prisma.user.findUnique({
  where: { email: "john@gmail.com" },
});

// 2. If user exists, UPDATE (not create)
if (existingUser) {
  // Updates existing user with same ID
  user = await prisma.user.update({
    where: { id: existingUser.id }, // Same ID!
    data: {
      /* updated data */
    },
  });
} else {
  // Only creates new user if no existing user found
  user = await prisma.user.create({
    data: {
      /* new user data */
    },
  });
}
```

### Key Points:

1. **User Identification**: Based on email address
2. **Account Persistence**: Same user ID maintained across sign-ins
3. **Activity Association**: All user activities linked to same user ID
4. **Data Updates**: Profile info updated on each sign-in (name, avatar, etc.)
5. **Relationships Preserved**: Vendor/Salesman/Admin roles maintained

### Conclusion:

✅ **The current implementation correctly maintains user identity and associations across multiple Google Sign-Ins.**
