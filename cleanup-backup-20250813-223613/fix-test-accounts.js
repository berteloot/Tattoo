const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixTestAccounts() {
  try {
    console.log('🔄 Fixing test accounts...')
    
    // Update all test accounts to have emailVerified: true
    const testEmails = [
      'admin@tattoolocator.com',
      'client@example.com', 
      'artist@example.com',
      'lisa@example.com',
      'david@example.com',
      'emma@example.com',
      'marcus@example.com',
      'pending@example.com'
    ]
    
    const updatedUsers = await prisma.user.updateMany({
      where: {
        email: {
          in: testEmails
        }
      },
      data: {
        emailVerified: true
      }
    })
    
    console.log(`✅ Updated ${updatedUsers.count} test accounts`)
    
    // Verify the updates
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: testEmails
        }
      },
      select: {
        email: true,
        emailVerified: true,
        role: true
      }
    })
    
    console.log('\n📋 Test accounts status:')
    users.forEach(user => {
      console.log(`${user.email} (${user.role}): emailVerified = ${user.emailVerified}`)
    })
    
  } catch (error) {
    console.error('❌ Error fixing test accounts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTestAccounts() 