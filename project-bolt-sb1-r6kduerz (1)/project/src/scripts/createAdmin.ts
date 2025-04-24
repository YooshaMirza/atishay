import { createAdminUser } from '../services/admin';

const email = 'admin@example.com';
const password = 'admin123';

createAdminUser(email, password)
  .then((userRecord) => {
    console.log('Admin user created successfully:', userRecord);
  })
  .catch((error) => {
    console.error('Error creating admin user:', error);
  });