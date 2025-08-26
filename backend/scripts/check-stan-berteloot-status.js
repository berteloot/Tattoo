#!/usr/bin/env node

/**
 * Check Status of stan@berteloot.org User
 * This script will show if the user exists, is active, and what their current status is
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStanBertelootStatus() {
  try {
    console.log('🔍 Checking status of stan@berteloot.org...\n');
    
    const user = await prisma.user.findUnique({
      where: { email: 'stan@berteloot.org' },
      include: {
        artistProfile: {
          select: {
            id: true,
            verificationStatus: true,
            isVerified: true,
            studioName: true,
            bio: true
          }
        }
      }
    });
    
    if (user) {
      console.log('✅ Stan User Found:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Email Verified:', user.emailVerified);
      console.log('Is Active:', user.isActive);
      console.log('Created At:', user.createdAt);
      console.log('Updated At:', user.updatedAt);
      
      if (user.artistProfile) {
        console.log('\n🎨 Artist Profile:');
        console.log('Profile ID:', user.artistProfile.id);
        console.log('Verification Status:', user.artistProfile.verificationStatus);
        console.log('Is Verified:', user.artistProfile.isVerified);
        console.log('Studio Name:', user.artistProfile.studioName || 'Not set');
        console.log('Bio:', user.artistProfile.bio || 'Not set');
      } else {
        console.log('\n❌ No artist profile found');
      }
      
      // Check if user can login
      if (!user.isActive) {
        console.log('\n⚠️  USER IS DEACTIVATED (Soft Delete)');
        console.log('This user cannot login but still exists in the database');
        console.log('To permanently delete, use the "Delete Forever" option in admin panel');
      } else {
        console.log('\n✅ User is active and can login');
      }
    } else {
      console.log('❌ Stan user not found');
      console.log('This means the user was either never created or was permanently deleted');
    }
    
    // Also check for any other users with similar emails
    console.log('\n🔍 Checking for similar email addresses...');
    const similarUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: 'stan'
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    if (similarUsers.length > 0) {
      console.log(`Found ${similarUsers.length} user(s) with 'stan' in email:`);
      similarUsers.forEach(user => {
        console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - ${user.role} - Active: ${user.isActive}`);
      });
    } else {
      console.log('No users found with "stan" in email');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkStanBertelootStatus().catch(console.error);
